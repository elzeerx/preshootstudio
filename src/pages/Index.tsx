import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Search, FileText, Video, Image, BookOpen, User, LogOut, Zap, Target, Lightbulb, Loader2, ArrowLeft } from "lucide-react";
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

    if (!topic.trim()) {
      setError("رجاءً اكتب الموضوع أولًا.");
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        navigate("/auth");
        return;
      }

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
      description: "نجهّز لك ملخص بحث منظم ومصادر موثوقة لموضوعك",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Lightbulb,
      title: "تبسيط الفكرة",
      description: "حوّل فكرتك المعقدة إلى محتوى بسيط وسهل الفهم",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: FileText,
      title: "سكريبتات جاهزة",
      description: "من الريلز القصير إلى الفيديو الطويل، كل شيء جاهز",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Video,
      title: "خطة B-Roll",
      description: "لقطات مقترحة وزوايا تصوير احترافية لمحتواك",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Image,
      title: "برومبتات للذكاء الاصطناعي",
      description: "برومبتات احترافية جاهزة لتوليد الصور والفيديو",
      gradient: "from-rose-500 to-red-500",
    },
    {
      icon: BookOpen,
      title: "مقالات SEO",
      description: "حوّل محتواك إلى مقالات محسّنة لمحركات البحث",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-green/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-primary to-secondary p-2.5 rounded-2xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-l from-primary via-foreground to-primary bg-clip-text text-transparent">
                  PreShoot AI
                </h1>
                <p className="text-xs text-muted-foreground">مساعدك الشخصي قبل التصوير وبعده</p>
              </div>
            </Link>

            <div className="flex gap-2">
              {user ? (
                <>
                  <Link to="/projects">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
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
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center gap-2 cursor-pointer flex-row-reverse">
                          <span>الملف الشخصي</span>
                          <User className="w-4 h-4" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive flex-row-reverse">
                        <span>تسجيل الخروج</span>
                        <LogOut className="w-4 h-4" />
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
                    <Button size="sm" variant="default">
                      تسجيل الدخول
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-16 space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">أداة صناع المحتوى الاحترافية</span>
            </div>
            
            <h1 className="heading-hero bg-gradient-to-l from-primary via-foreground to-primary bg-clip-text text-transparent mb-6">
              PreShoot AI
            </h1>
            
            <p className="text-2xl md:text-3xl text-foreground font-semibold mb-6">
              مساعدك الشخصي قبل التصوير وبعده
            </p>
            
            <p className="body-text-secondary max-w-3xl mx-auto text-lg leading-relaxed">
              حوّل فكرة واحدة إلى بحث شامل، سكريبتات احترافية، خطة B-Roll، برومبتات ذكاء اصطناعي، ومقال محسّن… في دقائق معدودة
            </p>
          </div>

          {/* Create Project Form */}
          <Card variant="editorial" className="mb-20 max-w-3xl mx-auto animate-scale-in">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">ابدأ مشروعك الجديد</CardTitle>
              <CardDescription className="text-base mt-2">
                اكتب الموضوع اللي حاب تتكلم عنه في الفيديو، والباقي على PreShoot AI
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="topic" className="text-base font-semibold">
                    موضوع المشروع
                  </Label>
                  <div className="relative">
                    <Input
                      id="topic"
                      type="text"
                      placeholder="مثال: أفضل 10 نصائح لتحسين الإنتاجية في العمل"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={isCreating}
                      className="text-lg pr-12"
                    />
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive font-medium animate-fade-in">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isCreating}
                  variant="default"
                  size="lg"
                  className="w-full text-lg gap-3"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      ابدأ الآن
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="heading-2 mb-3">ماذا يقدم PreShoot AI؟</h2>
              <p className="body-text-secondary max-w-2xl mx-auto">
                كل ما تحتاجه لإنشاء محتوى احترافي من البحث إلى التصدير
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm bg-card/95 hover:scale-105"
                  >
                    <CardHeader className="text-right">
                      <div className="flex items-center gap-3 mb-3 justify-end flex-row-reverse">
                        <div className="p-3 rounded-lg bg-button-primary/10 group-hover:bg-button-primary/20 transition-colors">
                          <FeatureIcon className="w-6 h-6 text-button-primary" strokeWidth={2} />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base text-right">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 PreShoot AI. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6">
              <Link to="/instructions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                التعليمات
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
