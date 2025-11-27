import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import preshootLogoNew from "@/assets/preshoot-logo-new.png";
const requestAccessSchema = z.object({
  name: z.string().trim().min(2, {
    message: "الاسم يجب أن يكون حرفين على الأقل"
  }).max(100, {
    message: "الاسم يجب أن يكون أقل من 100 حرف"
  }),
  email: z.string().trim().email({
    message: "البريد الإلكتروني غير صحيح"
  }).max(255, {
    message: "البريد الإلكتروني يجب أن يكون أقل من 255 حرف"
  }),
  reason: z.string().trim().min(10, {
    message: "يرجى كتابة سبب الطلب (10 أحرف على الأقل)"
  }).max(1000, {
    message: "السبب يجب أن يكون أقل من 1000 حرف"
  })
});
type RequestAccessForm = z.infer<typeof requestAccessSchema>;
export default function RequestAccess() {
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting
    },
    reset
  } = useForm<RequestAccessForm>({
    resolver: zodResolver(requestAccessSchema)
  });
  const onSubmit = async (data: RequestAccessForm) => {
    try {
      const { error } = await supabase.from("beta_signups").insert([{
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        notes: data.reason.trim(),
        status: 'pending'
      }]);
      if (error) {
        if (error.code === "23505") {
          toast.error("هذا البريد الإلكتروني مسجل مسبقاً");
        } else {
          console.error("Signup error:", error);
          toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
        }
        return;
      }

      // Notify admins via edge function (fire and forget)
      supabase.functions.invoke("notify-admins-new-signup", {
        body: {
          signupName: data.name.trim(),
          signupEmail: data.email.trim().toLowerCase(),
          signupReason: data.reason.trim()
        }
      }).then(({
        error: notifyError
      }) => {
        if (notifyError) {
          console.error("Error notifying admins:", notifyError);
          // Don't show error to user - notification failure shouldn't block signup
        } else {
          console.log("Admins notified successfully");
        }
      });
      setIsSuccess(true);
      toast.success("تم إرسال طلبك بنجاح!");
      reset();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    }
  };
  return <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={preshootLogoNew} alt="PreShoot Studio" className="h-8 w-auto brightness-0 invert" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              الصفحة الرئيسية
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                تسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {isSuccess ? <Card variant="editorial" className="text-center">
              <CardContent className="pt-12 pb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">تم إرسال طلبك بنجاح!</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  شكراً لاهتمامك بـ PreShoot Studio. سنقوم بمراجعة طلبك وسنتواصل معك قريباً عبر البريد الإلكتروني.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate("/")} variant="outline">
                    العودة للصفحة الرئيسية
                  </Button>
                  <Button onClick={() => setIsSuccess(false)}>
                    إرسال طلب آخر
                  </Button>
                </div>
              </CardContent>
            </Card> : <Card variant="editorial">
              <CardHeader>
                <CardTitle className="text-3xl">طلب الوصول المبكر</CardTitle>
                <CardDescription className="text-base">
                  املأ النموذج أدناه للانضمام إلى قائمة الانتظار. سيقوم فريقنا بمراجعة طلبك وإرسال دعوة إليك عند الموافقة.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">
                      الاسم الكامل <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" type="text" placeholder="أحمد محمد" disabled={isSubmitting} {...register("name")} className={errors.name ? "border-destructive" : ""} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">
                      البريد الإلكتروني <span className="text-destructive">*</span>
                    </Label>
                    <Input id="email" type="email" placeholder="ahmad@example.com" disabled={isSubmitting} {...register("email")} className={errors.email ? "border-destructive" : ""} dir="ltr" />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  {/* Reason Field */}
                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-base">
                      لماذا تريد الانضمام إلى Preshoot Studio؟ <span className="text-destructive">*</span>
                    </Label>
                    <Textarea id="reason" placeholder="أخبرنا عن نفسك وكيف تخطط لاستخدام Preshoot Studio في عملك..." disabled={isSubmitting} {...register("reason")} className={`min-h-[120px] ${errors.reason ? "border-destructive" : ""}`} rows={5} />
                    {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
                    <p className="text-xs text-muted-foreground">
                      يرجى تقديم معلومات مفصلة لمساعدتنا في فهم احتياجاتك (10-1000 حرف)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                    {isSubmitting ? <>
                        <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                        جاري الإرسال...
                      </> : <>
                        إرسال الطلب
                        <ArrowRight className="me-2 h-5 w-5" />
                      </>}
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      لديك حساب بالفعل؟{" "}
                      <Link to="/auth" className="text-primary hover:underline font-medium">
                        تسجيل الدخول
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 PreShoot Studio. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>;
}