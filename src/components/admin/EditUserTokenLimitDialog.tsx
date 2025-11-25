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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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
  };
  onSave: () => void;
}

const PRESET_LIMITS = [
  { value: '50000', label: 'محدود جداً (50K)', description: 'للاختبار الأساسي' },
  { value: '100000', label: 'قياسي (100K)', description: 'الافتراضي للبيتا' },
  { value: '250000', label: 'نشط (250K)', description: 'للمستخدمين النشطين' },
  { value: '500000', label: 'متقدم (500K)', description: 'للاستخدام المكثف' },
  { value: 'custom', label: 'مخصص', description: 'قيمة مخصصة' },
];

export const EditUserTokenLimitDialog = ({
  open,
  onOpenChange,
  user,
  onSave,
}: EditUserTokenLimitDialogProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    const preset = PRESET_LIMITS.find(p => p.value === user.monthly_token_limit.toString());
    return preset ? preset.value : 'custom';
  });
  const [customLimit, setCustomLimit] = useState(user.monthly_token_limit.toString());
  const [alertThreshold, setAlertThreshold] = useState(user.alert_threshold_percentage);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.limit_notifications_enabled);
  const [saving, setSaving] = useState(false);

  const getCurrentLimit = () => {
    if (selectedPreset === 'custom') {
      return parseInt(customLimit) || 0;
    }
    return parseInt(selectedPreset);
  };

  const handleSave = async () => {
    const limit = getCurrentLimit();
    
    if (limit <= 0) {
      toast.error('الحد الشهري يجب أن يكون أكبر من صفر');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          monthly_token_limit: limit,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تعديل حدود الاستخدام</DialogTitle>
          <DialogDescription>
            تعديل حدود استخدام الـ Tokens الشهرية للمستخدم
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="space-y-1">
            <p className="text-sm font-medium">{user.full_name || 'غير محدد'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          {/* Token Limit Preset */}
          <div className="space-y-2">
            <Label>الحد الشهري للـ Tokens</Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESET_LIMITS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    <div className="flex flex-col items-start">
                      <span>{preset.label}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Limit Input */}
          {selectedPreset === 'custom' && (
            <div className="space-y-2">
              <Label>قيمة مخصصة</Label>
              <Input
                type="number"
                value={customLimit}
                onChange={(e) => setCustomLimit(e.target.value)}
                placeholder="أدخل الحد المخصص"
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                الحد الحالي: {parseInt(customLimit).toLocaleString() || 0} token
              </p>
            </div>
          )}

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
