import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export function PayPalSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSetupPayPal = async () => {
    setIsLoading(true);
    setSetupStatus('idle');
    setErrorMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('setup-paypal-plans', {
        method: 'POST',
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSetupStatus('success');
      toast.success('تم إنشاء خطط PayPal بنجاح');
      console.log('PayPal setup successful:', data);
    } catch (error) {
      console.error('PayPal setup error:', error);
      setSetupStatus('error');
      const message = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      setErrorMessage(message);
      toast.error(`فشل إنشاء خطط PayPal: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="editorial">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-accent" strokeWidth={1.5} />
          إعداد PayPal
        </CardTitle>
        <CardDescription>
          تهيئة خطط الاشتراك في PayPal. يجب تشغيل هذا مرة واحدة فقط عند بدء النظام.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {setupStatus === 'success' && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              تم إنشاء خطط PayPal وربطها بقاعدة البيانات بنجاح. يمكن للمستخدمين الآن الاشتراك في الخطط المدفوعة.
            </AlertDescription>
          </Alert>
        )}

        {setupStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              فشل الإعداد: {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/30 p-4 rounded-lg border-2 border-foreground/10">
          <h3 className="font-semibold mb-2 text-foreground">ما الذي يفعله هذا؟</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• إنشاء منتج PayPal للاشتراكات</li>
            <li>• إنشاء خطط فوترة شهرية وسنوية لكل مستوى اشتراك</li>
            <li>• ربط معرفات خطط PayPal بجدول subscription_plans</li>
            <li>• تفعيل نظام الدفع للمستخدمين</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border-2 border-yellow-500/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ تحذير: قم بتشغيل هذا مرة واحدة فقط. التشغيل المتكرر سيُنشئ خطط PayPal مكررة.
          </p>
        </div>

        <Button
          onClick={handleSetupPayPal}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جاري الإعداد...
            </>
          ) : (
            'إعداد خطط PayPal'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
