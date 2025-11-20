import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Video, 
  Image, 
  Lightbulb,
  FileEdit,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";
import { ProjectDetail, QualityMetrics } from "@/hooks/useProjectDetail";
import { formatDate } from "@/lib/helpers/formatters";
import { getQualityLabel, getQualityVariant } from "@/lib/helpers/researchQuality";

interface OverviewTabProps {
  project: ProjectDetail;
}

const getStatusInfo = (status: string | null) => {
  if (!status || status === "idle") return { label: "لم يبدأ", variant: "secondary" as const, icon: Clock };
  if (status === "loading") return { label: "جاري التنفيذ", variant: "default" as const, icon: Clock };
  if (status === "ready") return { label: "مكتمل", variant: "outline" as const, icon: CheckCircle2 };
  if (status === "error") return { label: "خطأ", variant: "destructive" as const, icon: Clock };
  return { label: status, variant: "secondary" as const, icon: Clock };
};

const calculateProgress = (project: ProjectDetail): number => {
  const tasks = [
    project.research_status,
    project.simplify_status,
    project.scripts_status,
    project.broll_status,
    project.prompts_status,
    project.article_status,
  ];
  const completed = tasks.filter(status => status === "ready").length;
  return Math.round((completed / tasks.length) * 100);
};

export const OverviewTab = ({ project }: OverviewTabProps) => {
  const hasResearch = project.research_data && project.research_data.summary;
  const progressPercentage = calculateProgress(project);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-right">نظرة عامة على المشروع</CardTitle>
              <p className="text-sm text-muted-foreground text-right mt-1">{project.topic}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            التقدم الإجمالي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{progressPercentage}%</span>
              <span className="text-muted-foreground">مكتمل</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Research Summary with Quality Score */}
      {hasResearch ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  ملخص البحث
                </div>
                {project.research_quality_score && (
                  <Badge variant={getQualityVariant(project.research_quality_score)}>
                    <Award className="w-3 h-3 ml-1" />
                    {getQualityLabel(project.research_quality_score)} ({project.research_quality_score})
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-right leading-relaxed">{project.research_data?.summary}</p>
              
              {project.research_data?.keyPoints && project.research_data.keyPoints.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 text-right">النقاط الرئيسية</h4>
                    <ul className="space-y-2 text-right">
                      {project.research_data.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span className="flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  {project.research_data?.sources && project.research_data.sources.length > 0 && (
                    <span>{project.research_data.sources.length} مصدر</span>
                  )}
                </div>
                {project.research_last_run_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>آخر تحديث: {formatDate(project.research_last_run_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold">ابدأ بالبحث</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                قم بتشغيل البحث من تبويب "البحث" لإنشاء ملخص شامل وبيانات أساسية يمكن استخدامها في جميع المراحل الأخرى
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Progress Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            حالة المهام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "البحث", status: project.research_status, icon: Sparkles },
              { label: "التبسيط", status: project.simplify_status, icon: FileEdit },
              { label: "السكريبتات", status: project.scripts_status, icon: FileText },
              { label: "البرومبتات", status: project.prompts_status, icon: Lightbulb },
              { label: "B-Roll", status: project.broll_status, icon: Image },
              { label: "المقال", status: project.article_status, icon: Video },
            ].map((task, idx) => {
              const statusInfo = getStatusInfo(task.status);
              const TaskIcon = task.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <TaskIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{task.label}</span>
                  </div>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Statistics */}
      {(project.scripts_data || project.article_data || project.prompts_data || project.broll_data) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <FileText className="w-5 h-5" />
              إحصائيات المحتوى
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.scripts_data && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Video className="w-4 h-4" />
                    السكريبتات
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 mr-6">
                    {project.scripts_data.teleprompter && <div>• Teleprompter</div>}
                    {project.scripts_data.reel && <div>• Reel</div>}
                    {project.scripts_data.longVideo && <div>• Long Video</div>}
                  </div>
                </div>
              )}

              {project.article_data && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <FileEdit className="w-4 h-4" />
                    المقال
                  </div>
                  <div className="text-sm text-muted-foreground mr-6">
                    {project.article_data.title && <div>• {project.article_data.title}</div>}
                    {project.article_data.sections && (
                      <div>• {project.article_data.sections.length} أقسام</div>
                    )}
                  </div>
                </div>
              )}

              {project.prompts_data && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Lightbulb className="w-4 h-4" />
                    البرومبتات
                  </div>
                  <div className="text-sm text-muted-foreground mr-6">
                    {(project.prompts_data.imagePrompts.length + 
                      project.prompts_data.videoPrompts.length + 
                      project.prompts_data.thumbnailPrompts.length) > 0 && (
                      <div>• {project.prompts_data.imagePrompts.length + 
                             project.prompts_data.videoPrompts.length + 
                             project.prompts_data.thumbnailPrompts.length} برومبت</div>
                    )}
                  </div>
                </div>
              )}

              {project.broll_data && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Image className="w-4 h-4" />
                    B-Roll
                  </div>
                  <div className="text-sm text-muted-foreground mr-6">
                    {project.broll_data.shots && (
                      <div>• {project.broll_data.shots.length} لقطة</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <Clock className="w-5 h-5" />
            النشاط الأخير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "البحث", timestamp: project.research_last_run_at },
              { label: "التبسيط", timestamp: project.simplify_last_run_at },
              { label: "السكريبتات", timestamp: project.scripts_last_run_at },
              { label: "البرومبتات", timestamp: project.prompts_last_run_at },
              { label: "B-Roll", timestamp: project.broll_last_run_at },
              { label: "المقال", timestamp: project.article_last_run_at },
            ]
              .filter(activity => activity.timestamp)
              .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
              .slice(0, 5)
              .map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{activity.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.timestamp!)}
                  </span>
                </div>
              ))}
            {![
              project.research_last_run_at,
              project.simplify_last_run_at,
              project.scripts_last_run_at,
              project.prompts_last_run_at,
              project.broll_last_run_at,
              project.article_last_run_at,
            ].some(Boolean) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد أنشطة بعد
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
