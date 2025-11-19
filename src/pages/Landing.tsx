import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { FAQSection } from "@/components/landing/FAQSection";
import { FAQSectionSkeleton } from "@/components/landing/FAQSectionSkeleton";
import { ServiceCard } from "@/components/landing/ServiceCard";
import { ServiceCardSkeleton } from "@/components/landing/ServiceCardSkeleton";
import {
  Zap,
  Sparkles,
  Target,
  Search,
  Lightbulb,
  FileText,
  Video,
  Image,
  BookOpen,
  Film,
  Mail,
  Twitter,
  Linkedin,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import preshootLogoNew from "@/assets/preshoot-logo-new.png";

const Landing = () => {
  const [isServicesLoaded, setIsServicesLoaded] = useState(false);
  const [isFAQLoaded, setIsFAQLoaded] = useState(false);

  useEffect(() => {
    // Simulate content loading for services section
    const servicesTimer = setTimeout(() => {
      setIsServicesLoaded(true);
    }, 800);

    // Simulate content loading for FAQ section (slightly delayed)
    const faqTimer = setTimeout(() => {
      setIsFAQLoaded(true);
    }, 1200);

    return () => {
      clearTimeout(servicesTimer);
      clearTimeout(faqTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header with Logo */}
      <header className="py-6 md:py-8 px-4 bg-background border-b-4 border-foreground">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="p-4 border-4 border-button-primary bg-button-primary/10 brutal-shadow">
            <img 
              src={preshootLogoNew} 
              alt="PreShoot Studio" 
              className="h-12 md:h-16 lg:h-20 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-16 bg-background">
        {/* Brutalist geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" dir="ltr">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-button-primary/20 rotate-12" />
          <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-button-primary/15" />
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-button-primary/10 border-4 border-button-primary/30 -rotate-45" />
          <div className="absolute top-40 right-1/4 w-16 h-16 border-4 border-button-primary/20 rotate-45" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 animate-fadeInUp">
            <div className="flex items-center gap-3 px-6 py-3 border-4 border-button-primary bg-button-primary/10">
              <span className="text-sm md:text-base font-black text-button-primary">
                الأداة الاحترافية لصنّاع المحتوى
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground leading-tight max-w-5xl">
              حوّل أفكارك إلى محتوى احترافي في دقائق
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl leading-relaxed font-bold">
              PreShoot Studio هو مساعدك الذكي الذي يجهّز لك كل شيء قبل التصوير وبعده.
              من البحث إلى السكريبت، من B-Roll إلى المقال. كل ما تحتاجه في مكان واحد.
            </p>

            <div className="flex flex-col sm:flex-row-reverse gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="text-lg h-16 px-8 border-4 border-button-primary rounded-none font-black brutal-shadow hover:brutal-shadow-hover transition-all">
                <Link to="/auth">ابدأ الآن مجانًا</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg h-16 px-8 border-4 rounded-none font-black hover:bg-foreground hover:text-background transition-all">
                <Link to="#services">شاهد كيف يعمل</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-secondary/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground">
              ماذا نقدم لك؟
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-bold">
              نظام متكامل يختصر ساعات العمل إلى دقائق معدودة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card variant="glass" className="p-8 md:p-10 border-4 border-white/20">
              <div className="flex flex-col items-end text-right space-y-6">
                <div className="w-16 h-16 rounded border-4 border-button-primary/30 flex items-center justify-center">
                  <Zap className="w-10 h-10 md:w-12 md:h-12 text-button-primary" strokeWidth={3} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground">
                  من الفكرة إلى المحتوى في دقائق
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-bold">
                  لا مزيد من قضاء ساعات في البحث والتخطيط. فقط أدخل موضوعك واحصل على
                  محتوى احترافي جاهز للنشر في دقائق معدودة.
                </p>
              </div>
            </Card>

            <Card variant="glass" className="p-8 md:p-10 border-4 border-white/20">
              <div className="flex flex-col items-end text-right space-y-6">
                <div className="w-16 h-16 rounded border-4 border-button-secondary/30 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-button-secondary" strokeWidth={3} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground">
                  محتوى احترافي بذكاء اصطناعي
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-bold">
                  استخدم قوة الذكاء الاصطناعي المتقدم لإنتاج محتوى عالي الجودة يضاهي
                  عمل المحترفين، مع الحفاظ على أسلوبك الخاص.
                </p>
              </div>
            </Card>

            <Card variant="glass" className="p-8 md:p-10 border-4 border-white/20">
              <div className="flex flex-col items-end text-right space-y-6">
                <div className="w-16 h-16 rounded border-4 border-button-primary/30 flex items-center justify-center">
                  <Target className="w-10 h-10 md:w-12 md:h-12 text-button-primary" strokeWidth={3} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground">
                  كل ما تحتاجه في مكان واحد
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-bold">
                  من البحث والتبسيط إلى السكريبتات والمقالات، كل أدواتك في منصة واحدة
                  متكاملة وسهلة الاستخدام.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-background">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground">
              خدماتنا الشاملة
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-bold">
              أدوات احترافية لكل مرحلة من مراحل إنتاج المحتوى
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {!isServicesLoaded ? (
              <>
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
              </>
            ) : (
              <>
                <ServiceCard
                  icon={Search}
                  title="بحث ذكي معمّق"
                  description="احصل على بحث شامل ومعمّق حول أي موضوع مع مصادر موثوقة وتحليل دقيق للمعلومات."
                  delay={1}
                />
                <ServiceCard
                  icon={Lightbulb}
                  title="تبسيط الأفكار المعقدة"
                  description="حوّل المواضيع المعقدة إلى محتوى سهل الفهم ومناسب لجمهورك المستهدف."
                  delay={2}
                />
                <ServiceCard
                  icon={FileText}
                  title="سكريبتات جاهزة للتصوير"
                  description="احصل على سكريبتات احترافية منظمة ومكتوبة بأسلوب جذاب وجاهزة للتصوير مباشرة."
                  delay={3}
                />
                <ServiceCard
                  icon={Video}
                  title="خطط B-Roll احترافية"
                  description="خطط تصوير تفصيلية مع اقتراحات للقطات B-Roll التي تثري محتواك البصري."
                  delay={4}
                />
                <ServiceCard
                  icon={Image}
                  title="برومبتات AI للصور"
                  description="احصل على برومبتات جاهزة لإنشاء صور مذهلة باستخدام أدوات الذكاء الاصطناعي."
                  delay={5}
                />
                <ServiceCard
                  icon={BookOpen}
                  title="مقالات SEO محسّنة"
                  description="مقالات احترافية محسّنة لمحركات البحث مع كلمات مفتاحية وبنية مثالية."
                  delay={6}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-muted/20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground">
              الأسئلة الشائعة
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-bold">
              إجابات على أكثر الأسئلة تكراراً
            </p>
          </div>

          {!isFAQLoaded ? <FAQSectionSkeleton /> : <FAQSection />}
        </div>
      </section>

      {/* Early Access / Beta Signup - Glassmorphic + Brutalist */}
      <section className="relative py-24 px-4 bg-background overflow-hidden">
        {/* Geometric Background Elements (Brutalist) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-20 w-32 h-32 border-4 border-button-primary/30 rotate-12" />
          <div className="absolute bottom-20 left-10 w-48 h-48 border-4 border-button-primary/20" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-button-primary/10 border-4 border-button-primary/40 -rotate-45" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Glassmorphic Container */}
          <div className="glass-card p-12 border-4 border-white/20 text-center space-y-8">
            {/* Title Section */}
            <div className="space-y-6">
              <div className="inline-block p-6 border-4 border-button-primary bg-button-primary/20 backdrop-blur-md">
                <Film className="w-16 h-16 text-button-primary" strokeWidth={3} />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                انضم إلى الوصول المبكر
              </h2>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto font-bold">
                كن من أوائل المستخدمين واحصل على ميزات حصرية وأسعار خاصة
              </p>
              
              {/* Brutalist Badge */}
              <div className="inline-block px-6 py-3 bg-button-primary border-4 border-button-primary-hover">
                <span className="text-white font-black text-sm">
                  🎁 خصم 50% للمشتركين الأوائل
                </span>
              </div>
            </div>
            
            {/* Signup Form */}
            <BetaSignupForm />
          </div>
        </div>
      </section>

      {/* Footer - Brutalist Redesign */}
      <footer className="bg-[#0A0A0A] text-background py-16 px-4 border-t-4 border-button-primary" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Top Section: Logo Only */}
          <div className="mb-16 pb-16 border-b-4 border-white/10 flex justify-center">
            {/* Brand Section - Centered White Logo */}
            <div className="text-center">
              <img src={preshootLogoNew} alt="PreShoot Studio" className="h-16 w-auto brightness-0 invert" />
              <p className="text-lg text-white/70 max-w-md mx-auto font-bold mt-6">
                استوديو احترافي لتجهيز محتواك من الفكرة إلى النشر
              </p>
            </div>
          </div>
          
          {/* Middle Section: Links Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-white border-r-4 border-button-primary pr-4">
                روابط سريعة
              </h4>
              <ul className="space-y-3 text-right">
                <li><a href="#services" className="text-white/70 hover:text-button-primary font-bold transition-colors border-b-2 border-transparent hover:border-button-primary pb-1">خدماتنا</a></li>
                <li><a href="#" className="text-white/70 hover:text-button-primary font-bold transition-colors border-b-2 border-transparent hover:border-button-primary pb-1">الأسعار</a></li>
                <li><a href="#faq" className="text-white/70 hover:text-button-primary font-bold transition-colors border-b-2 border-transparent hover:border-button-primary pb-1">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-white border-r-4 border-button-primary pr-4">
                موارد
              </h4>
              <ul className="space-y-3 text-right">
                <li><a href="#" className="text-white/70 hover:text-button-primary font-bold transition-colors border-b-2 border-transparent hover:border-button-primary pb-1">المدونة</a></li>
                <li><a href="#" className="text-white/70 hover:text-button-primary font-bold transition-colors border-b-2 border-transparent hover:border-button-primary pb-1">دليل الاستخدام</a></li>
                <li><a href="#" className="text-white/70 hover:text-button-primary font-bold transition-colors border-b-2 border-transparent hover:border-button-primary pb-1">الدعم الفني</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-white border-r-4 border-button-primary pr-4">
                تواصل معنا
              </h4>
              <ul className="space-y-3 text-right">
                <li><a href="mailto:info@preshoot.studio" className="text-white/70 hover:text-button-primary font-bold transition-colors border-b-2 border-transparent hover:border-button-primary pb-1">البريد الإلكتروني</a></li>
                <li><a href="#" className="text-white/70 hover:text-button-primary font-bold transition-colors border-b-2 border-transparent hover:border-button-primary pb-1">Twitter / X</a></li>
                <li><a href="#" className="text-white/70 hover:text-button-primary font-bold transition-colors border-b-2 border-transparent hover:border-button-primary pb-1">LinkedIn</a></li>
              </ul>
            </div>
            
            {/* Admin */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-white border-r-4 border-button-primary pr-4">
                للمسؤولين
              </h4>
              <Link 
                to="/admin/login" 
                className="inline-flex items-center gap-2 text-white/70 hover:text-button-primary font-bold transition-colors flex-row-reverse border-b-2 border-transparent hover:border-button-primary pb-1"
              >
                <span>تسجيل دخول الإدارة</span>
                <Shield className="w-4 h-4" strokeWidth={3} />
              </Link>
            </div>
          </div>
          
          {/* Bottom Section: Social + Copyright */}
          <div className="flex flex-col lg:flex-row-reverse justify-between items-center gap-6 pt-8 border-t-4 border-white/10">
            {/* Social Links (Brutalist Icons) */}
            <div className="flex gap-4">
              <a href="mailto:info@preshoot.studio" className="w-12 h-12 border-4 border-white/20 hover:border-button-primary flex items-center justify-center transition-colors">
                <Mail className="w-6 h-6 text-white" strokeWidth={3} />
              </a>
              <a href="#" className="w-12 h-12 border-4 border-white/20 hover:border-button-primary flex items-center justify-center transition-colors">
                <Twitter className="w-6 h-6 text-white" strokeWidth={3} />
              </a>
              <a href="#" className="w-12 h-12 border-4 border-white/20 hover:border-button-primary flex items-center justify-center transition-colors">
                <Linkedin className="w-6 h-6 text-white" strokeWidth={3} />
              </a>
            </div>
            
            {/* Copyright */}
            <p className="text-white/50 text-sm font-bold">
              © 2024 PreShoot Studio. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
