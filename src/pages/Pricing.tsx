import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import AuraLayout from '@/components/common/AuraLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Zap, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { formatTokens } from '@/lib/helpers/formatters';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

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
      `${formatTokens(plan.token_limit_monthly)} رمز شهرياً`,
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
                  className={`p-6 relative overflow-visible backdrop-blur-md bg-background/40 border-border/50 transition-all duration-300 hover:bg-background/60 hover:scale-105 ${
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
                    {isCurrent 
                      ? 'الخطة الحالية' 
                      : !user 
                        ? 'سجل دخول للاشتراك'
                        : plan.slug === 'free' 
                          ? 'البدء مجاناً' 
                          : 'اشترك الآن'}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {/* Feature Comparison Table */}
        <div className="mt-16 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            مقارنة الخطط
          </h2>
          
          <div className="overflow-x-auto">
            <Table className="backdrop-blur-md bg-background/40 border border-border/50 rounded-lg">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-right font-bold text-foreground w-1/4">الميزة</TableHead>
                  {plans.map((plan) => (
                    <TableHead 
                      key={plan.id} 
                      className={`text-center font-bold ${
                        plan.slug === 'pro' ? 'bg-primary/10 text-primary' : 'text-foreground'
                      }`}
                    >
                      {plan.name_ar}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Monthly Price */}
                <TableRow className="border-border/50">
                  <TableCell className="font-medium text-right">السعر الشهري</TableCell>
                  {plans.map((plan) => (
                    <TableCell 
                      key={plan.id} 
                      className={`text-center ${plan.slug === 'pro' ? 'bg-primary/5' : ''}`}
                    >
                      ${plan.price_monthly_usd}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Yearly Price */}
                <TableRow className="border-border/50">
                  <TableCell className="font-medium text-right">السعر السنوي</TableCell>
                  {plans.map((plan) => (
                    <TableCell 
                      key={plan.id} 
                      className={`text-center ${plan.slug === 'pro' ? 'bg-primary/5' : ''}`}
                    >
                      {plan.price_yearly_usd ? (
                        <div className="flex flex-col items-center gap-1">
                          <span>${plan.price_yearly_usd}</span>
                          <span className="text-xs text-primary">(وفّر شهرين)</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Monthly Projects */}
                <TableRow className="border-border/50">
                  <TableCell className="font-medium text-right">المشاريع شهرياً</TableCell>
                  {plans.map((plan) => (
                    <TableCell 
                      key={plan.id} 
                      className={`text-center ${plan.slug === 'pro' ? 'bg-primary/5' : ''}`}
                    >
                      {plan.project_limit_monthly || 'غير محدود'}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Monthly Tokens */}
                <TableRow className="border-border/50">
                  <TableCell className="font-medium text-right">الرموز شهرياً</TableCell>
                  {plans.map((plan) => (
                    <TableCell 
                      key={plan.id} 
                      className={`text-center ${plan.slug === 'pro' ? 'bg-primary/5' : ''}`}
                    >
                      {formatTokens(plan.token_limit_monthly)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Redos per Tab */}
                <TableRow className="border-border/50">
                  <TableCell className="font-medium text-right">إعادة التوليد لكل تبويب</TableCell>
                  {plans.map((plan) => (
                    <TableCell 
                      key={plan.id} 
                      className={`text-center ${plan.slug === 'pro' ? 'bg-primary/5' : ''}`}
                    >
                      {plan.redo_limit_per_tab === 99 ? 'غير محدود' : plan.redo_limit_per_tab}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Export Enabled */}
                <TableRow className="border-border/50">
                  <TableCell className="font-medium text-right">تصدير الملفات</TableCell>
                  {plans.map((plan) => (
                    <TableCell 
                      key={plan.id} 
                      className={`text-center ${plan.slug === 'pro' ? 'bg-primary/5' : ''}`}
                    >
                      {plan.export_enabled ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Priority Support */}
                <TableRow className="border-border/50">
                  <TableCell className="font-medium text-right">دعم فني ذو أولوية</TableCell>
                  {plans.map((plan) => (
                    <TableCell 
                      key={plan.id} 
                      className={`text-center ${plan.slug === 'pro' ? 'bg-primary/5' : ''}`}
                    >
                      {plan.priority_support ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* API Access */}
                <TableRow className="border-border/50">
                  <TableCell className="font-medium text-right">وصول API</TableCell>
                  {plans.map((plan) => (
                    <TableCell 
                      key={plan.id} 
                      className={`text-center ${plan.slug === 'pro' ? 'bg-primary/5' : ''}`}
                    >
                      {plan.api_access ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Trust Signals & Payment Methods */}
        <div className="text-center py-12 mt-12 border-t border-border/50">
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">ألغِ في أي وقت</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">مدفوعات آمنة بواسطة PayPal</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">لا يتطلب بطاقة ائتمانية للخطة المجانية</span>
            </div>
          </div>
          
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
