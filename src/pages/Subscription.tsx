import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import AuraLayout from '@/components/common/AuraLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { formatTokens, formatDateGregorian } from '@/lib/helpers/formatters';
import { Link, useSearchParams } from 'react-router-dom';
import { APP_ROUTES } from '@/lib/constants';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  XCircle,
  Calendar,
  Zap
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Subscription() {
  const { subscription, plan, isLoading, limits, cancel } = useSubscription();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle success/canceled query parameters
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('تم تغيير الخطة بنجاح!');
      setSearchParams({}); // Clear query params
    } else if (canceled === 'true') {
      toast.error('تم إلغاء تغيير الخطة');
      setSearchParams({}); // Clear query params
    }
  }, [searchParams, setSearchParams]);

  if (isLoading) {
    return (
      <AuraLayout>
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">جاري التحميل...</div>
        </main>
        <AppFooter />
      </AuraLayout>
    );
  }

  const projectsPercentage = limits.projectLimit > 0 
    ? (limits.projectsUsed / limits.projectLimit) * 100 
    : 0;
  const tokensPercentage = (limits.tokensUsed / limits.tokenLimit) * 100;

  const getStatusBadge = () => {
    if (!subscription) return null;
    
    const statusConfig = {
      active: { label: 'نشط', variant: 'default' as const, icon: CheckCircle2 },
      canceled: { label: 'ملغي', variant: 'destructive' as const, icon: XCircle },
      past_due: { label: 'متأخر', variant: 'destructive' as const, icon: AlertCircle },
      suspended: { label: 'معلق', variant: 'secondary' as const, icon: AlertCircle },
    };

    const config = statusConfig[subscription.status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <AuraLayout>
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            إدارة الاشتراك
          </h1>
          <p className="text-muted-foreground">
            تفاصيل اشتراكك واستخدامك الحالي
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Current Plan Card */}
          <Card className="p-6 backdrop-blur-md bg-background/40 border-border/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{plan?.name_ar || 'خطة مجانية'}</h2>
                {getStatusBadge()}
              </div>
              <CreditCard className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-4">
              {subscription && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">فترة الفوترة</span>
                    <span className="font-medium">
                      {subscription.billing_period === 'monthly' ? 'شهرياً' : 'سنوياً'}
                    </span>
                  </div>

                  {subscription.current_period_end && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">تاريخ التجديد</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {formatDateGregorian(subscription.current_period_end)}
                        </span>
                      </div>
                    </div>
                  )}

                  {subscription.cancel_at_period_end && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        سيتم إلغاء الاشتراك في نهاية الفترة الحالية
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 border-t border-border/50 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>
                    {plan?.project_limit_monthly || 'غير محدود'} مشروع شهرياً
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{formatTokens(plan?.token_limit_monthly || 0)} رمز</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>
                    {plan?.redo_limit_per_tab === 99 ? 'غير محدود' : plan?.redo_limit_per_tab} إعادة/تبويب
                  </span>
                </div>
                {plan?.export_enabled && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>تصدير الملفات</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Link to={APP_ROUTES.PRICING} className="flex-1">
                  <Button variant="outline" className="w-full">
                    تغيير الخطة
                  </Button>
                </Link>
                <Link to={APP_ROUTES.PAYMENT_HISTORY} className="flex-1">
                  <Button variant="outline" className="w-full">
                    سجل المدفوعات
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Usage Statistics Card */}
          <Card className="p-6 backdrop-blur-md bg-background/40 border-border/50">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">الاستخدام الحالي</h2>
                <p className="text-sm text-muted-foreground">للفترة الحالية</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-6">
              {/* Projects Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">المشاريع</span>
                  <span className="text-sm text-muted-foreground">
                    {limits.projectsUsed} / {limits.projectLimit > 0 ? limits.projectLimit : '∞'}
                  </span>
                </div>
                <Progress value={projectsPercentage} className="h-2" />
                {projectsPercentage >= 80 && limits.projectLimit > 0 && (
                  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    اقتربت من حد المشاريع
                  </p>
                )}
              </div>

              {/* Tokens Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">الرموز</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTokens(limits.tokensUsed)} / {formatTokens(limits.tokenLimit)}
                  </span>
                </div>
                <Progress value={tokensPercentage} className="h-2" />
                {tokensPercentage >= 80 && (
                  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    اقتربت من حد الرموز
                  </p>
                )}
              </div>

              {/* Features Status */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-3">الميزات المتاحة</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">تصدير الملفات</span>
                    {limits.canExport ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">إعادة التوليد</span>
                    <span className="font-medium">
                      {limits.redoLimit === 99 ? '∞' : limits.redoLimit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        {subscription && subscription.status === 'active' && (
          <Card className="p-6 backdrop-blur-md bg-background/40 border-border/50">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">إلغاء الاشتراك</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  عند الإلغاء، سيبقى اشتراكك نشطاً حتى نهاية الفترة الحالية. بعد ذلك سيتم تحويلك
                  تلقائياً إلى الخطة المجانية.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      إلغاء الاشتراك
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيتم إلغاء اشتراكك في نهاية الفترة الحالية (
                        {subscription.current_period_end && 
                          formatDateGregorian(subscription.current_period_end)
                        }). يمكنك الاستمرار في استخدام الميزات المدفوعة حتى ذلك الحين.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>تراجع</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={cancel}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        نعم، قم بالإلغاء
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        )}

        {/* Upgrade CTA for Free Users */}
        {plan?.slug === 'free' && (
          <Card className="p-6 backdrop-blur-md bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">ارتقِ لخطة مدفوعة</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  احصل على المزيد من المشاريع والرموز وميزات حصرية مع خططنا المدفوعة
                </p>
                <Link to={APP_ROUTES.PRICING}>
                  <Button>
                    استكشف الخطط
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </main>

      <AppFooter />
    </AuraLayout>
  );
}
