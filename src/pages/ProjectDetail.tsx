import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft, AlertCircle, Calendar, FileText, Film } from "lucide-react";
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
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      // Get current user
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
      return format(new Date(dateString), "d MMMM yyyy", { locale: ar });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="body-text-secondary">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">PreShoot AI</h1>
              <p className="text-xs text-muted-foreground">مساعدك الشخصي قبل التصوير وبعده</p>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto border-2 border-destructive/20">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">المشروع غير موجود</h2>
              <p className="body-text-secondary mb-6">
                ما قدرنا نلقى المشروع اللي تدور عنه، أو ما عندك صلاحية للوصول له
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/projects">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    مشاريعي
                  </Button>
                </Link>
                <Link to="/">
                  <Button>
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
          <Link to="/projects">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              مشاريعي
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Project Header */}
          <Card className="mb-8 border-2 shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Film className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant={getStatusVariant(project.status)} className="text-sm">
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl mb-2">
                    {project.topic}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    تم الإنشاء في {formatDate(project.created_at)}
                  </CardDescription>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  هذا هو الاستوديو الخاص بموضوعك. من التبويبات تحت تقدر تدير كل المخرجات
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Workspace Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start mb-6 sticky top-[88px] bg-background/95 backdrop-blur-sm z-40 border-b">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="research">البحث</TabsTrigger>
              <TabsTrigger value="simplify">تبسيط</TabsTrigger>
              <TabsTrigger value="scripts">السكريبتات</TabsTrigger>
              <TabsTrigger value="broll">B-Roll</TabsTrigger>
              <TabsTrigger value="prompts">البرومبتات</TabsTrigger>
              <TabsTrigger value="article">المقال</TabsTrigger>
              <TabsTrigger value="export">التصدير</TabsTrigger>
            </TabsList>

            <div className="mt-6">
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
                <ScriptsTab project={project} onRefresh={() => id && loadProject(id)} />
              </TabsContent>

              <TabsContent value="broll" className="mt-0">
                <BRollTab project={project} />
              </TabsContent>

              <TabsContent value="prompts" className="mt-0">
                <PromptsTab project={project} />
              </TabsContent>

              <TabsContent value="article" className="mt-0">
                <ArticleTab project={project} />
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
