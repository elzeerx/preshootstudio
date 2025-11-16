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
          استخدم الذكاء الاصطناعي لجمع وتنظيم أهم المعلومات حول:{" "}
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
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="heading-3 mb-4">جاري تجهيز البحث...</h3>
          <p className="body-text text-muted-foreground">
            نستخدم الذكاء الاصطناعي لجمع أهم المعلومات حول:{" "}
            <span className="font-semibold text-foreground">{project.topic}</span>
          </p>
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (researchStatus === 'error') {
    return (
      <Card className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h3 className="heading-3 mb-4">حدث خطأ أثناء تجهيز البحث</h3>
        <p className="body-text mb-8 text-muted-foreground">نعتذر عن الإزعاج، يرجى المحاولة مرة أخرى</p>
        <Button variant="outline" onClick={runResearch} disabled={isLoading} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="heading-3">نتائج البحث</h3>
        <Button variant="ghost" size="sm" onClick={runResearch} disabled={isLoading} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          إعادة توليد البحث
        </Button>
      </div>
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-3 text-foreground">ملخص البحث</h4>
            <p className="body-text leading-relaxed">{researchData.summary}</p>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h4 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-secondary-foreground" />
          أهم النقاط
        </h4>
        <ul className="space-y-3">
          {researchData.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1">•</span>
              <span className="body-text flex-1">{point}</span>
            </li>
          ))}
        </ul>
      </Card>
      {researchData.facts && researchData.facts.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-lg mb-4 text-foreground">حقائق وأرقام</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {researchData.facts.map((fact, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <h5 className="font-semibold mb-2 text-foreground">{fact.label}</h5>
                <p className="body-text-secondary text-sm mb-1">{fact.value}</p>
                {fact.source && (
                  <p className="text-xs text-muted-foreground">المصدر: {fact.source}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
      {researchData.mythsVsReality && researchData.mythsVsReality.length > 0 && (
        <Card className="p-6 bg-accent-orange/5 border-accent-orange/20">
          <h4 className="font-semibold text-lg mb-4 text-foreground">خرافات vs حقائق</h4>
          <div className="space-y-4">
            {researchData.mythsVsReality.map((item, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="text-xs font-semibold text-destructive mb-2">❌ خرافة</div>
                  <p className="text-sm">{item.myth}</p>
                </div>
                <div className="p-4 bg-accent-green/10 rounded-lg border border-accent-green/20">
                  <div className="text-xs font-semibold text-accent-green mb-2">✅ حقيقة</div>
                  <p className="text-sm">{item.reality}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {researchData.trends && researchData.trends.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-green" />
            توجهات مرتبطة بالموضوع
          </h4>
          <div className="flex flex-wrap gap-2">
            {researchData.trends.map((trend, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">{trend}</Badge>
            ))}
          </div>
        </Card>
      )}
      {researchData.sources && researchData.sources.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-lg mb-4 text-foreground">مصادر مقترحة</h4>
          <div className="space-y-3">
            {researchData.sources.map((source, index) => {
              const typeLabels: Record<string, string> = {
                official: "رسمي", article: "مقال", video: "فيديو", other: "أخرى"
              };
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-foreground">{source.title}</h5>
                      {source.type && (
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[source.type] || source.type}
                        </Badge>
                      )}
                    </div>
                    {source.url && (
                      <a href={source.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        فتح الرابط
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      {researchData.faqs && researchData.faqs.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            أسئلة متوقعة من الجمهور
          </h4>
          <div className="space-y-4">
            {researchData.faqs.map((faq, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="font-semibold mb-2 text-foreground flex items-start gap-2">
                  <span className="text-primary">س:</span>
                  <span>{faq.question}</span>
                </div>
                <div className="text-sm text-muted-foreground mr-6">
                  <span className="font-semibold text-accent-green">ج:</span> {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
