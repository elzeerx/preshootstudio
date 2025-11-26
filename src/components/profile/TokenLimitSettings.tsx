import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

interface TokenUsageData {
  total_tokens: number;
  total_cost: number;
  request_count: number;
  limit_amount: number;
  alert_threshold: number;
  notifications_enabled: boolean;
}

export const TokenLimitSettings = () => {
  const { toast } = useToast();
  const { plan } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState<TokenUsageData | null>(null);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('get_user_monthly_token_usage', { user_id_param: user.id });

      if (error) throw error;

      if (data && data.length > 0) {
        const usageData = data[0];
        setUsage(usageData);
        setAlertThreshold(usageData.alert_threshold || 80);
        setNotificationsEnabled(usageData.notifications_enabled !== false);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الاستخدام',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          alert_threshold_percentage: alertThreshold,
          limit_notifications_enabled: notificationsEnabled,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث إعدادات حدود الاستخدام بنجاح',
      });

      await fetchUsageData();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>حدود استخدام الـ Tokens</CardTitle>
          <CardDescription>جاري التحميل...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tokenLimit = plan?.token_limit_monthly || usage?.limit_amount || 50000;
  const usagePercentage = usage 
    ? (Number(usage.total_tokens) / tokenLimit) * 100 
    : 0;

  const getUsageColor = () => {
    if (usagePercentage >= 100) return 'text-destructive';
    if (usagePercentage >= 90) return 'text-orange-500';
    if (usagePercentage >= alertThreshold) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-4">
      {/* Current Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle>الاستخدام الحالي هذا الشهر</CardTitle>
          <CardDescription>
            {usage?.total_tokens.toLocaleString() || 0} / {tokenLimit.toLocaleString()} tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>نسبة الاستخدام</span>
              <span className={`font-bold ${getUsageColor()}`}>
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
          </div>

          {usagePercentage >= 100 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">تم تجاوز الحد الشهري للاستخدام</p>
            </div>
          )}

          {usagePercentage >= alertThreshold && usagePercentage < 100 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                اقتربت من حد الاستخدام الشهري
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">التكلفة التقديرية</p>
              <p className="text-lg font-bold">
                ${usage?.total_cost.toFixed(4) || '0.0000'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">عدد الطلبات</p>
              <p className="text-lg font-bold">
                {usage?.request_count?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الحدود</CardTitle>
          <CardDescription>تخصيص حدود الاستخدام والتنبيهات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="monthly-limit">الحد الشهري للـ Tokens</Label>
            <Input
              id="monthly-limit"
              type="text"
              value={tokenLimit.toLocaleString()}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                يتم تحديد الحد الأقصى للـ tokens بواسطة خطة الاشتراك الخاصة بك: {plan?.name || 'مجاني'}
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-threshold">نسبة التنبيه (%)</Label>
            <Input
              id="alert-threshold"
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              min={50}
              max={99}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              إرسال تنبيه عند الوصول لهذه النسبة من الحد الشهري
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">تفعيل التنبيهات</Label>
              <p className="text-xs text-muted-foreground">
                استقبال إشعارات عند اقتراب الحد
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};