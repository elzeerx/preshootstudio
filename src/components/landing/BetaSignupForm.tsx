import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
const formSchema = z.object({
  name: z.string().min(2, {
    message: "الاسم يجب أن يكون حرفين على الأقل"
  }).max(100),
  email: z.string().email({
    message: "البريد الإلكتروني غير صحيح"
  }).max(255)
});
type FormData = z.infer<typeof formSchema>;
export const BetaSignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from("beta_signups").insert([{
        name: data.name,
        email: data.email
      }]);
      if (error) {
        if (error.code === "23505") {
          toast.error("هذا البريد الإلكتروني مسجل مسبقاً");
        } else {
          toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
        }
        return;
      }
      setIsSuccess(true);
      toast.success("تم التسجيل بنجاح! سنتواصل معك قريباً");
      reset();
    } catch (err) {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isSuccess) {
    return <div className="text-center space-y-6 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-24 h-24 border-4 border-button-primary bg-button-primary/20">
          <span className="text-6xl text-button-primary">✓</span>
        </div>
        <h3 className="text-2xl font-black text-white">تم التسجيل بنجاح!</h3>
        <p className="text-white/80 font-bold">سنتواصل معك عبر البريد الإلكتروني قريباً.</p>
      </div>;
  }
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white text-right block font-black text-lg">
          الاسم الكامل
        </Label>
        <Input id="name" type="text" placeholder="أدخل اسمك الكامل" className="glass-card bg-white/5 text-white border-4 border-white/20 h-14 text-lg placeholder:text-white/40 focus:border-button-primary rounded-none" {...register("name")} disabled={isSubmitting} />
        {errors.name && <p className="text-sm text-red-400 text-right font-bold">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white text-right block font-black text-lg">
          البريد الإلكتروني
        </Label>
        <Input id="email" type="email" placeholder="your@email.com" className="glass-card bg-white/5 text-white border-4 border-white/20 h-14 text-lg placeholder:text-white/40 focus:border-button-primary rounded-none" {...register("email")} disabled={isSubmitting} />
        {errors.email && <p className="text-sm text-red-400 text-right font-bold">{errors.email.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full bg-button-primary text-white hover:bg-button-primary-hover border-4 border-button-primary hover:border-button-primary-hover h-16 text-lg font-black rounded-none transition-all" disabled={isSubmitting}>
        {isSubmitting ? <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" strokeWidth={3} />
            جاري التسجيل...
          </> : "احجز مكانك الآن"}
      </Button>

      <p className="text-sm text-center font-bold text-yellow-950">
        لن نرسل لك رسائل غير مرغوبة.    
      </p>
    </form>;
};