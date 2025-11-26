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

    console.log('Starting dunning process...');

    const now = new Date();
    
    // Find subscriptions in past_due status that need dunning
    const { data: pastDueSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('status', 'past_due')
      .or('grace_period_end.is.null,grace_period_end.gt.' + now.toISOString());

    if (fetchError) {
      console.error('Error fetching past due subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pastDueSubscriptions?.length || 0} past due subscriptions`);

    const results = {
      processed: 0,
      reminded: 0,
      suspended: 0,
      errors: 0,
    };

    for (const subscription of pastDueSubscriptions || []) {
      try {
        results.processed++;
        
        // Set grace period if not set (7 days from now)
        if (!subscription.grace_period_end) {
          const gracePeriodEnd = new Date();
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
          
          await supabase
            .from('subscriptions')
            .update({
              grace_period_end: gracePeriodEnd.toISOString(),
              dunning_count: 0,
            })
            .eq('id', subscription.id);

          console.log(`Set grace period for subscription ${subscription.id}`);
          continue;
        }

        const gracePeriodEnd = new Date(subscription.grace_period_end);
        const dunningCount = subscription.dunning_count || 0;
        const lastDunningEmail = subscription.last_dunning_email 
          ? new Date(subscription.last_dunning_email) 
          : null;

        // Check if grace period has expired
        if (now > gracePeriodEnd) {
          // Suspend subscription
          await supabase
            .from('subscriptions')
            .update({ status: 'suspended' })
            .eq('id', subscription.id);

          await supabase
            .from('profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', subscription.user_id);

          // Send final suspension email
          supabase.functions.invoke('send-subscription-notification', {
            body: {
              userId: subscription.user_id,
              eventType: 'subscription_cancelled',
              data: {
                plan_name: subscription.plan.name,
                end_date: now.toISOString(),
              },
            },
          }).catch(err => console.error('Failed to send suspension email:', err));

          results.suspended++;
          console.log(`Suspended subscription ${subscription.id}`);
          continue;
        }

        // Determine if we should send a dunning email
        let shouldSendEmail = false;
        let reminderType = '';

        if (dunningCount === 0) {
          // First reminder: immediately
          shouldSendEmail = true;
          reminderType = 'first';
        } else if (dunningCount === 1) {
          // Second reminder: 3 days after first
          const daysSinceLastEmail = lastDunningEmail 
            ? (now.getTime() - lastDunningEmail.getTime()) / (1000 * 60 * 60 * 24)
            : 999;
          if (daysSinceLastEmail >= 3) {
            shouldSendEmail = true;
            reminderType = 'second';
          }
        } else if (dunningCount === 2) {
          // Final reminder: 2 days before grace period ends
          const daysUntilSuspension = (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          if (daysUntilSuspension <= 2) {
            shouldSendEmail = true;
            reminderType = 'final';
          }
        }

        if (shouldSendEmail) {
          const daysUntilSuspension = Math.ceil(
            (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Send dunning reminder
          await supabase.functions.invoke('send-subscription-notification', {
            body: {
              userId: subscription.user_id,
              eventType: 'payment_failed',
              data: {
                plan_name: subscription.plan.name,
                amount: subscription.billing_period === 'yearly'
                  ? subscription.plan.price_yearly_usd
                  : subscription.plan.price_monthly_usd,
                currency: 'USD',
                retry_date: gracePeriodEnd.toISOString(),
                reason: `${reminderType === 'first' ? 'أول' : reminderType === 'second' ? 'ثاني' : 'أخير'} تذكير - سيتم تعليق الاشتراك خلال ${daysUntilSuspension} ${daysUntilSuspension === 1 ? 'يوم' : 'أيام'}`,
              },
            },
          });

          // Update dunning tracking
          await supabase
            .from('subscriptions')
            .update({
              dunning_count: dunningCount + 1,
              last_dunning_email: now.toISOString(),
            })
            .eq('id', subscription.id);

          results.reminded++;
          console.log(`Sent ${reminderType} dunning reminder for subscription ${subscription.id}`);
        }
      } catch (err) {
        console.error(`Error processing subscription ${subscription.id}:`, err);
        results.errors++;
      }
    }

    console.log('Dunning process completed:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Dunning process error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
