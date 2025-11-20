import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, AlertCircle, RefreshCw, ExternalLink, Lightbulb, TrendingUp, HelpCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ResearchData } from "@/lib/types/research";
import { extractDomain } from "@/lib/utils";
import { ProjectDetail, QualityMetrics } from "@/hooks/useProjectDetail";
import { QualityScoreCard } from "@/components/workspace/research/QualityScoreCard";
import { ResearchHistoryDialog } from "@/components/workspace/research/ResearchHistoryDialog";

interface ResearchTabProps {
  project: ProjectDetail;
}

export const ResearchTab = ({ project: initialProject }: ResearchTabProps) => {
  const [project, setProject] = useState(initialProject);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('تم نسخ الرابط');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error('فشل نسخ الرابط');
    }
  };

  const copyAllResearch = async () => {
    if (!researchData) return;
    
    let content = `# البحث الشامل: ${project.topic}\n\n`;
    content += `## ملخص البحث\n${researchData.summary}\n\n`;
    
    if (researchData.keyPoints && researchData.keyPoints.length > 0) {
      content += `## النقاط الأساسية\n`;
      researchData.keyPoints.forEach((point, index) => {
        content += `${index + 1}. ${point}\n`;
      });
      content += '\n';
    }
    
    if (researchData.facts && researchData.facts.length > 0) {
      content += `## حقائق وإحصائيات\n`;
      researchData.facts.forEach((fact) => {
        content += `**${fact.label}:** ${fact.value}\n`;
        if (fact.source) content += `المصدر: ${fact.source}\n`;
        content += '\n';
      });
    }
    
    if (researchData.sources && researchData.sources.length > 0) {
      content += `## المصادر والمراجع\n`;
      researchData.sources.forEach((source) => {
        content += `- **${source.title}**\n`;
        if (source.url) content += `  الرابط: ${source.url}\n`;
        if (source.type) content += `  النوع: ${source.type}\n`;
        content += '\n';
      });
    }
    
    if (researchData.mythsVsReality && researchData.mythsVsReality.length > 0) {
      content += `## خرافات vs. حقيقة\n`;
      researchData.mythsVsReality.forEach((item) => {
        content += `**خرافة:** ${item.myth}\n`;
        content += `**الحقيقة:** ${item.reality}\n\n`;
      });
    }
    
    if (researchData.trends && researchData.trends.length > 0) {
      content += `## الاتجاهات الحديثة\n`;
      researchData.trends.forEach((trend) => {
        content += `• ${trend}\n`;
      });
      content += '\n';
    }
    
    if (researchData.faqs && researchData.faqs.length > 0) {
      content += `## الأسئلة الشائعة\n`;
      researchData.faqs.forEach((faq) => {
        content += `**س: ${faq.question}**\n`;
        content += `ج: ${faq.answer}\n\n`;
      });
    }
    
    try {
      await navigator.clipboard.writeText(content);
      toast.success('تم نسخ البحث الكامل بنجاح!');
    } catch (error) {
      toast.error('فشل النسخ');
    }
  };

  const runResearch = async () => {
    setIsLoading(true);
    
    try {
      setProject(prev => ({ ...prev, research_status: 'loading' }));

      const { data, error } = await supabase.functions.invoke('run-research', {
        body: { projectId: project.id }
      });

      if (error) {
        console.error('Error running research:', error);
        toast.error('حدث خطأ أثناء تجهيز البحث');
        setProject(prev => ({ ...prev, research_status: 'error' }));
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setProject(prev => ({ ...prev, research_status: 'error' }));
        return;
      }

      const { data: updatedProject, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .single();

      if (!fetchError && updatedProject) {
        setProject({
          ...updatedProject,
          research_data: updatedProject.research_data as unknown as ResearchData | undefined,
          research_quality_metrics: updatedProject.research_quality_metrics as unknown as QualityMetrics | null | undefined,
          research_manual_edits: updatedProject.research_manual_edits as unknown as Record<string, boolean> | null | undefined,
          scripts_data: updatedProject.scripts_data as any,
          broll_data: updatedProject.broll_data as any,
          prompts_data: updatedProject.prompts_data as any,
          article_data: updatedProject.article_data as any,
          simplify_data: updatedProject.simplify_data as any,
        });
        toast.success('تم تجهيز البحث بنجاح!');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('حدث خطأ غير متوقع');
      setProject(prev => ({ ...prev, research_status: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const refetchProject = async () => {
    const { data: updatedProject } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project.id)
      .single();

    if (updatedProject) {
      setProject({
        ...updatedProject,
        research_data: updatedProject.research_data as unknown as ResearchData | undefined,
        research_quality_metrics: updatedProject.research_quality_metrics as unknown as QualityMetrics | null | undefined,
        research_manual_edits: updatedProject.research_manual_edits as unknown as Record<string, boolean> | null | undefined,
        scripts_data: updatedProject.scripts_data as any,
        broll_data: updatedProject.broll_data as any,
        prompts_data: updatedProject.prompts_data as any,
        article_data: updatedProject.article_data as any,
        simplify_data: updatedProject.simplify_data as any,
      });
    }
  };

  const researchStatus = project.research_status || 'idle';
  const researchData = project.research_data as ResearchData | undefined;

  if (researchStatus === 'idle' || !researchData) {
    return (
      <Card className="card-fluid container-responsive p-6 sm:p-8 lg:p-12 text-center" dir="rtl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Search className="w-10 h-10 text-primary" />
        </div>
        <h3 className="heading-3 mb-4 break-words-rtl">ما تم تجهيز بحث لهذا الموضوع بعد</h3>
        <p className="body-text mb-8 max-w-2xl mx-auto break-words-rtl">
          استخدم Tavily Web Search + الذكاء الاصطناعي لجمع وتنظيم أهم المعلومات حول:{" "}
          <span className="font-semibold text-primary break-words-rtl">{project.topic}</span>
        </p>
        <Button 
          size="lg" 
          onClick={runResearch}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              جاري التجهيز...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              تجهيز البحث بالذكاء الاصطناعي
            </>
          )}
        </Button>
      </Card>
    );
  }

  if (researchStatus === 'loading' || isLoading) {
    return (
      <Card className="card-fluid container-responsive p-6 sm:p-8 lg:p-12" dir="rtl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Search className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h3 className="heading-3 mb-4 break-words-rtl">جاري تجهيز البحث...</h3>
          <p className="body-text mb-4 break-words-rtl">
            نستخدم Tavily Web Search لجلب أحدث المعلومات من الإنترنت
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-muted/50 rounded-xl animate-pulse"></div>
          <div className="h-40 bg-muted/50 rounded-xl animate-pulse"></div>
        </div>
      </Card>
    );
  }

  if (researchStatus === 'error') {
    return (
      <Card className="p-12 text-center border-2 border-destructive/20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="heading-3 mb-2">حدث خطأ أثناء تجهيز البحث</h3>
        <p className="body-text mb-6">
          ما قدرنا نجهز البحث. جرّب مرة ثانية أو تواصل مع الدعم إذا استمرت المشكلة.
        </p>
        <Button onClick={runResearch} disabled={isLoading} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h2 className="heading-3">نتائج البحث الشامل</h2>
        <div className="flex gap-2 flex-wrap">
          <ResearchHistoryDialog 
            projectId={project.id}
            onRestore={refetchProject}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllResearch}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            نسخ البحث كامل
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runResearch}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة التوليد
          </Button>
        </div>
      </div>

      {/* Quality Score Card */}
      <QualityScoreCard 
        score={project.research_quality_score}
        metrics={project.research_quality_metrics}
      />

      {/* Research Summary */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4 text-right">
          <h3 className="heading-3">ملخص البحث</h3>
        </div>
        <p className="body-text leading-relaxed">{researchData.summary}</p>
      </Card>

      {/* Key Points */}
      {researchData.keyPoints && researchData.keyPoints.length > 0 && (
        <Card className="p-6">
          <h3 className="heading-3 mb-4">النقاط الأساسية</h3>
          <ul className="space-y-3">
            {researchData.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-sm font-medium">
                  {index + 1}
                </span>
                <span className="body-text flex-1">{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Facts Section */}
      {researchData.facts && researchData.facts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="heading-3">حقائق وإحصائيات</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {researchData.facts.map((fact, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg bg-muted/50 border border-border"
                dir="rtl"
              >
                <p className="font-semibold text-primary mb-2">{fact.label}</p>
                <p className="body-text mb-3">{fact.value}</p>
                {fact.source && fact.url && (
                  <a
                    href={fact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    dir="ltr"
                  >
                    <span className="line-clamp-1">{fact.source}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
                {fact.source && !fact.url && (
                  <p className="text-xs text-muted-foreground" dir="rtl">
                    المصدر: {fact.source}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sources Section */}
      {researchData.sources && researchData.sources.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <ExternalLink className="w-5 h-5 text-primary" />
            <h3 className="heading-3">المصادر والمراجع</h3>
          </div>
          <div className="grid gap-4">
            {researchData.sources.map((source, index) => {
              const domain = source.url ? extractDomain(source.url) : '';
              const isCopied = copiedUrl === source.url;
              
              return (
                <div
                  key={index}
                  className="group relative rounded-[1.5rem] border border-white/10 bg-white/5 p-5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                >
                  {/* Badge - Top Right */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words-rtl mb-2">
                        {source.title}
                      </h4>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="shrink-0 text-xs px-2.5 py-1"
                    >
                      {source.type === "official" ? "رسمي" : 
                       source.type === "article" ? "مقال" : 
                       source.type === "blog" ? "مدونة" :
                       source.type === "video" ? "فيديو" :
                       source.type === "news" ? "خبر" : "عام"}
                    </Badge>
                  </div>

                  {/* URL Section */}
                  {source.url && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono break-all break-words-rtl">
                            {domain}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(source.url!);
                          }}
                          title="نسخ الرابط"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          title="فتح الرابط"
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-6 text-center">
            جميع المصادر أعلاه حقيقية ومستمدة من Tavily Web Search
          </p>
        </Card>
      )}

      {/* Myths vs Reality */}
      {researchData.mythsVsReality && researchData.mythsVsReality.length > 0 && (
        <Card className="p-6">
          <h3 className="heading-3 mb-4">خرافات شائعة مقابل الحقيقة</h3>
          <div className="space-y-4">
            {researchData.mythsVsReality.map((item, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg bg-muted/30 border-r-4 border-destructive"
                dir="rtl"
              >
                <p className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  خرافة: {item.myth}
                </p>
                <p className="body-text text-foreground">
                  ✅ الحقيقة: {item.reality}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trends */}
      {researchData.trends && researchData.trends.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="heading-3">التوجهات الحالية</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {researchData.trends.map((trend, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2">
                {trend}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* FAQs */}
      {researchData.faqs && researchData.faqs.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="heading-3">أسئلة شائعة</h3>
          </div>
          <div className="space-y-4">
            {researchData.faqs.map((faq, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg bg-muted/30"
                dir="rtl"
              >
                <p className="font-semibold text-foreground mb-2">
                  س: {faq.question}
                </p>
                <p className="body-text">
                  ج: {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
