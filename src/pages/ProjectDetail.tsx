import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
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
import { isContentOutdated, getOutdatedBadgeText, getOutdatedBadgeTextShort } from "@/lib/helpers/contentFreshness";
import { useIsMobile } from "@/hooks/use-mobile";
import { LucideIcon } from "lucide-react";

// Component for responsive tab trigger with badge
interface TabTriggerWithBadgeProps {
  value: string;
  icon: LucideIcon;
  label: string;
  isOutdated?: boolean;
}

const TabTriggerWithBadge = ({ value, icon: Icon, label, isOutdated = false }: TabTriggerWithBadgeProps) => {
  const isMobile = useIsMobile();
  
  return (
    <TabsTrigger 
      value={value}
      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded gap-2 whitespace-nowrap relative"
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="hidden xs:inline">{label}</span>
      {isOutdated && (
        <>
          {/* Mobile: Small dot indicator */}
          <span className="inline-flex xs:hidden absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          
          {/* Tablet: Short badge */}
          <Badge variant="destructive" className="hidden xs:inline-flex sm:hidden text-xs px-1.5 py-0">
            {getOutdatedBadgeTextShort()}
          </Badge>
          
          {/* Desktop: Full badge */}
          <Badge variant="destructive" className="hidden sm:inline-flex text-xs px-1.5 py-0">
            {getOutdatedBadgeText()}
          </Badge>
        </>
      )}
    </TabsTrigger>
  );
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { project, isLoading, isRefetching, notFound, refetch } = useProjectDetail(id);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy - h:mm a", { locale: ar });
    } catch {
      return dateString;
    }
  };

  // Handle scroll to update gradient visibility
  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (!tabsList) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = tabsList;
      // For RTL, scrollLeft is negative or inverted depending on browser
      const scrollRight = Math.abs(scrollLeft);
      const maxScroll = scrollWidth - clientWidth;
      
      setShowRightGradient(scrollRight > 10);
      setShowLeftGradient(scrollRight < maxScroll - 10);
    };

    // Initial check
    handleScroll();

    tabsList.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      tabsList.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [project]);

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
            <div className="relative">
              {/* Right gradient indicator (for RTL, this appears on the right when content is scrollable to the right) */}
              <div 
                className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background/95 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                  showRightGradient ? 'opacity-100' : 'opacity-0'
                }`}
              />
              
              {/* Left gradient indicator (for RTL, this appears on the left when content is scrollable to the left) */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background/95 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
                  showLeftGradient ? 'opacity-100' : 'opacity-0'
                }`}
              />
              
              <TabsList ref={tabsListRef} className="w-full overflow-x-auto bg-muted p-1 rounded-md flex-nowrap justify-start md:justify-center">
                <TabTriggerWithBadge value="overview" icon={Film} label="نظرة عامة" />
                <TabTriggerWithBadge value="research" icon={Search} label="البحث" />
                <TabTriggerWithBadge 
                  value="simplify" 
                  icon={Lightbulb} 
                  label="التبسيط" 
                  isOutdated={isContentOutdated(project.simplify_last_run_at, project.research_last_run_at)}
                />
                <TabTriggerWithBadge 
                  value="scripts" 
                  icon={FileText} 
                  label="السكريبتات" 
                  isOutdated={isContentOutdated(project.scripts_last_run_at, project.research_last_run_at)}
                />
                <TabTriggerWithBadge 
                  value="broll" 
                  icon={Video} 
                  label="B-Roll" 
                  isOutdated={isContentOutdated(project.broll_last_run_at, project.research_last_run_at)}
                />
                <TabTriggerWithBadge 
                  value="prompts" 
                  icon={Image} 
                  label="البرومبتات" 
                  isOutdated={isContentOutdated(project.prompts_last_run_at, project.research_last_run_at)}
                />
                <TabTriggerWithBadge 
                  value="article" 
                  icon={BookOpen} 
                  label="المقال" 
                  isOutdated={isContentOutdated(project.article_last_run_at, project.research_last_run_at)}
                />
                <TabTriggerWithBadge value="export" icon={Package} label="التصدير" />
              </TabsList>
            </div>
          </div>

          <div className="relative">
            {/* Refetching overlay */}
            {isRefetching && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg animate-fade-in">
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/50 border border-border shadow-lg">
                  <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-sm text-muted-foreground font-medium">جاري تحديث البيانات...</p>
                </div>
              </div>
            )}
            
            <TabsContent value="overview" className="mt-0">
              <OverviewTab project={project} onProjectUpdate={refetch} />
            </TabsContent>

            <TabsContent value="research" className="mt-0">
              <ResearchTab project={project} onProjectUpdate={refetch} />
            </TabsContent>

            <TabsContent value="simplify" className="mt-0">
              <SimplifyTab project={project} onProjectUpdate={refetch} />
            </TabsContent>

            <TabsContent value="scripts" className="mt-0">
              <ScriptsTab project={project} onProjectUpdate={refetch} />
            </TabsContent>

            <TabsContent value="broll" className="mt-0">
              <BRollTab project={project} onProjectUpdate={refetch} />
            </TabsContent>

            <TabsContent value="prompts" className="mt-0">
              <PromptsTab project={project} onProjectUpdate={refetch} />
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
