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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { planSlug, billingPeriod } = await req.json();

    if (!planSlug || !billingPeriod) {
      throw new Error('Missing required fields: planSlug, billingPeriod');
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('slug', planSlug)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Get PayPal plan ID
    const paypalPlanId = billingPeriod === 'yearly' 
      ? plan.paypal_plan_id_yearly 
      : plan.paypal_plan_id_monthly;

    if (!paypalPlanId) {
      throw new Error('PayPal plan ID not configured. Admin must run setup-paypal-plans first.');
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    const appUrl = Deno.env.get('VITE_APP_URL') || 'https://preshootstudio.com';

    // Create PayPal subscription
    const accessToken = await getPayPalAccessToken();
    
    const subscriptionResponse = await paypalRequest('/v1/billing/subscriptions', 'POST', {
      plan_id: paypalPlanId,
      subscriber: {
        email_address: profile?.email || user.email,
        name: {
          given_name: profile?.full_name?.split(' ')[0] || 'User',
          surname: profile?.full_name?.split(' ').slice(1).join(' ') || '',
        },
      },
      application_context: {
        brand_name: 'PreShoot',
        locale: 'ar-SA',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${appUrl}/profile?subscription=success`,
        cancel_url: `${appUrl}/pricing?subscription=canceled`,
      },
      custom_id: user.id,
    }, accessToken);

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.text();
      throw new Error(`Failed to create PayPal subscription: ${error}`);
    }

    const subscription = await subscriptionResponse.json();
    
    // Find approval link
    const approvalLink = subscription.links?.find((link: any) => link.rel === 'approve');
    
    if (!approvalLink) {
      throw new Error('No approval link returned from PayPal');
    }

    console.log('Created PayPal subscription:', subscription.id);

    return new Response(
      JSON.stringify({ 
        subscriptionId: subscription.id,
        approvalUrl: approvalLink.href,
      }),
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
