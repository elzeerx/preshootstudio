import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Sparkles, Package } from 'lucide-react';

interface EditUserTokenLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    user_id: string;
    email: string;
    full_name: string | null;
    monthly_token_limit: number;
    alert_threshold_percentage: number;
    limit_notifications_enabled: boolean;
    total_tokens: number;
    bonus_tokens: number;
    plan_name: string;
    plan_token_limit: number;
  };
  onSave: () => void;
}

const BONUS_PRESETS = [
  { value: 50000, label: '+50K' },
  { value: 100000, label: '+100K' },
  { value: 250000, label: '+250K' },
  { value: 500000, label: '+500K' },
];

export const EditUserTokenLimitDialog = ({
  open,
  onOpenChange,
  user,
  onSave,
}: EditUserTokenLimitDialogProps) => {
  const [bonusTokens, setBonusTokens] = useState(user.bonus_tokens || 0);
  const [alertThreshold, setAlertThreshold] = useState(user.alert_threshold_percentage);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.limit_notifications_enabled);
  const [saving, setSaving] = useState(false);

  const effectiveLimit = user.plan_token_limit + bonusTokens;
  const usagePercentage = effectiveLimit > 0 ? Math.min((user.total_tokens / effectiveLimit) * 100, 100) : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}K`;
    return num.toLocaleString('en-US');
  };

  const handlePresetClick = (value: number) => {
    setBonusTokens(value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bonus_tokens: bonusTokens,
          monthly_token_limit: effectiveLimit,
          alert_threshold_percentage: alertThreshold,
          limit_notifications_enabled: notificationsEnabled,
        })
        .eq('id', user.user_id);

      if (error) throw error;

      toast.success('تم تحديث حدود المستخدم بنجاح');
      onSave();
    } catch (error) {
      console.error('Error updating user limits:', error);
      toast.error('حدث خطأ أثناء تحديث حدود المستخدم');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>تعديل حدود الاستخدام</DialogTitle>
          <DialogDescription>
            إدارة حدود استخدام الـ Tokens الشهرية للمستخدم
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">{user.full_name || 'غير محدد'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {user.plan_name}
            </Badge>
          </div>

          {/* Plan Base Limit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">حد الخطة الأساسي</Label>
              <span className="font-medium">{formatNumber(user.plan_token_limit)} token</span>
            </div>
          </div>

          {/* Bonus Tokens Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              <Label className="font-medium">التوكنز الإضافية (Bonus)</Label>
            </div>
            
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              {BONUS_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={bonusTokens === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                variant={!BONUS_PRESETS.find(p => p.value === bonusTokens) && bonusTokens !== 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setBonusTokens(0)}
              >
                بدون إضافة
              </Button>
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">أو أدخل قيمة مخصصة</Label>
              <Input
                type="number"
                value={bonusTokens}
                onChange={(e) => setBonusTokens(parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Effective Limit Display */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <Label className="font-medium">الحد الفعلي</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{formatNumber(effectiveLimit)}</span>
                <span className="text-muted-foreground">token</span>
              </div>
            </div>
            {bonusTokens > 0 && (
              <p className="text-sm text-green-600">
                +{formatNumber(bonusTokens)} tokens إضافية من الأدمن
              </p>
            )}
          </div>

          {/* Current Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>الاستخدام الحالي</span>
              <span className={usagePercentage >= 80 ? 'text-destructive' : ''}>
                {formatNumber(user.total_tokens)} / {formatNumber(effectiveLimit)} ({usagePercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          {/* Alert Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>نسبة التنبيه</Label>
              <span className="text-sm font-medium">{alertThreshold}%</span>
            </div>
            <Slider
              value={[alertThreshold]}
              onValueChange={(value) => setAlertThreshold(value[0])}
              min={50}
              max={95}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              سيتم إرسال تنبيه عند الوصول إلى {alertThreshold}% من الحد الشهري
            </p>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>تفعيل التنبيهات</Label>
              <p className="text-xs text-muted-foreground">
                إرسال تنبيهات عند الاقتراب من الحد
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
