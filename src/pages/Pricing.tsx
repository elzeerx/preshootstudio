import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import AuraLayout from '@/components/common/AuraLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Zap } from 'lucide-react';
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
  features: Record<string, any>;
  is_active: boolean;
  sort_order: number;
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { checkout, plan: currentPlan } = useSubscription();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
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

  const handleSubscribe = async (planSlug: string) => {
    if (planSlug === 'free') {
      toast.info('أنت بالفعل على الخطة المجانية');
      return;
    }
    await checkout(planSlug, billingPeriod);
  };

  const getPrice = (plan: Plan) => {
    return billingPeriod === 'yearly' && plan.price_yearly_usd
      ? plan.price_yearly_usd
      : plan.price_monthly_usd;
  };

  const getFeatures = (plan: Plan) => {
    const features = [
      `${plan.project_limit_monthly || 'غير محدود'} مشروع شهرياً`,
      `${(plan.token_limit_monthly / 1000).toLocaleString('en-US')}K رمز شهرياً`,
      `إعادة توليد ${plan.redo_limit_per_tab === 99 ? 'غير محدودة' : plan.redo_limit_per_tab + ' مرات'} لكل تبويب`,
    ];

    if (plan.export_enabled) features.push('تصدير الملفات');
    if (plan.priority_support) features.push('دعم فني ذو أولوية');
    if (plan.api_access) features.push('وصول API');

    return features;
  };

  return (
    <AuraLayout>
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            الأسعار
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            اختر الخطة المناسبة لاحتياجاتك. ابدأ مجاناً أو اشترك للحصول على المزيد من الميزات
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12 p-4 rounded-xl bg-background/40 backdrop-blur-sm border border-border/50 w-fit mx-auto">
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
            <Badge variant="secondary" className="mr-2 bg-primary/20 text-primary border-primary/30">
              وفّر شهرين
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        {isLoading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((plan) => {
              const isPopular = plan.slug === 'pro';
              const isCurrent = currentPlan?.slug === plan.slug;
              const price = getPrice(plan);
              const features = getFeatures(plan);

              return (
                <Card
                  key={plan.id}
                  className={`p-6 relative backdrop-blur-md bg-background/40 border-border/50 transition-all duration-300 hover:bg-background/60 hover:scale-105 ${
                    isPopular ? 'border-primary shadow-lg shadow-primary/20 scale-105' : ''
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 right-1/2 translate-x-1/2 bg-primary text-primary-foreground border-0">
                      الأكثر شعبية
                    </Badge>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name_ar}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">${price}</span>
                      <span className="text-muted-foreground">
                        /{billingPeriod === 'yearly' ? 'سنة' : 'شهر'}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.slug)}
                    className="w-full"
                    variant={isPopular ? 'default' : 'outline'}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'الخطة الحالية' : plan.slug === 'free' ? 'البدء مجاناً' : 'اشترك الآن'}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {/* Payment Methods */}
        <div className="text-center py-8 mt-12 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4">
            مدفوعات آمنة بواسطة PayPal
          </p>
          <div className="flex justify-center items-center gap-3 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-border/50 w-fit mx-auto">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">PayPal</span>
          </div>
        </div>
      </main>

      <AppFooter />
    </AuraLayout>
  );
}
