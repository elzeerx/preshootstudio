import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FolderOpen, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Project {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading projects:", error);
        return;
      }

      setProjects(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
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
      return format(new Date(dateString), "d MMMM yyyy", { locale: ar });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">PreShoot AI</h1>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              الرئيسية
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="heading-1 mb-4">مشاريعي</h1>
            <p className="body-text-secondary">
              جميع مشاريعك في مكان واحد
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="body-text-secondary">جاري التحميل...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && projects.length === 0 && (
            <Card className="max-w-2xl mx-auto p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <FolderOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="heading-2 mb-4">ما عندك ولا مشروع لحد الآن</h2>
              <p className="body-text mb-8">
                ابدأ من الصفحة الرئيسية بإدخال موضوع جديد
              </p>
              <Link to="/">
                <Button size="lg" className="gap-2">
                  <Sparkles className="w-5 h-5" />
                  ابدأ مشروع جديد
                </Button>
              </Link>
            </Card>
          )}

          {/* Projects Grid */}
          {!isLoading && projects.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="p-6 hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary/20"
                >
                  <div className="flex flex-col h-full">
                    {/* Project Topic */}
                    <h3 className="heading-3 text-xl mb-3 line-clamp-2 min-h-[3.5rem]">
                      {project.topic}
                    </h3>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <Badge variant={getStatusVariant(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>

                    {/* Date */}
                    <p className="body-text-secondary text-sm mb-6 flex-grow">
                      تاريخ الإنشاء: {formatDate(project.created_at)}
                    </p>

                    {/* View Button */}
                    <Link to={`/projects/${project.id}`} className="mt-auto">
                      <Button variant="outline" className="w-full">
                        عرض المشروع
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Create New Project CTA */}
          {!isLoading && projects.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/">
                <Button size="lg" className="gap-2">
                  <Sparkles className="w-5 h-5" />
                  إنشاء مشروع جديد
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
