import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Search, FileText, Video, Image, BookOpen, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [topic, setTopic] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // التحقق من أن الحقل غير فارغ
    if (!topic.trim()) {
      setError("رجاءً اكتب الموضوع أولًا.");
      return;
    }

    setIsCreating(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        navigate("/auth");
        return;
      }

      // إنشاء مشروع جديد في قاعدة البيانات
      const { data, error: insertError } = await supabase
        .from("projects")
        .insert({
          topic: topic.trim(),
          status: "new",
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating project:", insertError);
        toast.error("حدث خطأ غير متوقع، جرّب مرة ثانية.");
        return;
      }

      if (data) {
        toast.success("تم إنشاء المشروع بنجاح!");
        // إعادة التوجيه إلى صفحة المشروع
        navigate(`/projects/${data.id}`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("حدث خطأ غير متوقع، جرّب مرة ثانية.");
    } finally {
      setIsCreating(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: "بحث وتجميع معلومات",
      description: "جمع وتنظيم المعلومات حول أي موضوع بشكل شامل واحترافي"
    },
    {
      icon: FileText,
      title: "سكريبتات احترافية",
      description: "توليد سكريبتات فيديو منظمة وجاهزة للتصوير مباشرة"
    },
    {
      icon: Video,
      title: "اقتراحات B-Roll",
      description: "أفكار للقطات B-Roll المناسبة لمحتواك"
    },
    {
      icon: Image,
      title: "برومبتات للصور والفيديو",
      description: "توليد برومبتات احترافية لمولدات الذكاء الاصطناعي"
    },
    {
      icon: BookOpen,
      title: "مقالات جاهزة",
      description: "تحويل محتواك إلى مقالات SEO-friendly جاهزة للنشر"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">PreShoot AI</h1>
          </div>
          <div className="flex gap-2">
            {user ? (
              <>
                <Link to="/projects">
                  <Button variant="outline" size="sm">
                    مشاريعي
                  </Button>
                </Link>
                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 ml-2" />
                      حسابي
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 ml-2" />
                      الملف الشخصي
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
            <Link to="/instructions">
              <Button variant="outline" size="sm">
                التعليمات
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="heading-1 mb-6">
            PreShoot AI
          </h1>
          
          <p className="heading-3 text-primary mb-4 font-normal">
            مساعدك الشخصي قبل التصوير وبعده
          </p>
          
          <p className="body-text max-w-2xl mx-auto mb-12 leading-relaxed">
            حوّل أي فكرة إلى محتوى متكامل جاهز للإنتاج - من البحث إلى السكريبتات والبرومبتات
          </p>

          {/* Project Creation Form */}
          <Card className="max-w-2xl mx-auto p-8 bg-card border-2 border-primary/10 shadow-lg">
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div className="text-right space-y-3">
                <Label htmlFor="topic" className="text-lg font-semibold">
                  اكتب الموضوع اللي حاب تتكلم عنه
                </Label>
                <Input
                  id="topic"
                  type="text"
                  placeholder="مثال: أبي أتكلم عن معالجات Apple M5"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (error) setError("");
                  }}
                  className="text-lg h-12"
                  disabled={isCreating}
                />
                {error && (
                  <p className="text-sm text-destructive text-right">
                    {error}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full gap-2 h-12 text-lg"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    إنشاء مشروع جديد
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Info Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 border border-secondary/30 rounded-full mt-8">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
            <span className="text-sm font-medium text-foreground">جرّب الآن وابدأ مشروعك الأول</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="heading-2 text-center mb-12">المميزات القادمة</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary/20 bg-card"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="heading-3 text-xl">{feature.title}</h3>
                <p className="body-text-secondary text-sm">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack Info */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="heading-2 text-center mb-6">مدعوم بالذكاء الاصطناعي</h2>
          <p className="body-text text-center mb-8">
            يستخدم PreShoot AI أحدث نماذج الذكاء الاصطناعي لتوفير أفضل تجربة
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-background/50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-foreground">OpenAI GPT-5</h3>
              <p className="body-text-secondary text-sm">
                لتوليد المحتوى والسكريبتات والبرومبتات
              </p>
            </div>
            <div className="text-center p-6 bg-background/50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Anthropic Claude</h3>
              <p className="body-text-secondary text-sm">
                للبحث والتحليل وتبسيط المعلومات
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center border-t border-border mt-20">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl text-foreground">PreShoot AI</span>
        </div>
        <p className="body-text-secondary text-sm">
          نحول أفكارك إلى محتوى جاهز للإنتاج 🚀
        </p>
        <p className="body-text-secondary text-xs mt-4">
          تم البناء باستخدام React + TypeScript + Tailwind CSS
        </p>
      </footer>
    </div>
  );
};

export default Index;
