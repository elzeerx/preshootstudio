import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Search, FileText, Video, Image, BookOpen, User, LogOut, Zap, Target, Lightbulb, Loader2 } from "lucide-react";
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
      title: "بحث ذكي",
      description: "نجهّز لك ملخص بحث منظم ومصادر موثوقة لموضوعك"
    },
    {
      icon: FileText,
      title: "سكريبتات جاهزة",
      description: "من الريلز القصير إلى الفيديو الطويل، كل شيء جاهز"
    },
    {
      icon: Video,
      title: "خطة B-Roll",
      description: "لقطات مقترحة وزوايا تصوير احترافية لمحتواك"
    },
    {
      icon: Image,
      title: "برومبتات للذكاء الاصطناعي",
      description: "برومبتات احترافية جاهزة لتوليد الصور والفيديو"
    },
    {
      icon: BookOpen,
      title: "مقالات SEO",
      description: "حوّل محتواك إلى مقالات محسّنة لمحركات البحث"
    },
    {
      icon: Zap,
      title: "حزمة تصدير",
      description: "ملف JSON + Markdown لكل شيء في مكان واحد"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 sticky top-0 bg-background/80 backdrop-blur-sm z-50 border-b border-border/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">PreShoot AI</h1>
              <p className="text-xs text-muted-foreground">مساعدك الشخصي قبل التصوير وبعده</p>
            </div>
          </div>
          <div className="flex gap-2">
            {user ? (
              <>
                <Link to="/projects">
                  <Button variant="outline" size="sm">
                    مشاريعي
                  </Button>
                </Link>
                <Link to="/instructions">
                  <Button variant="ghost" size="sm">
                    التعليمات
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="ms-2 w-4 h-4" />
                      الملف الشخصي
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="ms-2 w-4 h-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/instructions">
                  <Button variant="ghost" size="sm">
                    التعليمات
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">أداة صناع المحتوى الاحترافية</span>
            </div>
            
            <h1 className="heading-1 mb-4 bg-gradient-to-l from-primary via-foreground to-primary bg-clip-text text-transparent">
              PreShoot AI
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/90 font-medium mb-4">
              مساعدك الشخصي قبل التصوير وبعده
            </p>
            
            <p className="body-text-secondary max-w-2xl mx-auto">
              حوّل فكرة واحدة إلى بحث شامل، سكريبتات احترافية، خطة B-Roll، برومبتات ذكاء اصطناعي، ومقال محسّن… في دقائق معدودة
            </p>
          </div>

          {/* Create Project Form */}
          <Card className="mb-16 border-2 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Lightbulb className="w-6 h-6 text-primary" />
                ابدأ مشروعك الجديد
              </CardTitle>
              <CardDescription className="text-base">
                اكتب الموضوع اللي حاب تتكلم عنه في الفيديو، والباقي على PreShoot AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-base">موضوع المشروع</Label>
                  <Input
                    id="topic"
                    type="text"
                    placeholder="مثال: كيف تبدأ مشروع تجاري ناجح من الصفر"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isCreating}
                    className="text-base h-12"
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isCreating}
                  className="w-full text-base"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Sparkles className="ms-2 w-5 h-5" />
                      إنشاء مشروع جديد
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-3">ليش PreShoot AI؟</h2>
              <p className="text-muted-foreground">كل ما تحتاجه لصناعة محتوى احترافي في منصة واحدة</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border/50">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 PreShoot AI. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
