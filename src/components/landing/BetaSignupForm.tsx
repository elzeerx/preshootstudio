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
  name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }).max(100),
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }).max(255),
});

type FormData = z.infer<typeof formSchema>;

export const BetaSignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("beta_signups").insert([
        {
          name: data.name,
          email: data.email,
        },
      ]);

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
    return (
      <div className="text-center space-y-4 animate-fadeInUp">
        <div className="text-6xl">✓</div>
        <h3 className="text-2xl font-bold text-white">تم التسجيل بنجاح!</h3>
        <p className="text-white/80">سنتواصل معك عبر البريد الإلكتروني قريباً.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white text-right block">
          الاسم الكامل
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="أدخل اسمك الكامل"
          className="bg-white text-foreground border-2 border-foreground h-12 text-lg"
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-400 text-right">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white text-right block">
          البريد الإلكتروني
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          className="bg-white text-foreground border-2 border-foreground h-12 text-lg"
          {...register("email")}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-400 text-right">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent h-14 text-lg font-bold"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            جاري التسجيل...
          </>
        ) : (
          "احجز مكانك الآن"
        )}
      </Button>

      <p className="text-sm text-white/60 text-center">
        لن نرسل لك رسائل غير مرغوبة، وعد! 🤝
      </p>
    </form>
  );
};
