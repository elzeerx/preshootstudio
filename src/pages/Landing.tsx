import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BetaSignupForm } from "@/components/landing/BetaSignupForm";
import { FAQSection } from "@/components/landing/FAQSection";
import { ServiceCard } from "@/components/landing/ServiceCard";
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
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header with Logo */}
      <header className="py-6 md:py-8 px-4 bg-background border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto flex justify-center">
          <img 
            src={preshootLogoNew} 
            alt="PreShoot Studio" 
            className="h-16 md:h-20 lg:h-24 w-auto"
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-16 bg-background">
        {/* Abstract geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" dir="ltr">
          <div className="absolute top-20 right-10 w-32 h-32 border-4 border-foreground/10 rotate-12" />
          <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full border-4 border-secondary/20" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/5 -rotate-45" />
          <div className="absolute top-40 left-1/4 w-16 h-16 border-4 border-accent/10 rotate-45" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 animate-fadeInUp">
            <div className="flex items-center gap-3 px-6 py-2 border-2 border-accent rounded-full bg-accent/5">
              <span className="text-sm md:text-base font-bold text-accent">
                الأداة الاحترافية لصنّاع المحتوى
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-foreground leading-tight max-w-5xl">
              حوّل أفكارك إلى محتوى احترافي في دقائق
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
              PreShoot Studio هو مساعدك الذكي الذي يجهّز لك كل شيء قبل التصوير وبعده.
              من البحث إلى السكريبت، من B-Roll إلى المقال. كل ما تحتاجه في مكان واحد.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="text-lg h-14 px-8">
                <Link to="/auth">ابدأ الآن مجانًا</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg h-14 px-8">
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              ماذا نقدم لك؟
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              نظام متكامل يختصر ساعات العمل إلى دقائق معدودة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card variant="editorial" className="p-8 md:p-10 hover:shadow-editorial-hover transition-all duration-300 hover:-translate-y-2">
              <div className="flex flex-col items-end text-right space-y-6">
                <div className="p-5 bg-accent text-accent-foreground rounded-lg">
                  <Zap className="w-10 h-10 md:w-12 md:h-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  من الفكرة إلى المحتوى في دقائق
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  لا مزيد من قضاء ساعات في البحث والتخطيط. فقط أدخل موضوعك واحصل على
                  محتوى احترافي جاهز للنشر في دقائق معدودة.
                </p>
              </div>
            </Card>

            <Card variant="editorial" className="p-8 md:p-10 hover:shadow-editorial-hover transition-all duration-300 hover:-translate-y-2">
              <div className="flex flex-col items-end text-right space-y-6">
                <div className="p-5 bg-secondary text-secondary-foreground rounded-lg">
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  محتوى احترافي بذكاء اصطناعي
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  استخدم قوة الذكاء الاصطناعي المتقدم لإنتاج محتوى عالي الجودة يضاهي
                  عمل المحترفين، مع الحفاظ على أسلوبك الخاص.
                </p>
              </div>
            </Card>

            <Card variant="editorial" className="p-8 md:p-10 hover:shadow-editorial-hover transition-all duration-300 hover:-translate-y-2">
              <div className="flex flex-col items-end text-right space-y-6">
                <div className="p-5 bg-foreground text-background rounded-lg">
                  <Target className="w-10 h-10 md:w-12 md:h-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  كل ما تحتاجه في مكان واحد
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              خدماتنا الشاملة
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              أدوات احترافية لكل مرحلة من مراحل إنتاج المحتوى
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-muted/20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              الأسئلة الشائعة
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              إجابات على أكثر الأسئلة تكراراً
            </p>
          </div>

          <FAQSection />
        </div>
      </section>

      {/* Early Access / Beta Signup */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Film className="w-16 h-16 md:w-20 md:h-20" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background">
              انضم إلى الوصول المبكر
            </h2>
            <p className="text-lg md:text-xl text-background/80 max-w-2xl mx-auto">
              كن من أوائل المستخدمين واحصل على ميزات حصرية وأسعار خاصة للمشتركين الأوائل
            </p>
          </div>

          <BetaSignupForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 md:py-16 px-4 md:px-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Column 1: Brand */}
            <div className="space-y-4 text-right" dir="rtl">
              <div className="flex items-center gap-3 justify-end">
                <img src={preshootLogoNew} alt="PreShoot Studio" className="h-8 w-auto" />
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                استوديو احترافي لتجهيز محتواك من الفكرة إلى النشر
              </p>
              <div className="flex gap-4 justify-end">
                <a href="mailto:info@preshoot.studio" className="p-2 hover:text-accent transition-colors">
                  <Mail className="w-5 h-5" strokeWidth={1.5} />
                </a>
                <a href="#" className="p-2 hover:text-accent transition-colors">
                  <Twitter className="w-5 h-5" strokeWidth={1.5} />
                </a>
                <a href="#" className="p-2 hover:text-accent transition-colors">
                  <Linkedin className="w-5 h-5" strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4 text-right" dir="rtl">
              <h3 className="text-lg font-bold text-background">روابط سريعة</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#services" className="text-muted-foreground hover:text-background transition-colors">
                    خدماتنا
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-muted-foreground hover:text-background transition-colors">
                    الأسئلة الشائعة
                  </a>
                </li>
                <li>
                  <a href="#beta" className="text-muted-foreground hover:text-background transition-colors">
                    انضم للنسخة التجريبية
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-4 text-right" dir="rtl">
              <h3 className="text-lg font-bold text-background">موارد</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-background transition-colors">
                    المدونة
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-background transition-colors">
                    دليل الاستخدام
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-background transition-colors">
                    الدعم الفني
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Admin */}
            <div className="space-y-4 text-right" dir="rtl">
              <h3 className="text-lg font-bold text-background">تواصل معنا</h3>
              <ul className="space-y-2">
                <li className="text-muted-foreground">
                  <a href="mailto:info@preshoot.studio" className="hover:text-background transition-colors">
                    info@preshoot.studio
                  </a>
                </li>
                <li className="text-muted-foreground">
                  <a href="#" className="hover:text-background transition-colors">
                    Twitter / X
                  </a>
                </li>
                <li className="text-muted-foreground">
                  <a href="#" className="hover:text-background transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
              
              {/* Admin Section */}
              <div className="pt-4 border-t border-secondary/30">
                <h4 className="text-sm font-bold text-muted-foreground mb-2">للمسؤولين</h4>
                <Link 
                  to="/admin/login" 
                  className="inline-flex items-center gap-2 text-sm text-accent hover:text-background transition-colors"
                >
                  <Shield className="w-4 h-4" strokeWidth={1.5} />
                  <span>تسجيل دخول الإدارة</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-secondary/30 text-center" dir="rtl">
            <p className="text-sm text-muted-foreground">
              © 2024 PreShoot Studio. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
