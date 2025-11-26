import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      `إعادة توليد ${plan.redo_limit_per_tab === 99 ? 'غير محدودة' : plan.redo_limit_per_tab.toLocaleString('en-US') + ' مرات'} لكل تبويب`,
    ];

    if (plan.export_enabled) features.push('تصدير الملفات');
    if (plan.priority_support) features.push('دعم فني ذو أولوية');
    if (plan.api_access) features.push('وصول API');

    return features;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            الأسعار
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            اختر الخطة المناسبة لاحتياجاتك. ابدأ مجاناً أو اشترك للحصول على المزيد من الميزات
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={billingPeriod === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground transition-colors'}>
            شهري
          </span>
          <button
            onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-16 h-9 bg-card border-2 border-border rounded-full transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Toggle billing period"
          >
            <div 
              className={`absolute top-0.5 w-7 h-7 bg-gradient-to-br from-primary via-accent to-secondary rounded-full transition-all duration-300 shadow-md ${
                billingPeriod === 'yearly' ? 'translate-x-1' : 'translate-x-8'
              }`} 
            />
          </button>
          <span className={billingPeriod === 'yearly' ? 'font-semibold text-foreground' : 'text-muted-foreground transition-colors'}>
            سنوي
          </span>
          {billingPeriod === 'yearly' && (
            <Badge variant="secondary" className="mr-2 bg-accent text-accent-foreground">
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
                  className={`p-6 relative transition-all ${
                    isPopular 
                      ? 'border-2 border-accent shadow-lg scale-[1.02] bg-card' 
                      : 'border border-border bg-card hover:border-border/60'
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground border-none">
                      الأكثر شعبية
                    </Badge>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name_ar}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold" style={{ fontVariantNumeric: 'lining-nums' }}>${price.toLocaleString('en-US')}</span>
                      <span className="text-muted-foreground">
                        /{billingPeriod === 'yearly' ? 'سنة' : 'شهر'}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-card-foreground">{feature}</span>
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
        <div className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            مدفوعات آمنة بواسطة PayPal
          </p>
          <div className="flex justify-center items-center gap-4 opacity-60">
            <Zap className="w-6 h-6" />
            <span className="text-sm font-medium">PayPal</span>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
