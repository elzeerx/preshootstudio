import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Mail, Lock } from "lucide-react";
import AuraLayout from "@/components/common/AuraLayout";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [signupData, setSignupData] = useState<{ name: string; email: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Validating token via edge function:", token);

      // Call the validation edge function (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('validate-invitation', {
        body: { token }
      });

      if (error) {
        console.error("Edge function error:", error);
        setValidToken(false);
        setLoading(false);
        return;
      }

      console.log("Validation response:", data);

      // Handle different validation states
      if (!data.valid) {
        if (data.tokenExpired || data.expired) {
          console.log("Token expired");
          setTokenExpired(true);
          setValidToken(false);
        } else if (data.alreadyUsed) {
          console.log("Token already used");
          toast({
            title: "الحساب موجود بالفعل",
            description: "تم إنشاء حساب لهذه الدعوة مسبقاً. يرجى تسجيل الدخول.",
          });
          setValidToken(false);
          setTimeout(() => navigate("/auth"), 1500);
        } else {
          console.log("Invalid token:", data.error);
          setValidToken(false);
        }
        setLoading(false);
        return;
      }

      // Token is valid - set signup data
      setSignupData({
        name: data.signup.name,
        email: data.signup.email,
      });
      setValidToken(true);
    } catch (error) {
      console.error("Error validating token:", error);
      setValidToken(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمتا المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: signupData!.email,
        password,
        options: {
          data: {
            full_name: signupData!.name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Mark invitation as accepted
      const { error: updateInvitationError } = await supabase
        .from("beta_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("token", token);

      if (updateInvitationError) {
        console.error("Error updating invitation:", updateInvitationError);
      }

      // Update beta_signup with user_id and account_created_at
      const { data: invitation } = await supabase
        .from("beta_invitations")
        .select("signup_id")
        .eq("token", token)
        .single();

      if (invitation) {
        const { error: updateSignupError } = await supabase
          .from("beta_signups")
          .update({
            user_id: authData.user.id,
            account_created_at: new Date().toISOString(),
          })
          .eq("id", invitation.signup_id);

        if (updateSignupError) {
          console.error("Error updating signup:", updateSignupError);
        }
      }

      toast({
        title: "تم إنشاء الحساب بنجاح! 🎉",
        description: "مرحباً بك في PreShoot. جاري تسجيل الدخول...",
      });

      // Redirect to projects page after successful signup
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast({
        title: "فشل إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <AuraLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md" variant="editorial">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">جاري التحقق من الدعوة...</p>
            </CardContent>
          </Card>
        </div>
      </AuraLayout>
    );
  }

  if (!token || (!validToken && !tokenExpired)) {
    const isLocalhostError = sessionStorage.getItem('inviteError') === 'localhost';
    
    // Clear the error flag
    sessionStorage.removeItem('inviteError');
    
    return (
      <AuraLayout>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md" variant="editorial">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">
                {isLocalhostError ? "رابط دعوة قديم" : "دعوة غير صالحة"}
              </CardTitle>
              <CardDescription>
                {isLocalhostError ? (
                  <span className="block space-y-2">
                    <span className="block">
                      يبدو أنك تستخدم رابط دعوة قديم يحتوي على عنوان localhost.
                    </span>
                    <span className="block font-semibold text-foreground">
                      يرجى طلب إعادة إرسال دعوة جديدة من المسؤول.
                    </span>
                  </span>
                ) : (
                  "رابط الدعوة الذي استخدمته غير صحيح أو تم استخدامه مسبقاً."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {isLocalhostError && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-foreground">
                    <strong className="block mb-2">💡 كيفية الحصول على دعوة جديدة:</strong>
                    تواصل مع المسؤول وأخبره بإعادة إرسال الدعوة. ستصلك رسالة بريد إلكتروني جديدة تحتوي على رابط محدث.
                  </p>
                </div>
              )}
              <Button onClick={() => navigate("/")} className="gap-2">
                العودة إلى الصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuraLayout>
    );
  }

  if (tokenExpired) {
    return (
      <AuraLayout>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md" variant="editorial">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-warning" />
              </div>
              <CardTitle className="text-2xl">انتهت صلاحية الدعوة</CardTitle>
              <CardDescription>
                عذراً، انتهت صلاحية رابط الدعوة هذا. يرجى التواصل معنا للحصول على دعوة جديدة.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                الدعوات صالحة لمدة 7 أيام من تاريخ الإرسال
              </p>
              <Button onClick={() => navigate("/")} className="gap-2">
                العودة إلى الصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuraLayout>
    );
  }

  return (
    <AuraLayout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md" variant="editorial">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">مرحباً بك في PreShoot! 🎉</CardTitle>
            <CardDescription>
              أكمل إنشاء حسابك للبدء في استخدام المنصة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div className="space-y-2">
                <Label>الاسم</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border bg-muted/30">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{signupData?.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border bg-muted/30">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-mono">{signupData?.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل كلمة مرور قوية (6 أحرف على الأقل)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={creating}
                size="lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    إنشاء الحساب والبدء
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                بإنشاء الحساب، فإنك توافق على شروط الخدمة وسياسة الخصوصية
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuraLayout>
  );
}
