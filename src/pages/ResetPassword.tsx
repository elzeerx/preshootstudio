import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }

    setIsSubmitting(true);
    const { error } = await updatePassword(newPassword);
    setIsSubmitting(false);

    if (!error) {
      navigate('/projects');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-l from-primary via-primary-glow to-accent-purple bg-clip-text text-transparent">
            PreShoot AI
          </h1>
          <p className="text-muted-foreground">
            مساعدك الشخصي قبل التصوير وبعده
          </p>
        </div>

        <Card className="border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle className="text-2xl text-center">تعيين كلمة مرور جديدة</CardTitle>
            <CardDescription className="text-center">
              أدخل كلمة المرور الجديدة الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  minLength={6}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                يجب أن تكون كلمة المرور 6 أحرف على الأقل
              </p>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث كلمة المرور'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
