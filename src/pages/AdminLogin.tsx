import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !roleLoading && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, roleLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error('خطأ في تسجيل الدخول. تحقق من بياناتك.');
        setLoading(false);
        return;
      }

      // Wait a moment for auth state to update
      setTimeout(async () => {
        // Check if user has admin role
        const { data: roleData } = await fetch('/api/check-role').then(r => r.json()).catch(() => ({ data: null }));
        
        if (roleData?.role === 'admin') {
          toast.success('مرحباً بك في لوحة التحكم');
          navigate('/admin');
        } else {
          toast.error('ليس لديك صلاحيات الوصول إلى لوحة التحكم');
          setLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-lg mb-4 shadow-editorial">
            <Shield className="w-12 h-12 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-black mb-2">
            لوحة التحكم
          </h1>
          <p className="text-muted-foreground text-lg">
            PreShoot Studio - Admin Access
          </p>
        </div>

        {/* Login Card */}
        <Card variant="editorial" className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" />
              تسجيل دخول المسؤول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-bold">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@preshoot.studio"
                    className="pr-10 h-12 text-lg border-2 border-foreground/20 focus:border-foreground transition-colors"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-bold">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 h-12 text-lg border-2 border-foreground/20 focus:border-foreground transition-colors"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    دخول لوحة التحكم
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 border-muted">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-bold text-foreground mb-1">
                    تنبيه أمني
                  </p>
                  <p>
                    هذه الصفحة مخصصة للمسؤولين فقط. سيتم تسجيل جميع محاولات الدخول غير المصرح بها.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home Link */}
        <div className="text-center mt-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <Button
            variant="ghost"
            onClick={() => navigate('/landing')}
            className="text-muted-foreground hover:text-foreground"
          >
            العودة إلى الصفحة الرئيسية
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <p>© 2025 PreShoot Studio. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
