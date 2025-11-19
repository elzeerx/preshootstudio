import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, FolderOpen, ArrowLeft, Plus, Inbox, Search, Filter, CheckCircle2, Clock, Rocket, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Project {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  updated_at: string;
  research_status: string | null;
  scripts_status: string | null;
  broll_status: string | null;
  article_status: string | null;
  prompts_status: string | null;
  simplify_status: string | null;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

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

  // Calculate stats
  const stats = {
    total: projects.length,
    new: projects.filter(p => p.status === "new").length,
    processing: projects.filter(p => p.status === "processing").length,
    ready: projects.filter(p => p.status === "ready").length,
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Count completed features per project
  const getCompletedFeatures = (project: Project) => {
    const features = [
      project.research_status === "ready",
      project.simplify_status === "ready",
      project.scripts_status === "ready",
      project.broll_status === "ready",
      project.prompts_status === "ready",
      project.article_status === "ready",
    ];
    return features.filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
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

            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6 shadow-lg">
              <FolderOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="heading-2 mb-3">مشاريعي</h1>
            <p className="body-text-secondary max-w-2xl mx-auto">
              جميع مشاريعك في مكان واحد - تابع، عدّل، وصدّر محتواك بسهولة
            </p>
          </div>

          {/* Stats Cards */}
          {!isLoading && projects.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-scale-in">
              <Card variant="subtle" className="hover:scale-105 transition-transform">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">إجمالي المشاريع</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="subtle" className="hover:scale-105 transition-transform">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.new}</p>
                      <p className="text-xs text-muted-foreground">مشاريع جديدة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="subtle" className="hover:scale-105 transition-transform">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.processing}</p>
                      <p className="text-xs text-muted-foreground">قيد التجهيز</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="subtle" className="hover:scale-105 transition-transform">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.ready}</p>
                      <p className="text-xs text-muted-foreground">مشاريع جاهزة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filter */}
          {!isLoading && projects.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="ابحث في مشاريعك..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  الكل
                </Button>
                <Button
                  variant={filterStatus === "new" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("new")}
                >
                  جديد
                </Button>
                <Button
                  variant={filterStatus === "processing" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("processing")}
                >
                  قيد التجهيز
                </Button>
                <Button
                  variant={filterStatus === "ready" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("ready")}
                >
                  جاهز
                </Button>
              </div>

              <Link to="/">
                <Button variant="default" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  مشروع جديد
                </Button>
              </Link>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6"></div>
              <p className="body-text-secondary">جاري تحميل مشاريعك...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && projects.length === 0 && (
            <Card variant="subtle" className="max-w-xl mx-auto animate-scale-in">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-8">
                  <Inbox className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">ما عندك أي مشروع لحد الآن</h3>
                <p className="body-text-secondary mb-8 max-w-md mx-auto">
                  ابدأ من الصفحة الرئيسية بإدخال موضوع جديد، وخلي PreShoot AI يجهز لك كل شيء
                </p>
                <Link to="/">
                  <Button variant="default" size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    إنشاء مشروع جديد
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* No Results State */}
          {!isLoading && projects.length > 0 && filteredProjects.length === 0 && (
            <Card variant="subtle" className="max-w-xl mx-auto">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted/50 mb-6">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">لا توجد نتائج</h3>
                <p className="body-text-secondary mb-6">
                  جرب تعديل البحث أو الفلتر
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}>
                  إعادة تعيين
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          {!isLoading && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <Link 
                  key={project.id} 
                  to={`/projects/${project.id}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-fade-in"
                >
                  <Card 
                    variant="editorial" 
                    className="h-full group cursor-pointer overflow-hidden"
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge 
                          variant={getStatusVariant(project.status)}
                          className="shadow-sm"
                        >
                          {getStatusLabel(project.status)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          {getCompletedFeatures(project)}/6
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {project.topic}
                      </CardTitle>
                      
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">
                          {formatDate(project.created_at)}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">التقدم</span>
                            <span className="font-semibold text-primary">
                              {Math.round((getCompletedFeatures(project) / 6) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                              style={{ width: `${(getCompletedFeatures(project) / 6) * 100}%` }}
                            />
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full group-hover:bg-primary/10 transition-colors"
                        >
                          فتح المشروع ←
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
