import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  price_monthly_usd: number;
  price_yearly_usd: number | null;
  project_limit_monthly: number | null;
  token_limit_monthly: number;
  redo_limit_per_tab: number;
  export_enabled: boolean;
  api_access: boolean;
  priority_support: boolean;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  billing_period: string;
  current_period_end: string | null;
  projects_used_this_period: number;
  cancel_at_period_end: boolean | null;
  plan: SubscriptionPlan;
}

interface SubscriptionLimits {
  projectsUsed: number;
  projectLimit: number;
  canExport: boolean;
  redoLimit: number;
  tokensUsed: number;
  tokenLimit: number;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [limits, setLimits] = useState<SubscriptionLimits>({
    projectsUsed: 0,
    projectLimit: 5,
    canExport: false,
    redoLimit: 1,
    tokensUsed: 0,
    tokenLimit: 50000,
  });

  const fetchSubscription = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Get subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError) throw subError;

      if (subData) {
        setSubscription(subData as Subscription);
        setPlan(subData.plan as SubscriptionPlan);
      } else {
        // Get free plan
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('slug', 'free')
          .single();

        if (freePlan) {
          setPlan(freePlan as SubscriptionPlan);
        }
      }

      // Get monthly project count
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      // Get token usage
      const { data: tokenData } = await supabase
        .rpc('get_user_monthly_token_usage', { user_id_param: user.id });

      const currentPlan = subData?.plan || plan;
      
      setLimits({
        projectsUsed: projectCount || 0,
        projectLimit: currentPlan?.project_limit_monthly || 5,
        canExport: currentPlan?.export_enabled || false,
        redoLimit: currentPlan?.redo_limit_per_tab || 1,
        tokensUsed: tokenData?.[0]?.total_tokens || 0,
        tokenLimit: currentPlan?.token_limit_monthly || 50000,
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const checkout = async (planSlug: string, period: 'monthly' | 'yearly') => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      window.location.href = '/auth?redirect=/pricing';
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
        body: { planSlug, billingPeriod: period },
      });

      if (error) throw error;

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast.error('فشل في إنشاء الاشتراك: ' + error.message);
    }
  };

  const cancel = async () => {
    try {
      const { error } = await supabase.functions.invoke('cancel-subscription');

      if (error) throw error;

      toast.success('تم إلغاء الاشتراك بنجاح');
      fetchSubscription();
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast.error('فشل في إلغاء الاشتراك: ' + error.message);
    }
  };

  const changePlan = async (newPlanSlug: string, billingPeriod: 'monthly' | 'yearly') => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('change-subscription-plan', {
        body: { newPlanSlug, billingPeriod },
      });

      if (error) throw error;

      // Check if approval is required
      if (data.requiresApproval && data.approvalUrl) {
        window.location.href = data.approvalUrl;
        return;
      }

      toast.success('تم تغيير الخطة بنجاح');
      fetchSubscription();
    } catch (error: any) {
      console.error('Error changing plan:', error);
      toast.error('فشل في تغيير الخطة: ' + error.message);
    }
  };

  return {
    subscription,
    plan,
    isLoading,
    isFreeTier: plan?.slug === 'free',
    limits,
    checkout,
    cancel,
    changePlan,
    refetch: fetchSubscription,
  };
};
