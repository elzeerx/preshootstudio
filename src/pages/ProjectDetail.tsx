import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Project {
  id: string;
  topic: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
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
      processing: "قيد المعالجة",
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

  // Loading State
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

  // Not Found State
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
            <h2 className="heading-2 mb-4">لم يتم العثور على هذا المشروع</h2>
            <p className="body-text mb-8">
              المشروع الذي تبحث عنه غير موجود أو تم حذفه
            </p>
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

  // Project Detail View
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
            <Link to="/projects">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                جميع المشاريع
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="heading-1 mb-4">{project.topic}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant={getStatusVariant(project.status)} className="text-base px-4 py-2">
                    الحالة الحالية: {getStatusLabel(project.status)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <p className="body-text-secondary">
              تاريخ الإنشاء: {formatDate(project.created_at)}
            </p>
          </div>

          {/* Project Info Card */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="heading-3 mb-3">حول هذا المشروع</h3>
                <p className="body-text leading-relaxed">
                  هذه صفحة المشروع، وفي النسخ القادمة راح نضيف هنا البحث، السكريبتات، 
                  اقتراحات B-Roll، برومبتات الصور والفيديو، وميزات PreShoot AI الكاملة.
                </p>
              </div>
            </div>
          </Card>

          {/* Coming Soon Features */}
          <Card className="p-8">
            <h3 className="heading-3 mb-6 text-center">المميزات القادمة لهذا المشروع</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "البحث وجمع المعلومات", desc: "بحث شامل حول الموضوع" },
                { title: "توليد السكريبت", desc: "سكريبت احترافي جاهز للتصوير" },
                { title: "اقتراحات B-Roll", desc: "لقطات مقترحة للفيديو" },
                { title: "برومبتات الصور", desc: "برومبتات لتوليد الصور" },
                { title: "برومبتات الفيديو", desc: "برومبتات لتوليد الفيديو" },
                { title: "مقال جاهز", desc: "مقال محسّن لمحركات البحث" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30"
                >
                  <h4 className="font-semibold mb-1 text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes Section (if needed in future) */}
          {project.notes && (
            <Card className="p-6 mt-8">
              <h3 className="heading-3 mb-3">ملاحظات</h3>
              <p className="body-text">{project.notes}</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
