import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getPayPalAccessToken, paypalRequest } from "../_shared/paypalClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: hasAdminRole } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    if (!hasAdminRole) {
      throw new Error('Admin access required');
    }

    const accessToken = await getPayPalAccessToken();

    // Create Product
    const productResponse = await paypalRequest('/v1/catalogs/products', 'POST', {
      name: 'PreShoot Subscription',
      description: 'AI-powered content research and script generation platform',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }, accessToken);

    if (!productResponse.ok) {
      const error = await productResponse.text();
      throw new Error(`Failed to create product: ${error}`);
    }

    const product = await productResponse.json();
    const productId = product.id;

    console.log('Created PayPal product:', productId);

    // Get plans from database
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .neq('slug', 'free')
      .order('sort_order');

    if (plansError || !plans) {
      throw new Error('Failed to fetch plans from database');
    }

    // Create billing plans for each subscription
    for (const plan of plans) {
      // Monthly plan
      const monthlyPlanResponse = await paypalRequest('/v1/billing/plans', 'POST', {
        product_id: productId,
        name: `${plan.name} - Monthly`,
        description: `${plan.name_ar} - اشتراك شهري`,
        status: 'ACTIVE',
        billing_cycles: [{
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: plan.price_monthly_usd.toString(),
              currency_code: 'USD',
            },
          },
        }],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      }, accessToken);

      if (!monthlyPlanResponse.ok) {
        const error = await monthlyPlanResponse.text();
        console.error(`Failed to create monthly plan for ${plan.name}:`, error);
        continue;
      }

      const monthlyPlan = await monthlyPlanResponse.json();
      console.log(`Created monthly plan for ${plan.name}:`, monthlyPlan.id);

      // Yearly plan
      if (plan.price_yearly_usd) {
        const yearlyPlanResponse = await paypalRequest('/v1/billing/plans', 'POST', {
          product_id: productId,
          name: `${plan.name} - Yearly`,
          description: `${plan.name_ar} - اشتراك سنوي`,
          status: 'ACTIVE',
          billing_cycles: [{
            frequency: {
              interval_unit: 'YEAR',
              interval_count: 1,
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: {
                value: plan.price_yearly_usd.toString(),
                currency_code: 'USD',
              },
            },
          }],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee_failure_action: 'CONTINUE',
            payment_failure_threshold: 3,
          },
        }, accessToken);

        if (!yearlyPlanResponse.ok) {
          const error = await yearlyPlanResponse.text();
          console.error(`Failed to create yearly plan for ${plan.name}:`, error);
          continue;
        }

        const yearlyPlan = await yearlyPlanResponse.json();
        console.log(`Created yearly plan for ${plan.name}:`, yearlyPlan.id);

        // Update database with plan IDs
        await supabase
          .from('subscription_plans')
          .update({
            paypal_product_id: productId,
            paypal_plan_id_monthly: monthlyPlan.id,
            paypal_plan_id_yearly: yearlyPlan.id,
          })
          .eq('id', plan.id);
      } else {
        // Update database with monthly plan ID only
        await supabase
          .from('subscription_plans')
          .update({
            paypal_product_id: productId,
            paypal_plan_id_monthly: monthlyPlan.id,
          })
          .eq('id', plan.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, productId, message: 'PayPal plans created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
