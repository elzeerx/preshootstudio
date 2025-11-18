import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft, AlertCircle, Calendar, FileText, Film, Search, Lightbulb, Video, Image, BookOpen, Package, Zap } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { OverviewTab } from "@/components/workspace/OverviewTab";
import { ResearchTab } from "@/components/workspace/ResearchTab";
import { SimplifyTab } from "@/components/workspace/SimplifyTab";
import { ScriptsTab } from "@/components/workspace/ScriptsTab";
import { BRollTab } from "@/components/workspace/BRollTab";
import { PromptsTab } from "@/components/workspace/PromptsTab";
import { ArticleTab } from "@/components/workspace/ArticleTab";
import { ExportTab } from "@/components/workspace/ExportTab";

interface Project {
  id: string;
  topic: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  research_status: string | null;
  scripts_status: string | null;
  broll_status: string | null;
  prompts_status: string | null;
  article_status: string | null;
  simplify_status: string | null;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading project:", error);
        setNotFound(true);
        return;
      }

      if (!data) {
        setNotFound(true);
        return;
      }

      setProject(data);
    } catch (err) {
      console.error("Unexpected error:", err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      new: "جديد",
      processing: "قيد التجهيز",
      ready: "جاهز",
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    const variantMap: Record<string, "default" | "secondary" | "outline"> = {
      new: "secondary",
      processing: "default",
      ready: "outline",
    };
    return variantMap[status] || "default";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy - h:mm a", { locale: ar });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6"></div>
          <p className="body-text-secondary text-lg break-words-rtl">جاري تحميل المشروع...</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="flex items-center gap-3 group w-fit">
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
          </div>
        </header>

        <main className="container mx-auto px-4 py-20 relative z-10">
          <Card variant="glass" className="max-w-xl mx-auto">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-destructive/10 to-destructive/5 mb-8">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
              <h2 className="text-3xl font-bold mb-4">المشروع غير موجود</h2>
              <p className="body-text-secondary mb-8 max-w-md mx-auto">
                ما قدرنا نلقى المشروع اللي تدور عنه، أو ما عندك صلاحية للوصول له
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/projects">
                  <Button variant="outline" size="lg" className="gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    مشاريعي
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="premium" size="lg">
                    الصفحة الرئيسية
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
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
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Project Header Card */}
          <Card variant="gradient" className="mb-8 overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
            <CardHeader className="relative pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/20">
                      <Film className="w-7 h-7 text-white" />
                    </div>
                    <Badge 
                      variant={getStatusVariant(project.status)} 
                      className="text-sm px-4 py-1 shadow-md"
                    >
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  
                  <div>
                    <CardTitle className="text-3xl md:text-4xl mb-3 leading-tight">
                      {project.topic}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
                      <Calendar className="w-4 h-4" />
                      <span>تم الإنشاء في {formatDate(project.created_at)}</span>
                    </CardDescription>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Zap className="w-4 h-4 ml-2" />
                    مشاركة
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="sticky top-[73px] z-40 backdrop-blur-xl bg-background/70 -mx-4 px-4 py-4 border-y border-border/50">
              <TabsList className="w-full overflow-x-auto bg-muted/50 p-1.5 rounded-2xl shadow-inner flex-nowrap justify-start md:justify-center">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-dark data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-2.5 gap-2 whitespace-nowrap transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger 
                  value="research"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-2.5 gap-2 whitespace-nowrap transition-all"
                >
                  <Search className="w-4 h-4" />
                  البحث
                </TabsTrigger>
                <TabsTrigger 
                  value="simplify"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-2.5 gap-2 whitespace-nowrap transition-all"
                >
                  <Lightbulb className="w-4 h-4" />
                  التبسيط
                </TabsTrigger>
                <TabsTrigger 
                  value="scripts"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-2.5 gap-2 whitespace-nowrap transition-all"
                >
                  <FileText className="w-4 h-4" />
                  السكريبتات
                </TabsTrigger>
                <TabsTrigger 
                  value="broll"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-2.5 gap-2 whitespace-nowrap transition-all"
                >
                  <Video className="w-4 h-4" />
                  B-Roll
                </TabsTrigger>
                <TabsTrigger 
                  value="prompts"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-2.5 gap-2 whitespace-nowrap transition-all"
                >
                  <Image className="w-4 h-4" />
                  البرومبتات
                </TabsTrigger>
                <TabsTrigger 
                  value="article"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-2.5 gap-2 whitespace-nowrap transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  المقال
                </TabsTrigger>
                <TabsTrigger 
                  value="export"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 py-2.5 gap-2 whitespace-nowrap transition-all"
                >
                  <Package className="w-4 h-4" />
                  التصدير
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="animate-fade-in">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab project={project} />
              </TabsContent>

              <TabsContent value="research" className="mt-0">
                <ResearchTab project={project} />
              </TabsContent>

              <TabsContent value="simplify" className="mt-0">
                <SimplifyTab project={project} />
              </TabsContent>

              <TabsContent value="scripts" className="mt-0">
                <ScriptsTab project={project} onRefresh={() => loadProject(id!)} />
              </TabsContent>

              <TabsContent value="broll" className="mt-0">
                <BRollTab project={project} onRefresh={() => loadProject(id!)} />
              </TabsContent>

              <TabsContent value="prompts" className="mt-0">
                <PromptsTab project={project} />
              </TabsContent>

              <TabsContent value="article" className="mt-0">
                <ArticleTab project={project} onProjectUpdate={(updates) => setProject({ ...project, ...updates })} />
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                <ExportTab project={project} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
