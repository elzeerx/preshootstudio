import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    console.log('Starting renewal reminder job...');

    // Calculate date range: 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const fourDaysFromNow = new Date();
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);

    // Find active subscriptions with renewal coming up in 3 days
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('status', 'active')
      .gte('current_period_end', threeDaysFromNow.toISOString())
      .lt('current_period_end', fourDaysFromNow.toISOString());

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to notify`);

    // Send renewal reminder emails
    const emailPromises = (subscriptions || []).map(async (subscription) => {
      try {
        const amount = subscription.billing_period === 'yearly'
          ? subscription.plan.price_yearly_usd
          : subscription.plan.price_monthly_usd;

        await supabase.functions.invoke('send-subscription-notification', {
          body: {
            userId: subscription.user_id,
            eventType: 'upcoming_renewal',
            data: {
              plan_name: subscription.plan.name,
              billing_period: subscription.billing_period === 'yearly' ? 'سنوي' : 'شهري',
              amount,
              currency: 'USD',
              renewal_date: subscription.current_period_end,
            },
          },
        });

        console.log(`Sent renewal reminder to user: ${subscription.user_id}`);
      } catch (err) {
        console.error(`Failed to send renewal reminder to user ${subscription.user_id}:`, err);
      }
    });

    await Promise.all(emailPromises);

    console.log('Renewal reminder job completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: subscriptions?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Renewal reminder job error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
