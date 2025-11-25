import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, Sparkles, Target, Search, Lightbulb, FileText, Video, Image, BookOpen, Film, Mail, Twitter, Linkedin, ArrowUpRight } from "lucide-react";
import preshootLogoNew from "@/assets/preshoot-logo-new.png";

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="text-white font-sans selection:bg-white/20">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-4 bg-black/50 backdrop-blur-md border-b border-white/10" : "py-8"}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={preshootLogoNew} alt="PreShoot Studio" className="h-8 w-auto brightness-0 invert" />
          </div>
          <div className="flex items-center gap-6">
            <Link to="/auth" className="hidden md:block text-sm font-medium hover:text-gray-300 transition-colors">تسجيل الدخول</Link>
            <Link to="/auth">
              <Button className="rounded-full bg-white text-black hover:bg-gray-200 px-6 font-bold neon-glow transition-all">
                ابدأ المشروع
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 min-h-screen flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3 mb-8 animate-fadeInUp">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono text-gray-400 tracking-wider">AI-POWERED STUDIO</span>
            </div>

            <h1 className="text-massive mb-8 leading-none animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              PRESHOOT <br />
              <span className="text-outline">STUDIO</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              حول أفكارك إلى محتوى احترافي في ثوانٍ. منصة متكاملة لصناع المحتوى، مدعومة بالذكاء الاصطناعي.
            </p>

            <div className="flex flex-wrap gap-4 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
              <Link to="/request-access">
                <Button className="h-14 px-8 rounded-full bg-white text-black hover:bg-gray-200 text-lg font-bold neon-glow flex items-center gap-2">
                  سجّل للدخول المبكر <ArrowUpRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content text-6xl font-black text-white/10 flex gap-12 items-center">
            <span>RESEARCH</span> <span>•</span> <span>SCRIPTING</span> <span>•</span> <span>PLANNING</span> <span>•</span> <span>B-ROLL</span> <span>•</span> <span>SEO</span> <span>•</span>
            <span>RESEARCH</span> <span>•</span> <span>SCRIPTING</span> <span>•</span> <span>PLANNING</span> <span>•</span> <span>B-ROLL</span> <span>•</span> <span>SEO</span> <span>•</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Features */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <h2 className="text-5xl md:text-7xl font-bold">خدماتنا</h2>
            <p className="text-xl text-gray-400 max-w-md text-left">
              مجموعة أدوات متكاملة مصممة لتسريع عملية الإنتاج الإبداعي لديك.
            </p>
          </div>

          <div className="bento-grid">
            {/* Card 1: Research (Wide) */}
            <div className="bento-card bento-card-wide group">
              <div className="absolute top-4 right-4 p-3 bg-white/5 rounded-full">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div className="mt-12">
                <h3 className="text-3xl font-bold mb-4 group-hover:text-purple-400 transition-colors">بحث ذكي معمق</h3>
                <p className="text-gray-400 text-lg">
                  محرك بحث مدعوم بالذكاء الاصطناعي يجمع لك المعلومات والمصادر الموثوقة في ثوانٍ.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Card 2: Scripting (Tall) */}
            <div className="bento-card bento-card-tall group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-4">كتابة السكريبت</h3>
                <p className="text-gray-400 text-lg">
                  حول أفكارك إلى نصوص احترافية جاهزة للتصوير بأساليب متعددة.
                </p>
              </div>
              <div className="mt-8 p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-gray-500">
                {`> Generating script...\n> Tone: Professional\n> Duration: 60s\n> Done.`}
              </div>
            </div>

            {/* Card 3: B-Roll */}
            <div className="bento-card group">
              <Video className="w-8 h-8 mb-6 text-blue-400" />
              <h3 className="text-2xl font-bold mb-2">خطط B-Roll</h3>
              <p className="text-gray-400">اقتراحات بصرية دقيقة لكل مشهد.</p>
            </div>

            {/* Card 4: AI Images */}
            <div className="bento-card group">
              <Image className="w-8 h-8 mb-6 text-pink-400" />
              <h3 className="text-2xl font-bold mb-2">توليد الصور</h3>
              <p className="text-gray-400">برومبتات جاهزة لـ Midjourney و DALL-E.</p>
            </div>

            {/* Card 5: SEO (Wide) */}
            <div className="bento-card bento-card-wide group flex items-center justify-between">
              <div className="max-w-md">
                <h3 className="text-3xl font-bold mb-2">تحسين SEO</h3>
                <p className="text-gray-400 text-lg">
                  تصدير مقالات ووصف للفيديو متوافق مع محركات البحث لزيادة الوصول.
                </p>
              </div>
              <div className="hidden md:flex w-20 h-20 bg-green-500/20 rounded-full items-center justify-center">
                <Target className="w-10 h-10 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/10 pointer-events-none" />
        <div className="container mx-auto relative z-10">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter">
            مستعد لإطلاق إبداعك؟
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto">
            انضم إلى آلاف المبدعين الذين يستخدمون PreShoot لتسريع إنتاجهم.
          </p>
          
          <Link to="/request-access">
            <Button className="h-14 px-8 rounded-full bg-white text-black hover:bg-gray-200 text-lg font-bold neon-glow transition-transform hover:scale-105 flex items-center gap-2 mx-auto">
              طلب الوصول المبكر
              <ArrowUpRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black">
        <div className="container mx-auto flex flex-col items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <img src={preshootLogoNew} alt="PreShoot Studio" className="h-6 w-auto brightness-0 invert opacity-50" />
            <span className="text-gray-500 text-sm">© 2025 PreShoot Studio</span>
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;