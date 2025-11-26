import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { GradientBackground } from "@/components/landing/GradientBackground";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { FAQSection } from "@/components/landing/FAQSection";
import { APP_ROUTES } from "@/lib/constants";
import { formatTokens } from "@/lib/helpers/formatters";
import preshootLogoNew from "@/assets/preshoot-logo-new.png";
import {
  Search,
  FileText,
  Film,
  Image,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Menu,
  X,
  CheckCircle2,
  Shield,
  Zap,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  price_monthly_usd: number;
  price_yearly_usd: number | null;
  token_limit_monthly: number;
  project_limit_monthly: number | null;
  redo_limit_per_tab: number;
  export_enabled: boolean | null;
  priority_support: boolean | null;
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (!error && data) {
      setPlans(data);
    }
  };

  const getPrice = (plan: Plan) => {
    return billingPeriod === "monthly"
      ? plan.price_monthly_usd
      : plan.price_yearly_usd || plan.price_monthly_usd * 10;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileMenuOpen(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: "البحث الذكي",
      description: "اجمع معلومات من 100+ مصدر في ثوانٍ",
      badge: "مميز",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: FileText,
      title: "كتابة السكريبت",
      description: "نصوص احترافية بأسلوبك الخاص",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: Film,
      title: "خطط B-Roll",
      description: "لقطات مقترحة لكل مشهد",
      badge: "جديد",
      gradient: "from-orange-500/20 to-red-500/20",
    },
    {
      icon: Image,
      title: "برومبتات الصور",
      description: "جاهزة لـ Midjourney و Nano Banana, FLUX 2",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: TrendingUp,
      title: "تحسين SEO",
      description: "مقالات ووصف متوافق مع محركات البحث",
      gradient: "from-indigo-500/20 to-violet-500/20",
    },
    {
      icon: Sparkles,
      title: "تبسيط المحتوى",
      description: "حوّل المعقد إلى بسيط لأي جمهور",
      gradient: "from-yellow-500/20 to-amber-500/20",
    },
  ];

  const trustSignals = [
    { icon: CheckCircle2, text: "إلغاء في أي وقت" },
    { icon: Shield, text: "دفع آمن" },
    { icon: Zap, text: "تفعيل فوري" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300 ${scrolled ? "scrolled" : ""}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/src/assets/preshoot-logo-new.png"
                alt="PreShoot Logo"
                className="h-8 w-auto brightness-0 invert group-hover:scale-110 transition-transform duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("الخدمات")}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                الخدمات
              </button>
              <button
                onClick={() => scrollToSection("كيف-يعمل")}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                كيف يعمل
              </button>
              <Link
                to={APP_ROUTES.PRICING}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                الأسعار
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to={APP_ROUTES.AUTH}>
                <Button variant="ghost" size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to={APP_ROUTES.REQUEST_ACCESS}>
                <Button size="sm" className="btn-ripple shadow-lg">
                  ابدأ مجاناً
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border animate-fade-in">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection("الخدمات")}
                className="block w-full text-right py-2 text-foreground hover:text-primary transition-colors"
              >
                الخدمات
              </button>
              <button
                onClick={() => scrollToSection("كيف-يعمل")}
                className="block w-full text-right py-2 text-foreground hover:text-primary transition-colors"
              >
                كيف يعمل
              </button>
              <Link
                to={APP_ROUTES.PRICING}
                className="block w-full text-right py-2 text-foreground hover:text-primary transition-colors"
              >
                الأسعار
              </Link>
              <div className="pt-3 space-y-2">
                <Link to={APP_ROUTES.AUTH} className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to={APP_ROUTES.REQUEST_ACCESS} className="block">
                  <Button size="sm" className="w-full">
                    ابدأ مجاناً
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <GradientBackground />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                نسخة بيتا متاحة الآن
              </Badge>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                حوّل فكرتك إلى{" "}
                <span className="text-gradient-premium animate-gradient">
                  فيديو احترافي
                </span>
                <br />
                قبل أن تمسك الكاميرا
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                من البحث للسكريبت للـ B-Roll... كل شيء بضغطة زر
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={APP_ROUTES.REQUEST_ACCESS}>
                  <Button
                    size="lg"
                    className="btn-ripple text-lg px-8 py-6 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
                  >
                    ابدأ مجاناً - بدون بطاقة ائتمانية
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Trust signals */}
            <ScrollReveal delay={400}>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
                {trustSignals.map((signal, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <signal.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm">{signal.text}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Features Bento Grid */}
      <section className="py-24 relative" id="الخدمات">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-premium">
                كل ما تحتاجه في مكان واحد
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                أدوات متكاملة لإنتاج محتوى احترافي من الفكرة إلى التنفيذ
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 100} direction="scale">
                <FeatureCard {...feature} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-premium">
                خطط تناسب جميع الاحتياجات
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                ابدأ مجاناً أو اختر الخطة المثالية لك
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-3 bg-background/50 backdrop-blur-sm p-1 rounded-full border border-border/50">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    billingPeriod === "monthly"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  شهري
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    billingPeriod === "yearly"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  سنوي
                  <Badge className="mr-2 bg-accent text-accent-foreground">
                    وفّر 20%
                  </Badge>
                </button>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
            {plans.map((plan, index) => (
              <ScrollReveal key={plan.id} delay={index * 100} direction="up">
                <Card
                  className={`relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                    plan.slug === "pro" ? "border-primary shadow-xl scale-105" : ""
                  }`}
                >
                  {plan.slug === "pro" && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-center py-2 text-sm font-bold">
                      الأكثر شعبية
                    </div>
                  )}

                  <div className={`p-6 ${plan.slug === "pro" ? "pt-12" : ""}`}>
                    <h3 className="text-2xl font-bold mb-2">{plan.name_ar}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">${getPrice(plan)}</span>
                      <span className="text-muted-foreground">
                        /{billingPeriod === "monthly" ? "شهرياً" : "سنوياً"}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>
                          {plan.project_limit_monthly || "غير محدود"} مشروع/شهر
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{formatTokens(plan.token_limit_monthly)} توكن</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{plan.redo_limit_per_tab} إعادة/تبويب</span>
                      </div>
                    </div>

                    <Link to={APP_ROUTES.REQUEST_ACCESS}>
                      <Button
                        className={`w-full ${
                          plan.slug === "pro" ? "bg-primary hover:bg-primary/90" : ""
                        }`}
                        variant={plan.slug === "pro" ? "default" : "outline"}
                      >
                        {plan.slug === "free" ? "ابدأ مجاناً" : "اشترك الآن"}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="text-center">
              <Link to={APP_ROUTES.PRICING}>
                <Button variant="outline" size="lg" className="group">
                  عرض التفاصيل الكاملة
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-premium">
                الأسئلة الشائعة
              </h2>
              <p className="text-xl text-muted-foreground">
                إجابات لأكثر الأسئلة شيوعاً
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <FAQSection />
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 animate-gradient" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-6 bg-accent/20 text-accent-foreground border-accent/30">
                انضم للقائمة المنتظرة - الأماكن محدودة
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                جاهز لتحويل أفكارك إلى محتوى احترافي؟
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                ابدأ اليوم واحصل على كل ما تحتاجه لإنتاج محتوى مميز
              </p>
              <Link to={APP_ROUTES.REQUEST_ACCESS}>
                <Button
                  size="lg"
                  className="btn-ripple text-lg px-10 py-6 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110"
                >
                  ابدأ مجاناً الآن
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src={preshootLogoNew}
                alt="PreShoot Logo"
                className="h-8 w-auto brightness-0 invert"
              />
            </div>

            {/* Links */}
            <div className="flex flex-col items-center gap-4">
              {/* Navigation Links */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <Link to={APP_ROUTES.PRICING} className="hover:text-foreground transition-colors">
                  الأسعار
                </Link>
                <Link to={APP_ROUTES.AUTH} className="hover:text-foreground transition-colors">
                  تسجيل الدخول
                </Link>
                <Link to={APP_ROUTES.REQUEST_ACCESS} className="hover:text-foreground transition-colors">
                  طلب الوصول
                </Link>
              </div>

              {/* Legal Links */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <Link to={APP_ROUTES.TERMS} className="hover:text-foreground transition-colors">
                  الشروط والأحكام
                </Link>
                <Link to={APP_ROUTES.PRIVACY} className="hover:text-foreground transition-colors">
                  سياسة الخصوصية
                </Link>
                <Link to={APP_ROUTES.HELP} className="hover:text-foreground transition-colors">
                  مركز المساعدة
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/preshootstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/preshootstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 PreShoot Studio. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
