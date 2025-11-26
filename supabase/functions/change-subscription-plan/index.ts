import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { getPayPalAccessToken, paypalRequest } from '../_shared/paypalClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { new_plan_slug, billing_period = 'monthly' } = await req.json();

    if (!new_plan_slug || !['monthly', 'yearly'].includes(billing_period)) {
      throw new Error('Invalid request parameters');
    }

    console.log(`Processing plan change for user ${user.id} to ${new_plan_slug} (${billing_period})`);

    // Fetch current subscription
    const { data: currentSub, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans!subscriptions_plan_id_fkey(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError || !currentSub) {
      throw new Error('No active subscription found');
    }

    // Fetch new plan details
    const { data: newPlan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('slug', new_plan_slug)
      .eq('is_active', true)
      .single();

    if (planError || !newPlan) {
      throw new Error('Invalid plan selected');
    }

    // Check if trying to change to the same plan
    if (currentSub.plan.slug === new_plan_slug && currentSub.billing_period === billing_period) {
      throw new Error('You are already on this plan with this billing period');
    }

    // Get PayPal plan ID for new plan
    const newPayPalPlanId = billing_period === 'yearly' 
      ? newPlan.paypal_plan_id_yearly 
      : newPlan.paypal_plan_id_monthly;

    if (!newPayPalPlanId) {
      throw new Error('PayPal plan not configured for selected billing period');
    }

    if (!currentSub.paypal_subscription_id) {
      throw new Error('No PayPal subscription ID found');
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Calculate effective date (immediate change)
    const effectiveDate = new Date().toISOString();

    // Prepare revision request for PayPal
    const revisionPayload = {
      plan_id: newPayPalPlanId,
      application_context: {
        brand_name: 'PreShoot Studio',
        locale: 'ar-SA',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'CONTINUE',
      }
    };

    console.log('Revising PayPal subscription:', {
      subscriptionId: currentSub.paypal_subscription_id,
      newPlanId: newPayPalPlanId,
    });

    // Call PayPal API to revise subscription
    // PayPal automatically handles prorated billing when changing plans
    const reviseResponse = await paypalRequest(
      `/v1/billing/subscriptions/${currentSub.paypal_subscription_id}/revise`,
      'POST',
      revisionPayload,
      accessToken
    );

    if (!reviseResponse.ok) {
      const errorBody = await reviseResponse.text();
      console.error('PayPal revision error:', errorBody);
      throw new Error(`PayPal subscription revision failed: ${reviseResponse.statusText}`);
    }

    const revisionData = await reviseResponse.json();
    console.log('PayPal revision successful:', revisionData);

    // Update subscription in database
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        plan_id: newPlan.id,
        billing_period: billing_period,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSub.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update subscription in database');
    }

    // Log the plan change in payment history
    await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: user.id,
        subscription_id: currentSub.id,
        paypal_subscription_id: currentSub.paypal_subscription_id,
        paypal_transaction_id: `plan_change_${Date.now()}`,
        amount: billing_period === 'yearly' ? newPlan.price_yearly_usd : newPlan.price_monthly_usd,
        currency: 'USD',
        status: 'completed',
        billing_period: billing_period,
        plan_name: newPlan.name,
        plan_slug: newPlan.slug,
        paypal_event_type: 'SUBSCRIPTION.PLAN_CHANGED',
        raw_payload: revisionData,
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم تغيير الخطة بنجاح',
        subscription: {
          plan: newPlan,
          billing_period: billing_period,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Change subscription plan error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to change subscription plan';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
