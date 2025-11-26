import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { paypalRequest } from "../_shared/paypalClient.ts";

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

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      throw new Error('No active subscription found');
    }

    if (!subscription.paypal_subscription_id) {
      throw new Error('PayPal subscription ID not found');
    }

    // Cancel subscription in PayPal
    const cancelResponse = await paypalRequest(
      `/v1/billing/subscriptions/${subscription.paypal_subscription_id}/cancel`,
      'POST',
      {
        reason: 'User requested cancellation',
      }
    );

    if (!cancelResponse.ok && cancelResponse.status !== 204) {
      const error = await cancelResponse.text();
      throw new Error(`Failed to cancel PayPal subscription: ${error}`);
    }

    // Update local subscription
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancel_at_period_end: true,
      })
      .eq('id', subscription.id);

    console.log('Subscription canceled:', subscription.paypal_subscription_id);

    return new Response(
      JSON.stringify({ success: true, message: 'Subscription canceled successfully' }),
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
