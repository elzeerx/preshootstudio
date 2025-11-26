import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Check, ArrowUp, ArrowDown, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface Plan {
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
  is_active: boolean;
  sort_order: number;
}

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePlanDialog = ({ open, onOpenChange }: ChangePlanDialogProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { subscription, plan: currentPlan, refetch } = useSubscription();

  useEffect(() => {
    if (open) {
      fetchPlans();
      if (subscription?.billing_period) {
        setBillingPeriod(subscription.billing_period as 'monthly' | 'yearly');
      }
    }
  }, [open, subscription]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .neq('slug', 'free')
        .order('sort_order');

      if (error) throw error;
      setPlans((data || []) as Plan[]);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('فشل في تحميل الخطط');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlanSlug) {
      toast.error('يرجى اختيار خطة');
      return;
    }

    if (selectedPlanSlug === currentPlan?.slug && billingPeriod === subscription?.billing_period) {
      toast.error('أنت بالفعل على هذه الخطة');
      return;
    }

    setIsChanging(true);

    try {
      const { data, error } = await supabase.functions.invoke('change-subscription-plan', {
        body: {
          new_plan_slug: selectedPlanSlug,
          billing_period: billingPeriod,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to change plan');
      }

      toast.success('تم تغيير الخطة بنجاح! سيتم تطبيق التغييرات فوراً.');
      await refetch();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Change plan error:', error);
      toast.error(error.message || 'فشل في تغيير الخطة');
    } finally {
      setIsChanging(false);
    }
  };

  const getPrice = (plan: Plan) => {
    return billingPeriod === 'yearly' && plan.price_yearly_usd
      ? plan.price_yearly_usd
      : plan.price_monthly_usd;
  };

  const getChangeType = (plan: Plan): 'upgrade' | 'downgrade' | 'current' => {
    if (!currentPlan) return 'upgrade';
    if (plan.slug === currentPlan.slug && billingPeriod === subscription?.billing_period) return 'current';
    
    const currentPrice = subscription?.billing_period === 'yearly' 
      ? currentPlan.price_yearly_usd || currentPlan.price_monthly_usd * 12
      : currentPlan.price_monthly_usd;
    
    const newPrice = billingPeriod === 'yearly'
      ? plan.price_yearly_usd || plan.price_monthly_usd * 12
      : plan.price_monthly_usd;

    return newPrice > currentPrice ? 'upgrade' : 'downgrade';
  };

  const getFeatures = (plan: Plan) => {
    return [
      `${plan.project_limit_monthly || 'غير محدود'} مشروع شهرياً`,
      `${(plan.token_limit_monthly / 1000).toLocaleString('en-US')}K رمز شهرياً`,
      `إعادة توليد ${plan.redo_limit_per_tab === 99 ? 'غير محدودة' : plan.redo_limit_per_tab + ' مرات'} لكل تبويب`,
      ...(plan.export_enabled ? ['تصدير الملفات'] : []),
      ...(plan.priority_support ? ['دعم فني ذو أولوية'] : []),
      ...(plan.api_access ? ['وصول API'] : []),
    ];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">تغيير خطة الاشتراك</DialogTitle>
          <DialogDescription>
            اختر خطة جديدة. سيتم احتساب الفرق بالتناسب تلقائياً.
          </DialogDescription>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 p-4 rounded-lg bg-muted/50">
          <span className={billingPeriod === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
            شهري
          </span>
          <Switch 
            checked={billingPeriod === 'yearly'}
            onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
          />
          <span className={billingPeriod === 'yearly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
            سنوي
          </span>
          {billingPeriod === 'yearly' && (
            <Badge variant="secondary" className="mr-2">
              وفّر شهرين
            </Badge>
          )}
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const changeType = getChangeType(plan);
              const price = getPrice(plan);
              const features = getFeatures(plan);
              const isCurrent = changeType === 'current';
              const isSelected = selectedPlanSlug === plan.slug;

              return (
                <Card
                  key={plan.id}
                  className={`p-4 cursor-pointer transition-all relative ${
                    isSelected ? 'border-primary shadow-md' : 'hover:border-primary/50'
                  } ${isCurrent ? 'opacity-60' : ''}`}
                  onClick={() => !isCurrent && setSelectedPlanSlug(plan.slug)}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-2 right-1/2 translate-x-1/2" variant="secondary">
                      الخطة الحالية
                    </Badge>
                  )}

                  {!isCurrent && changeType === 'upgrade' && (
                    <Badge className="absolute -top-2 left-2" variant="default">
                      <ArrowUp className="w-3 h-3 mr-1" />
                      ترقية
                    </Badge>
                  )}

                  {!isCurrent && changeType === 'downgrade' && (
                    <Badge className="absolute -top-2 left-2" variant="outline">
                      <ArrowDown className="w-3 h-3 mr-1" />
                      تخفيض
                    </Badge>
                  )}

                  <div className="text-center mb-4 mt-2">
                    <h3 className="text-xl font-bold mb-2">{plan.name_ar}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">${price}</span>
                      <span className="text-muted-foreground text-sm">
                        /{billingPeriod === 'yearly' ? 'سنة' : 'شهر'}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isSelected && !isCurrent && (
                    <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Proration Notice */}
        {selectedPlanSlug && selectedPlanSlug !== currentPlan?.slug && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm">
            <p className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                سيتم احتساب الفرق في السعر بالتناسب تلقائياً بواسطة PayPal. 
                {getChangeType(plans.find(p => p.slug === selectedPlanSlug)!) === 'upgrade' 
                  ? ' ستدفع الفرق الآن وسيتم تطبيق الخطة الجديدة فوراً.'
                  : ' سيتم إضافة الفرق كرصيد لفترة الفوترة القادمة.'}
              </span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isChanging}>
            إلغاء
          </Button>
          <Button 
            onClick={handleChangePlan} 
            disabled={!selectedPlanSlug || isChanging || getChangeType(plans.find(p => p.slug === selectedPlanSlug)!) === 'current'}
          >
            {isChanging ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري التغيير...
              </>
            ) : (
              'تأكيد التغيير'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
