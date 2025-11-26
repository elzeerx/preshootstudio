import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { Resend } from 'https://esm.sh/resend@4.0.0';
import { getSubscriptionActivatedTemplate } from './_templates/subscription-activated.ts';
import { getPlanChangedTemplate } from './_templates/plan-changed.ts';
import { getPaymentFailedTemplate } from './_templates/payment-failed.ts';
import { getUpcomingRenewalTemplate } from './_templates/upcoming-renewal.ts';
import { getSubscriptionCancelledTemplate } from './_templates/subscription-cancelled.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'subscription_activated' | 'plan_changed' | 'payment_failed' | 'upcoming_renewal' | 'subscription_cancelled';
  user_id: string;
  data: {
    plan_name?: string;
    plan_name_ar?: string;
    billing_period?: string;
    amount?: number;
    currency?: string;
    renewal_date?: string;
    old_plan_name?: string;
    new_plan_name?: string;
    next_billing_date?: string;
    retry_date?: string;
    reason?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, user_id, data }: NotificationRequest = await req.json();

    // Fetch user email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      throw new Error('User not found');
    }

    console.log(`Sending ${type} notification to ${profile.email}`);

    let html: string;
    let subject: string;
    const userName = profile.full_name || 'عزيزنا المستخدم';

    // Generate appropriate email template based on notification type
    switch (type) {
      case 'subscription_activated':
        html = getSubscriptionActivatedTemplate({
          user_name: userName,
          plan_name: data.plan_name_ar || data.plan_name || '',
          billing_period: data.billing_period === 'yearly' ? 'سنوي' : 'شهري',
          amount: data.amount || 0,
          currency: data.currency || 'USD',
          next_billing_date: data.next_billing_date || '',
        });
        subject = 'تم تفعيل اشتراكك في PreShoot Studio';
        break;

      case 'plan_changed':
        html = getPlanChangedTemplate({
          user_name: userName,
          old_plan_name: data.old_plan_name || '',
          new_plan_name: data.new_plan_name || '',
          billing_period: data.billing_period === 'yearly' ? 'سنوي' : 'شهري',
          amount: data.amount || 0,
          currency: data.currency || 'USD',
        });
        subject = 'تم تغيير خطة اشتراكك في PreShoot Studio';
        break;

      case 'payment_failed':
        html = getPaymentFailedTemplate({
          user_name: userName,
          plan_name: data.plan_name_ar || data.plan_name || '',
          amount: data.amount || 0,
          currency: data.currency || 'USD',
          retry_date: data.retry_date || '',
          reason: data.reason || '',
        });
        subject = 'فشل الدفع - يرجى تحديث معلومات الدفع';
        break;

      case 'upcoming_renewal':
        html = getUpcomingRenewalTemplate({
          user_name: userName,
          plan_name: data.plan_name_ar || data.plan_name || '',
          billing_period: data.billing_period === 'yearly' ? 'سنوي' : 'شهري',
          amount: data.amount || 0,
          currency: data.currency || 'USD',
          renewal_date: data.renewal_date || '',
        });
        subject = 'تذكير: تجديد اشتراكك قريباً';
        break;

      case 'subscription_cancelled':
        html = getSubscriptionCancelledTemplate({
          user_name: userName,
          plan_name: data.plan_name_ar || data.plan_name || '',
          end_date: data.renewal_date || '',
        });
        subject = 'تم إلغاء اشتراكك في PreShoot Studio';
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'PreShoot Studio <contact@preshootstudio.com>',
      to: [profile.email],
      subject: subject,
      html: html,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    console.log(`Successfully sent ${type} notification to ${profile.email}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send notification';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
