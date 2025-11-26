import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, AlertCircle, RefreshCw, ExternalLink, Lightbulb, TrendingUp, HelpCircle, Copy, Check, Compass, Zap, Film, Heart, Youtube, MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ResearchData } from "@/lib/types/research";
import type { CreativeResearchData } from "@/lib/types/creativeResearch";
import { extractDomain } from "@/lib/utils";
import { ProjectDetail, QualityMetrics } from "@/hooks/useProjectDetail";
import { QualityScoreCard } from "@/components/workspace/research/QualityScoreCard";
import { ResearchHistoryDialog } from "@/components/workspace/research/ResearchHistoryDialog";
import { EditableResearchField } from "@/components/workspace/research/EditableResearchField";

interface ResearchTabProps {
  project: ProjectDetail;
  onProjectUpdate?: () => void;
}

export const ResearchTab = ({ project, onProjectUpdate }: ResearchTabProps) => {
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
    if (!researchData && !creativeData) return;
    
    let content = `# ${isCreativeContent ? 'البحث الإبداعي' : 'البحث الشامل'}: ${project.topic}\n\n`;
    
    if (isCreativeContent && creativeData) {
      // Creative content format
      content += `## ما يميز هذا المحتوى\n${creativeData.uniqueValueProp}\n\n`;
      
      if (creativeData.contentAngles && creativeData.contentAngles.length > 0) {
        content += `## زوايا المحتوى\n`;
        creativeData.contentAngles.forEach((angle, index) => {
          content += `${index + 1}. ${angle}\n`;
        });
        content += '\n';
      }
      
      if (creativeData.hooks && creativeData.hooks.length > 0) {
        content += `## افتتاحيات جذابة\n`;
        creativeData.hooks.forEach((hook) => {
          content += `• ${hook}\n`;
        });
        content += '\n';
      }
      
      if (creativeData.storyBeats && creativeData.storyBeats.length > 0) {
        content += `## هيكل القصة\n`;
        creativeData.storyBeats.forEach((beat, index) => {
          content += `${index + 1}. ${beat}\n`;
        });
        content += '\n';
      }
      
      if (creativeData.emotionalTriggers && creativeData.emotionalTriggers.length > 0) {
        content += `## المحفزات العاطفية\n`;
        creativeData.emotionalTriggers.forEach((trigger) => {
          content += `• ${trigger}\n`;
        });
        content += '\n';
      }
      
      if (creativeData.trendingFormats && creativeData.trendingFormats.length > 0) {
        content += `## صيغ الفيديو الرائجة\n`;
        creativeData.trendingFormats.forEach((format) => {
          content += `• ${format}\n`;
        });
        content += '\n';
      }
      
      if (creativeData.audienceQuestions && creativeData.audienceQuestions.length > 0) {
        content += `## أسئلة الجمهور\n`;
        creativeData.audienceQuestions.forEach((question) => {
          content += `❓ ${question}\n`;
        });
        content += '\n';
      }
      
      if (creativeData.inspirationReferences && creativeData.inspirationReferences.length > 0) {
        content += `## مراجع ملهمة\n`;
        creativeData.inspirationReferences.forEach((reference) => {
          content += `💡 ${reference}\n`;
        });
        content += '\n';
      }
    } else if (researchData) {
      // Factual content format (existing)
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
      const { data, error } = await supabase.functions.invoke('run-research', {
        body: { projectId: project.id }
      });

      if (error) {
        console.error('Error running research:', error);
        toast.error('حدث خطأ أثناء تجهيز البحث');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success('تم تجهيز البحث بنجاح!');
      onProjectUpdate?.();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldSave = (field: string, value: string) => {
    // Notify parent to refetch after field save
    onProjectUpdate?.();
  };

  const researchStatus = project.research_status || 'idle';
  const researchData = project.research_data as ResearchData | undefined;
  const creativeData = project.creative_data as CreativeResearchData | undefined;
  const contentType = project.content_type || 'factual';
  const isCreativeContent = contentType === 'creative' || contentType === 'personal' || contentType === 'opinion';

  if (researchStatus === 'idle' || (!researchData && !creativeData)) {
    return (
      <Card className="card-fluid container-responsive p-6 sm:p-8 lg:p-12 text-center" dir="rtl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Search className="w-10 h-10 text-primary" />
        </div>
        <h3 className="heading-3 mb-4 break-words-rtl">ما تم تجهيز بحث لهذا الموضوع بعد</h3>
        <p className="body-text mb-8 max-w-2xl mx-auto break-words-rtl">
          {isCreativeContent 
            ? `استخدم الذكاء الاصطناعي لتوليد أفكار إبداعية وزوايا محتوى مبتكرة حول: `
            : `استخدم Tavily Web Search + الذكاء الاصطناعي لجمع وتنظيم أهم المعلومات حول: `
          }
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
              {isCreativeContent ? 'توليد الأفكار الإبداعية' : 'تجهيز البحث بالذكاء الاصطناعي'}
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
        <h2 className="heading-3">
          {isCreativeContent ? 'نتائج البحث الإبداعي' : 'نتائج البحث الشامل'}
        </h2>
        <div className="flex gap-2 flex-wrap">
          <ResearchHistoryDialog 
            projectId={project.id}
            onRestore={onProjectUpdate}
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

      {/* Render Creative Content */}
      {isCreativeContent && creativeData && (
        <>
          {/* Unique Value Proposition */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <Star className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="heading-3 mb-2">ما يميز هذا المحتوى</h3>
                <p className="body-text text-lg">{creativeData.uniqueValueProp}</p>
              </div>
            </div>
          </Card>

          {/* Content Angles */}
          {creativeData.contentAngles && creativeData.contentAngles.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-primary" />
                <h3 className="heading-3">زوايا المحتوى</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {creativeData.contentAngles.map((angle, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="body-text flex-1">{angle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Hooks */}
          {creativeData.hooks && creativeData.hooks.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="heading-3">افتتاحيات جذابة</h3>
              </div>
              <div className="space-y-3">
                {creativeData.hooks.map((hook, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-primary/5 border-r-4 border-primary"
                  >
                    <p className="body-text font-medium">{hook}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Story Beats */}
          {creativeData.storyBeats && creativeData.storyBeats.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Film className="w-5 h-5 text-primary" />
                <h3 className="heading-3">هيكل القصة</h3>
              </div>
              <div className="space-y-3">
                {creativeData.storyBeats.map((beat, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-muted/30">
                      <p className="body-text">{beat}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Emotional Triggers */}
          {creativeData.emotionalTriggers && creativeData.emotionalTriggers.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="heading-3">المحفزات العاطفية</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {creativeData.emotionalTriggers.map((trigger, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="text-sm px-4 py-2"
                  >
                    {trigger}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Trending Formats */}
          {creativeData.trendingFormats && creativeData.trendingFormats.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Youtube className="w-5 h-5 text-primary" />
                <h3 className="heading-3">صيغ الفيديو الرائجة</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {creativeData.trendingFormats.map((format, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-muted/50 border border-border flex items-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                    <p className="body-text">{format}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Audience Questions */}
          {creativeData.audienceQuestions && creativeData.audienceQuestions.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="heading-3">أسئلة الجمهور</h3>
              </div>
              <div className="space-y-3">
                {creativeData.audienceQuestions.map((question, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-muted/30 border-r-2 border-primary/50"
                  >
                    <p className="body-text">❓ {question}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Inspiration References */}
          {creativeData.inspirationReferences && creativeData.inspirationReferences.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="heading-3">مراجع ملهمة</h3>
              </div>
              <div className="space-y-2">
                {creativeData.inspirationReferences.map((reference, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <p className="body-text">💡 {reference}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Render Factual Content */}
      {!isCreativeContent && researchData && (
        <>
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
        <EditableResearchField
          projectId={project.id}
          field="summary"
          value={researchData.summary}
          isEdited={project.research_manual_edits?.summary}
          onSave={handleFieldSave}
          multiline
        />
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
                <div className="flex-1">
                  <EditableResearchField
                    projectId={project.id}
                    field={`keyPoints.${index}`}
                    value={point}
                    isEdited={project.research_manual_edits?.[`keyPoints.${index}`]}
                    onSave={handleFieldSave}
                  />
                </div>
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
                <EditableResearchField
                  projectId={project.id}
                  field={`facts.${index}.value`}
                  value={fact.value}
                  isEdited={project.research_manual_edits?.[`facts.${index}.value`]}
                  onSave={handleFieldSave}
                  multiline
                />
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
                <div className="space-y-2">
                  <div className="font-semibold text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    خرافة:
                  </div>
                  <EditableResearchField
                    projectId={project.id}
                    field={`mythsVsReality.${index}.myth`}
                    value={item.myth}
                    isEdited={project.research_manual_edits?.[`mythsVsReality.${index}.myth`]}
                    onSave={handleFieldSave}
                  />
                </div>
                <div className="space-y-2 mt-3">
                  <div className="font-semibold text-foreground">
                    ✅ الحقيقة:
                  </div>
                  <EditableResearchField
                    projectId={project.id}
                    field={`mythsVsReality.${index}.reality`}
                    value={item.reality}
                    isEdited={project.research_manual_edits?.[`mythsVsReality.${index}.reality`]}
                    onSave={handleFieldSave}
                    multiline
                  />
                </div>
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
          <div className="space-y-3">
            {researchData.trends.map((trend, index) => (
              <div key={index} className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-1 shrink-0" />
                <EditableResearchField
                  projectId={project.id}
                  field={`trends.${index}`}
                  value={trend}
                  isEdited={project.research_manual_edits?.[`trends.${index}`]}
                  onSave={handleFieldSave}
                />
              </div>
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
                <div className="space-y-2 mb-3">
                  <div className="font-semibold text-foreground">س:</div>
                  <EditableResearchField
                    projectId={project.id}
                    field={`faqs.${index}.question`}
                    value={faq.question}
                    isEdited={project.research_manual_edits?.[`faqs.${index}.question`]}
                    onSave={handleFieldSave}
                  />
                </div>
                <div className="space-y-2">
                  <div className="font-semibold text-foreground">ج:</div>
                  <EditableResearchField
                    projectId={project.id}
                    field={`faqs.${index}.answer`}
                    value={faq.answer}
                    isEdited={project.research_manual_edits?.[`faqs.${index}.answer`]}
                    onSave={handleFieldSave}
                    multiline
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
        </>
      )}
    </div>
  );
};
