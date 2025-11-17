import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft, AlertCircle } from "lucide-react";
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
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="body-text-secondary">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <header className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">PreShoot AI</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="heading-2 mb-4">غير مصرح لك بعرض هذا المشروع</h2>
            <p className="body-text mb-8">المشروع الذي تبحث عنه غير موجود أو لا تملك صلاحية الوصول إليه</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/projects")} variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                جميع المشاريع
              </Button>
              <Button onClick={() => navigate("/")} className="gap-2">
                <Sparkles className="w-5 h-5" />
                الصفحة الرئيسية
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="container mx-auto px-4 py-6 border-b border-border bg-background/50 backdrop-blur">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">PreShoot AI</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/projects">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                مشاريعي
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="heading-2 mb-2">{project.topic}</h1>
                <p className="body-text-secondary text-sm">تاريخ الإنشاء: {formatDate(project.created_at)}</p>
              </div>
              <div>
                <Badge variant={getStatusVariant(project.status)} className="text-base px-4 py-2">
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </div>
          </Card>
          <Tabs defaultValue="overview" className="w-full" dir="rtl">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto bg-card border border-border mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">نظرة عامة</TabsTrigger>
              <TabsTrigger value="research" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">البحث</TabsTrigger>
              <TabsTrigger value="simplify" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">التبسيط</TabsTrigger>
              <TabsTrigger value="scripts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">السكريبتات</TabsTrigger>
              <TabsTrigger value="broll" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">B-Roll</TabsTrigger>
              <TabsTrigger value="prompts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">البرومبتات</TabsTrigger>
              <TabsTrigger value="article" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">المقال</TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">التصدير</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><OverviewTab project={project} /></TabsContent>
            <TabsContent value="research"><ResearchTab project={project} /></TabsContent>
            <TabsContent value="simplify"><SimplifyTab project={project} /></TabsContent>
            <TabsContent value="scripts"><ScriptsTab project={project} onRefresh={() => loadProject(id!)} /></TabsContent>
            <TabsContent value="broll"><BRollTab project={project} /></TabsContent>
            <TabsContent value="prompts"><PromptsTab project={project} /></TabsContent>
            <TabsContent value="article"><ArticleTab project={project} /></TabsContent>
            <TabsContent value="export"><ExportTab project={project} /></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
