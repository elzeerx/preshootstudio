import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, AlertCircle, Calendar, FileText, Search, Lightbulb, Video, Image, BookOpen, Package, Film } from "lucide-react";
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
import { AppHeader } from "@/components/common/AppHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AppFooter } from "@/components/common/AppFooter";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { getStatusLabel, getStatusVariant } from "@/lib/helpers/formatters";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { project, isLoading, notFound, refetch } = useProjectDetail(id);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy - h:mm a", { locale: ar });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="body-text-secondary">جاري تحميل المشروع...</p>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (notFound || (!isLoading && !project)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1">
          <Breadcrumbs items={[
            { label: "الرئيسية", href: "/" },
            { label: "مشاريعي", href: "/projects" },
            { label: "المشروع غير موجود" },
          ]} />
          <Card variant="subtle" className="max-w-xl mx-auto">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <AlertCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="heading-3 mb-3">المشروع غير موجود</h3>
              <p className="body-text-secondary mb-8 max-w-md mx-auto">
                للأسف، المشروع اللي تحاول تفتحه ما لقيناه أو ما عندك صلاحية تشوفه.
              </p>
              <Link to="/projects">
                <Button variant="default">
                  <ArrowLeft className="ml-2 h-5 w-5" />
                  مشاريعي
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Breadcrumbs items={[
          { label: "الرئيسية", href: "/" },
          { label: "مشاريعي", href: "/projects" },
          { label: project.topic },
        ]} />
        {/* Project Header Card */}
        <Card variant="editorial" className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 space-y-4 text-right">
                <div className="flex items-center gap-3 flex-row-reverse justify-end">
                  <Badge variant={getStatusVariant(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                  <div className="w-12 h-12 rounded-lg bg-button-primary/10 flex items-center justify-center">
                    <Film className="w-6 h-6 text-button-primary" strokeWidth={2} />
                  </div>
                </div>
                <CardTitle className="heading-2 break-words-rtl">
                  {project.topic}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-row-reverse">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <span>{formatDate(project.created_at)}</span>
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="sticky top-20 z-40 bg-background/95 backdrop-blur -mx-4 px-4 py-4 border-y border-border">
            <TabsList className="w-full overflow-x-auto bg-muted p-1 rounded-md flex-nowrap justify-start md:justify-center">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded px-4 py-2 gap-2 whitespace-nowrap"
              >
                <Film className="w-4 h-4" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger 
                value="research"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded px-4 py-2 gap-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                البحث
              </TabsTrigger>
              <TabsTrigger 
                value="simplify"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded px-4 py-2 gap-2 whitespace-nowrap"
              >
                <Lightbulb className="w-4 h-4" />
                التبسيط
              </TabsTrigger>
              <TabsTrigger 
                value="scripts"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded px-4 py-2 gap-2 whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                السكريبتات
              </TabsTrigger>
              <TabsTrigger 
                value="broll"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded px-4 py-2 gap-2 whitespace-nowrap"
              >
                <Video className="w-4 h-4" />
                B-Roll
              </TabsTrigger>
              <TabsTrigger 
                value="prompts"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded px-4 py-2 gap-2 whitespace-nowrap"
              >
                <Image className="w-4 h-4" />
                البرومبتات
              </TabsTrigger>
              <TabsTrigger 
                value="article"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded px-4 py-2 gap-2 whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                المقال
              </TabsTrigger>
              <TabsTrigger 
                value="export"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded px-4 py-2 gap-2 whitespace-nowrap"
              >
                <Package className="w-4 h-4" />
                التصدير
              </TabsTrigger>
            </TabsList>
          </div>

          <div>
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
              <ScriptsTab project={project} onRefresh={() => refetch?.()} />
            </TabsContent>

            <TabsContent value="broll" className="mt-0">
              <BRollTab project={project} onRefresh={() => refetch?.()} />
            </TabsContent>

            <TabsContent value="prompts" className="mt-0">
              <PromptsTab project={project} onRefresh={() => refetch?.()} />
            </TabsContent>

            <TabsContent value="article" className="mt-0">
              <ArticleTab project={project} onProjectUpdate={() => refetch?.()} />
            </TabsContent>

            <TabsContent value="export" className="mt-0">
              <ExportTab project={project} />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <AppFooter />
    </div>
  );
};

export default ProjectDetail;
