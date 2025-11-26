import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChangePlanDialog } from './ChangePlanDialog';

export const CurrentPlanCard = () => {
  const { subscription, plan, isFreeTier, cancel } = useSubscription();
  const navigate = useNavigate();
  const [showChangePlan, setShowChangePlan] = useState(false);

  if (!plan) return null;

  const handleCancel = async () => {
    if (confirm('هل أنت متأكد من إلغاء اشتراكك؟ ستظل لديك إمكانية الوصول حتى نهاية الفترة المدفوعة.')) {
      await cancel();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <CardTitle>الخطة الحالية</CardTitle>
          </div>
          <Badge variant={isFreeTier ? 'secondary' : 'default'}>
            {plan.name_ar}
          </Badge>
        </div>
        <CardDescription>
          {isFreeTier
            ? 'أنت حالياً على الخطة المجانية. قم بالترقية للحصول على المزيد من الميزات.'
            : 'شكراً لك على دعم PreShoot!'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isFreeTier && subscription && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">فترة الفوترة:</span>
              <span className="font-medium">
                {subscription.billing_period === 'yearly' ? 'سنوي' : 'شهري'}
              </span>
            </div>

            {subscription.current_period_end && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">التجديد القادم:</span>
                <span className="font-medium">
                  {format(new Date(subscription.current_period_end), 'PPP', { locale: ar })}
                </span>
              </div>
            )}

            {subscription.status === 'active' && (
              <div className="space-y-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setShowChangePlan(true)}
                  className="w-full gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  تغيير الخطة
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  className="w-full"
                >
                  إلغاء الاشتراك
                </Button>
              </div>
            )}
          </>
        )}

        {isFreeTier && (
          <Button 
            onClick={() => navigate('/pricing')}
            className="w-full"
          >
            ترقية الخطة
          </Button>
        )}
      </CardContent>

      <ChangePlanDialog open={showChangePlan} onOpenChange={setShowChangePlan} />
    </Card>
  );
};
