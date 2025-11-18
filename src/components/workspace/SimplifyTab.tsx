import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Sparkles, BookOpen, Layers, CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { SimplifyData } from "@/lib/types/simplify";

interface Project {
  id: string;
  topic: string;
  simplify_status?: string | null;
  simplify_data?: any;
  simplify_last_run_at?: string | null;
}

interface SimplifyTabProps {
  project: Project;
}

export const SimplifyTab = ({ project: initialProject }: SimplifyTabProps) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [isLoading, setIsLoading] = useState(false);

  const copyAllSimplified = async () => {
    if (!simplifyData) return;
    
    let content = `# الشرح المبسط: ${project.topic}\n\n`;
    
    if (simplifyData.difficulty_level) {
      content += `**المستوى:** ${getDifficultyLabel(simplifyData.difficulty_level)}\n\n`;
    }
    
    content += `## الشرح المبسط\n${simplifyData.simplified_explanation}\n\n`;
    
    if (simplifyData.everyday_examples && simplifyData.everyday_examples.length > 0) {
      content += `## أمثلة من الحياة اليومية\n`;
      simplifyData.everyday_examples.forEach((example) => {
        content += `**${example.title}**\n${example.description}\n\n`;
      });
    }
    
    if (simplifyData.analogies && simplifyData.analogies.length > 0) {
      content += `## تشبيهات توضيحية\n`;
      simplifyData.analogies.forEach((analogy) => {
        content += `**${analogy.concept}**\n${analogy.analogy}\n\n`;
      });
    }
    
    if (simplifyData.key_takeaways && simplifyData.key_takeaways.length > 0) {
      content += `## النقاط الأساسية للتذكر\n`;
      simplifyData.key_takeaways.forEach((takeaway, index) => {
        content += `${index + 1}. ${takeaway}\n`;
      });
    }
    
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الشرح المبسط كامل بنجاح",
      });
    } catch (error) {
      toast({
        title: "فشل النسخ",
        description: "حدث خطأ أثناء النسخ",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  const simplifyStatus = project.simplify_status || 'idle';
  const simplifyData = project.simplify_data as SimplifyData | null;

  const runSimplify = async () => {
    try {
      setIsLoading(true);
      
      const { error: updateError } = await supabase
        .from('projects')
        .update({ simplify_status: 'processing' })
        .eq('id', project.id);

      if (updateError) throw updateError;

      const { error: functionError } = await supabase.functions.invoke('run-simplify', {
        body: { projectId: project.id }
      });

      if (functionError) throw functionError;

      const { data: updatedProject } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .single();

      if (updatedProject) {
        setProject(updatedProject);
      }

      toast({
        title: "تم التبسيط بنجاح",
        description: "تم تبسيط الموضوع بنجاح",
      });
    } catch (error) {
      console.error('Error running simplify:', error);
      
      await supabase
        .from('projects')
        .update({ simplify_status: 'error' })
        .eq('id', project.id);
      
      toast({
        title: "خطأ في التبسيط",
        description: "حدث خطأ أثناء تبسيط الموضوع",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدئ';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'متقدم';
      default: return level;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  // Idle state
  if (simplifyStatus === 'idle' || !simplifyData) {
    return (
      <Card className="p-8" dir="rtl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-3 text-right">تبسيط الفكرة</h3>
            <div className="space-y-4 body-text leading-relaxed text-right">
              <p>
                استخدم الذكاء الاصطناعي لتبسيط الموضوع بأسلوب يناسب الجمهور العام، 
                مع أمثلة وتشبيهات تسهّل الفهم.
              </p>
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-foreground">هدف التبسيط:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>تحويل المفاهيم المعقدة إلى شرح بسيط وواضح</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>استخدام أمثلة من الحياة اليومية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>تشبيهات تساعد على الفهم السريع</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>لغة عربية مبسطة وسلسة</span>
                  </li>
                </ul>
              </div>
              <Button 
                onClick={runSimplify} 
                disabled={isLoading}
                className="mt-6"
                size="lg"
              >
                <Sparkles className="w-5 h-5 ms-2" />
                تبسيط الفكرة بالذكاء الاصطناعي
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Loading state
  if (simplifyStatus === 'processing' || isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="animate-spin">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="heading-3">جاري التبسيط...</h3>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (simplifyStatus === 'error') {
    return (
      <Card className="p-8" dir="rtl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-3 text-destructive">حدث خطأ أثناء التبسيط</h3>
            <p className="body-text text-muted-foreground mb-4" dir="rtl">
              عذراً، حدث خطأ أثناء محاولة تبسيط الموضوع. يرجى المحاولة مرة أخرى.
            </p>
            <Button onClick={runSimplify} disabled={isLoading} variant="outline">
              <Sparkles className="w-4 h-4 ms-2" />
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Success state - Display results
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Copy All button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-3">الشرح المبسط</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllSimplified}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            نسخ الشرح كامل
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runSimplify}
            disabled={isLoading}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            إعادة التبسيط
          </Button>
        </div>
      </div>

      {/* Main Explanation */}
      <Card className="p-8" dir="rtl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="heading-3">الشرح المبسط</h3>
              {simplifyData.difficulty_level && (
                <span className={`text-sm font-semibold ${getDifficultyColor(simplifyData.difficulty_level)}`}>
                  • {getDifficultyLabel(simplifyData.difficulty_level)}
                </span>
              )}
            </div>
            <p className="body-text leading-relaxed whitespace-pre-wrap">
              {simplifyData.simplified_explanation}
            </p>
          </div>
        </div>
      </Card>

      {/* Everyday Examples */}
      {simplifyData.everyday_examples && simplifyData.everyday_examples.length > 0 && (
        <Card className="p-8" dir="rtl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="heading-3 mb-4">أمثلة من الحياة اليومية</h3>
              <div className="space-y-4">
                {simplifyData.everyday_examples.map((example, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">{example.title}</h4>
                    <p className="body-text text-muted-foreground">{example.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Analogies */}
      {simplifyData.analogies && simplifyData.analogies.length > 0 && (
        <Card className="p-8" dir="rtl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="heading-3 mb-4">التشبيهات التوضيحية</h3>
              <div className="space-y-4">
                {simplifyData.analogies.map((analogy, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/30 border-r-4 border-primary">
                    <p className="font-semibold text-primary mb-2">{analogy.concept}</p>
                    <p className="body-text text-muted-foreground">{analogy.analogy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Key Takeaways */}
      {simplifyData.key_takeaways && simplifyData.key_takeaways.length > 0 && (
        <Card className="p-8" dir="rtl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="heading-3 mb-4">النقاط المهمة للتذكر</h3>
              <ul className="space-y-3">
                {simplifyData.key_takeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="body-text">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Regenerate Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={runSimplify} disabled={isLoading} variant="outline" size="lg">
          <Sparkles className="w-4 h-4 ms-2" />
          إعادة التبسيط
        </Button>
      </div>
    </div>
  );
};
