import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, AlertCircle, RefreshCw, ExternalLink, Lightbulb, TrendingUp, HelpCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ResearchData } from "@/lib/types/research";

interface Project {
  id: string;
  topic: string;
  research_status?: string;
  research_summary?: string;
  research_data?: ResearchData;
}

interface ResearchTabProps {
  project: Project;
}

export const ResearchTab = ({ project: initialProject }: ResearchTabProps) => {
  const [project, setProject] = useState(initialProject);
  const [isLoading, setIsLoading] = useState(false);

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
          id: updatedProject.id,
          topic: updatedProject.topic,
          research_status: updatedProject.research_status || undefined,
          research_summary: updatedProject.research_summary || undefined,
          research_data: updatedProject.research_data as unknown as ResearchData | undefined
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

  const researchStatus = project.research_status || 'idle';
  const researchData = project.research_data as ResearchData | undefined;

  if (researchStatus === 'idle' || !researchData) {
    return (
      <Card className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Search className="w-10 h-10 text-primary" />
        </div>
        <h3 className="heading-3 mb-4">ما تم تجهيز بحث لهذا الموضوع بعد</h3>
        <p className="body-text mb-8 max-w-2xl mx-auto">
          استخدم Tavily Web Search + الذكاء الاصطناعي لجمع وتنظيم أهم المعلومات حول:{" "}
          <span className="font-semibold text-primary">{project.topic}</span>
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
      <Card className="p-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Search className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h3 className="heading-3 mb-4">جاري تجهيز البحث...</h3>
          <p className="body-text mb-4">
            نستخدم Tavily Web Search لجلب أحدث المعلومات من الإنترنت
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
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
    <div className="space-y-6">
      {/* Research Summary */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="heading-3">ملخص البحث</h3>
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
              <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-semibold text-primary mb-2">{fact.label}</p>
                <p className="body-text mb-3">{fact.value}</p>
                {fact.source && fact.url && (
                  <a
                    href={fact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="line-clamp-1">{fact.source}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
                {fact.source && !fact.url && (
                  <p className="text-xs text-muted-foreground">
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
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="w-5 h-5 text-primary" />
            <h3 className="heading-3">المصادر والمراجع</h3>
          </div>
          <div className="grid gap-3">
            {researchData.sources.map((source, index) => (
              <a
                key={index}
                href={source.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <Badge variant="outline" className="mt-1 shrink-0">
                  {source.type === "official" ? "رسمي" : 
                   source.type === "article" ? "مقال" : 
                   source.type === "blog" ? "مدونة" :
                   source.type === "video" ? "فيديو" :
                   source.type === "news" ? "خبر" : "عام"}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {source.title}
                  </p>
                  {source.url && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {source.url}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
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
              <div key={index} className="p-4 rounded-lg bg-muted/30 border-r-4 border-destructive">
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
              <div key={index} className="p-4 rounded-lg bg-muted/30">
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
