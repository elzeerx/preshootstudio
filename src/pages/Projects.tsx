import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FolderOpen, ArrowLeft, Plus, Inbox } from "lucide-react";
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      // Load only user's projects
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="heading-2 mb-3">مشاريعي</h1>
            <p className="body-text-secondary max-w-2xl mx-auto">
              هنا تقدر تشوف وتدير كل المواضيع اللي جهزتها باستخدام PreShoot AI
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="body-text-secondary">جاري التحميل...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && projects.length === 0 && (
            <Card className="max-w-md mx-auto border-2 shadow-lg">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/50 mb-6">
                  <Inbox className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">ما عندك أي مشروع لحد الآن</h3>
                <p className="body-text-secondary mb-6 max-w-sm mx-auto">
                  ابدأ من الصفحة الرئيسية بإدخال موضوع جديد، وخلي PreShoot AI يجهز لك كل شيء
                </p>
                <Link to="/">
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    إنشاء مشروع جديد
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          {!isLoading && projects.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  {projects.length} {projects.length === 1 ? 'مشروع' : 'مشاريع'}
                </p>
                <Link to="/">
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    مشروع جديد
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`}>
                    <Card className="h-full border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant={getStatusVariant(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 leading-tight">
                          {project.topic}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-3">
                          <span className="text-xs">
                            {formatDate(project.created_at)}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" size="sm" className="w-full">
                          فتح المشروع ←
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
