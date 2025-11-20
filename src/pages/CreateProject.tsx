import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Zap, Lightbulb, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import preshootLogoNew from "@/assets/preshoot-logo-new.png";

const CreateProject = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/10 border-b border-white/10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src={preshootLogoNew} alt="PreShoot Studio" className="h-8 w-auto brightness-0 invert" />
            </Link>

            <Link to="/projects">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                مشاريعي
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6 shadow-lg">
              <Lightbulb className="w-10 h-10 text-primary" />
            </div>
            <h1 className="heading-2 mb-3">مشروع جديد</h1>
            <p className="body-text-secondary max-w-2xl mx-auto">
              ابدأ مشروعك الجديد بكتابة الموضوع، والباقي على PreShoot AI
            </p>
          </div>

          {/* Create Project Form */}
          <Card variant="editorial" className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">ابدأ مشروعك الجديد</CardTitle>
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
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
