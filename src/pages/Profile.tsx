import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Calendar, Receipt, Zap, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/common/AppHeader';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { AppFooter } from '@/components/common/AppFooter';
import { TokenLimitSettings } from '@/components/profile/TokenLimitSettings';
import { CurrentPlanCard } from '@/components/subscription/CurrentPlanCard';
import { UsageMeter } from '@/components/subscription/UsageMeter';
import { formatDate } from '@/lib/helpers/formatters';

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFullName(data.full_name || '');
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات الملف الشخصي',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user!.id);

      if (error) throw error;

      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم حفظ التغييرات',
      });
      
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحديث الملف الشخصي',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Breadcrumbs />
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">الملف الشخصي</h1>
            <p className="text-muted-foreground">إدارة معلومات حسابك</p>
          </div>

        <Card className="border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              معلومات الحساب
            </CardTitle>
            <CardDescription>
              عرض وتحديث بيانات حسابك الشخصية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  الاسم الكامل
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  disabled={updating}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                <Input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted/50"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  لا يمكن تغيير البريد الإلكتروني
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاريخ الانضمام
                </Label>
                <Input
                  type="text"
                  value={profile?.created_at ? formatDate(profile.created_at) : ''}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <Button type="submit" className="w-full" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-border">
              <Button
                variant="destructive"
                className="w-full"
                onClick={signOut}
              >
                تسجيل الخروج
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <CurrentPlanCard />
          <UsageMeter />
        </div>

        {/* Quick Links */}
        <Card className="border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle>روابط سريعة</CardTitle>
            <CardDescription>الوصول السريع إلى الميزات المهمة</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <Button variant="outline" asChild className="justify-start gap-2">
              <Link to="/subscription">
                <CreditCard className="w-4 h-4" />
                إدارة الاشتراك
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start gap-2">
              <Link to="/payment-history">
                <Receipt className="w-4 h-4" />
                سجل المدفوعات
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start gap-2">
              <Link to="/pricing">
                <Zap className="w-4 h-4" />
                عرض الخطط
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Token Limits Section */}
        <TokenLimitSettings />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
