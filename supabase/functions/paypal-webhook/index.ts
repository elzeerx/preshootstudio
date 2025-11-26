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

    const webhook = await req.json();
    const eventType = webhook.event_type;
    
    console.log('Received PayPal webhook:', eventType);

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionData = webhook.resource;
        const userId = subscriptionData.custom_id;
        const paypalSubscriptionId = subscriptionData.id;
        const paypalEmail = subscriptionData.subscriber?.email_address;
        const paypalPayerId = subscriptionData.subscriber?.payer_id;
        const planId = subscriptionData.plan_id;

        // Find the plan in our database
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .or(`paypal_plan_id_monthly.eq.${planId},paypal_plan_id_yearly.eq.${planId}`)
          .single();

        if (!plan) {
          console.error('Plan not found for PayPal plan ID:', planId);
          break;
        }

        const billingPeriod = plan.paypal_plan_id_yearly === planId ? 'yearly' : 'monthly';
        const billingInfo = subscriptionData.billing_info;
        const nextBillingTime = billingInfo?.next_billing_time;

        // Create or update subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: plan.id,
            status: 'active',
            paypal_subscription_id: paypalSubscriptionId,
            paypal_payer_id: paypalPayerId,
            paypal_email: paypalEmail,
            billing_period: billingPeriod,
            current_period_start: new Date().toISOString(),
            current_period_end: nextBillingTime,
            projects_used_this_period: 0,
          }, {
            onConflict: 'user_id',
          });

        if (subError) {
          console.error('Error creating subscription:', subError);
        }

        // Update user's subscription tier
        await supabase
          .from('profiles')
          .update({ subscription_tier: plan.slug })
          .eq('id', userId);

        // Send subscription activated email
        const amount = billingPeriod === 'yearly' ? plan.price_yearly_usd : plan.price_monthly_usd;
        supabase.functions.invoke('send-subscription-notification', {
          body: {
            userId,
            eventType: 'subscription_activated',
            data: {
              plan_name: plan.name,
              billing_period: billingPeriod === 'yearly' ? 'سنوي' : 'شهري',
              amount,
              currency: 'USD',
              next_billing_date: nextBillingTime,
            },
          },
        }).catch(err => console.error('Failed to send activation email:', err));

        console.log('Subscription activated for user:', userId);
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const saleData = webhook.resource;
        const paypalSubscriptionId = saleData.billing_agreement_id;
        const amount = parseFloat(saleData.amount?.total || '0');
        const transactionId = saleData.id;

        // Find subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('paypal_subscription_id', paypalSubscriptionId)
          .single();

        if (!subscription) {
          console.error('Subscription not found for PayPal ID:', paypalSubscriptionId);
          break;
        }

        // Log payment
        await supabase
          .from('payment_history')
          .insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            paypal_transaction_id: transactionId,
            paypal_subscription_id: paypalSubscriptionId,
            amount,
            currency: 'USD',
            status: 'completed',
            plan_slug: subscription.plan.slug,
            plan_name: subscription.plan.name,
            billing_period: subscription.billing_period,
            paypal_event_id: webhook.id,
            paypal_event_type: eventType,
            raw_payload: webhook,
          });

        // Reset monthly usage counter
        await supabase
          .from('subscriptions')
          .update({ projects_used_this_period: 0 })
          .eq('id', subscription.id);

        console.log('Payment processed for subscription:', paypalSubscriptionId);
        break;
      }

      case 'PAYMENT.SALE.DENIED':
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        const failureData = webhook.resource;
        const paypalSubscriptionId = failureData.billing_agreement_id || failureData.id;

        // Find subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('paypal_subscription_id', paypalSubscriptionId)
          .single();

        if (!subscription) {
          console.error('Subscription not found for PayPal ID:', paypalSubscriptionId);
          break;
        }

        // Send payment failed email
        const retryDate = new Date();
        retryDate.setDate(retryDate.getDate() + 3); // Retry in 3 days

        supabase.functions.invoke('send-subscription-notification', {
          body: {
            userId: subscription.user_id,
            eventType: 'payment_failed',
            data: {
              plan_name: subscription.plan.name,
              amount: subscription.billing_period === 'yearly' 
                ? subscription.plan.price_yearly_usd 
                : subscription.plan.price_monthly_usd,
              currency: 'USD',
              retry_date: retryDate.toISOString(),
              reason: failureData.reason || 'فشل الدفع',
            },
          },
        }).catch(err => console.error('Failed to send payment failure email:', err));

        console.log('Payment failed for subscription:', paypalSubscriptionId);
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionData = webhook.resource;
        const paypalSubscriptionId = subscriptionData.id;

        // Update subscription status
        const { data: subscription } = await supabase
          .from('subscriptions')
          .update({ 
            status: eventType === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'canceled' : 
                    eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ? 'suspended' : 'expired',
            canceled_at: new Date().toISOString(),
          })
          .eq('paypal_subscription_id', paypalSubscriptionId)
          .select('*, plan:subscription_plans(*)')
          .single();

        if (subscription) {
          // Downgrade to free
          await supabase
            .from('profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', subscription.user_id);

          // Send cancellation email
          supabase.functions.invoke('send-subscription-notification', {
            body: {
              userId: subscription.user_id,
              eventType: 'subscription_cancelled',
              data: {
                plan_name: subscription.plan.name,
                end_date: subscription.current_period_end || new Date().toISOString(),
              },
            },
          }).catch(err => console.error('Failed to send cancellation email:', err));

          console.log('Subscription cancelled/suspended/expired:', paypalSubscriptionId);
        }
        break;
      }

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
