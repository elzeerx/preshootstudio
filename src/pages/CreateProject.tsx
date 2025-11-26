import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Zap, Lightbulb, Loader2, Wand2, RefreshCw, GraduationCap, Briefcase, Heart, Tv, BookOpen, User, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppHeader } from "@/components/common/AppHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AppFooter } from "@/components/common/AppFooter";
import { useAuth } from "@/contexts/AuthContext";
import { AISuggestionsSkeleton } from "@/components/projects/AISuggestionsSkeleton";

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<"factual" | "creative" | "personal" | "opinion">("factual");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const contentTypes = [
    { 
      id: "factual" as const, 
      label: "أبحاث ومعلومات", 
      description: "محتوى علمي، تقني، أعمال",
      icon: BookOpen,
      color: "text-blue-500"
    },
    { 
      id: "creative" as const, 
      label: "ترفيه وإبداع", 
      description: "فلوجات، ألعاب، مراجعات",
      icon: Sparkles,
      color: "text-purple-500"
    },
    { 
      id: "personal" as const, 
      label: "تجارب شخصية", 
      description: "قصص، أسلوب حياة",
      icon: Heart,
      color: "text-pink-500"
    },
    { 
      id: "opinion" as const, 
      label: "رأي وتحليل", 
      description: "تعليقات، آراء، نقاشات",
      icon: MessageSquare,
      color: "text-orange-500"
    },
  ];

  const categories = [
    { id: "all", label: "الكل", icon: Sparkles },
    { id: "educational", label: "تعليمية", icon: GraduationCap },
    { id: "business", label: "أعمال", icon: Briefcase },
    { id: "lifestyle", label: "أسلوب حياة", icon: Heart },
    { id: "entertainment", label: "ترفيهية", icon: Tv },
  ];

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setError("");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const { data, error: fetchError } = await supabase.functions.invoke('suggest-topics', {
        body: { userId: user?.id || null, category: selectedCategory }
      });

      if (fetchError) {
        console.error('Error fetching suggestions:', fetchError);
        toast.error("حدث خطأ في جلب الاقتراحات");
        return;
      }

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        toast.success("تم جلب الاقتراحات بنجاح!");
      } else {
        toast.error("لم يتم العثور على اقتراحات");
      }
    } catch (err) {
      console.error("Unexpected error fetching suggestions:", err);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
    setShowSuggestions(false);
  };

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
          content_type: contentType,
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
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10 flex-1">
        <Breadcrumbs />
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
                {/* Content Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    نوع المحتوى
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contentTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = contentType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setContentType(type.id)}
                          disabled={isCreating}
                          className={`
                            relative p-4 rounded-lg border-2 text-right transition-all
                            ${isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-border hover:border-primary/50 hover:bg-accent/50'
                            }
                            ${isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : type.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm mb-1">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="topic" className="text-base font-semibold">
                      موضوع المشروع
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fetchSuggestions}
                      disabled={isLoadingSuggestions || isCreating}
                      className="gap-2"
                    >
                      {isLoadingSuggestions ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الجلب...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          اقتراحات AI
                        </>
                      )}
                    </Button>
                  </div>
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

                {/* AI Suggestions Loading */}
                {isLoadingSuggestions && <AISuggestionsSkeleton />}

                {/* AI Suggestions */}
                {!isLoadingSuggestions && showSuggestions && suggestions.length > 0 && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Category Filters */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        اختر الفئة
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <Button
                              key={cat.id}
                              type="button"
                              variant={selectedCategory === cat.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(cat.id);
                                fetchSuggestions();
                              }}
                              disabled={isLoadingSuggestions || isCreating}
                              className="gap-2"
                            >
                              <Icon className="w-4 h-4" />
                              {cat.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground">
                        اقتراحات AI - اختر موضوعاً أو اكتب موضوعك الخاص
                      </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="outline"
                          dir="rtl"
                          className="h-auto min-h-[60px] w-full px-4 py-3 text-right justify-start hover:bg-primary/10 hover:border-primary/50 transition-colors whitespace-normal break-words overflow-hidden animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isCreating}
                        >
                          <span className="w-full text-sm font-medium leading-relaxed break-words text-right">
                            {suggestion}
                          </span>
                        </Button>
                      ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={fetchSuggestions}
                          disabled={isLoadingSuggestions || isCreating}
                          className="gap-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
                          تحديث
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSuggestions(false)}
                          className="flex-1"
                        >
                          إخفاء الاقتراحات
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

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

      <AppFooter />
    </div>
  );
};

export default CreateProject;
