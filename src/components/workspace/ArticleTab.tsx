import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Copy, RefreshCw, Clock, Tag } from "lucide-react";
import { ArticleData } from "@/lib/types/article";

interface Project {
  id: string;
  topic: string;
  article_status?: string;
  article_data?: ArticleData;
  article_last_run_at?: string;
}

interface ArticleTabProps {
  project: Project;
  onProjectUpdate?: (updates: Partial<Project>) => void;
}

export const ArticleTab = ({ project, onProjectUpdate }: ArticleTabProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateArticle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-article", {
        body: { projectId: project.id },
      });

      if (error) throw error;

      // Refresh project data
      const { data: updatedProject } = await supabase
        .from("projects")
        .select("*")
        .eq("id", project.id)
        .single();

      if (updatedProject && onProjectUpdate) {
        onProjectUpdate({
          article_status: updatedProject.article_status,
          article_data: updatedProject.article_data as any as ArticleData,
          article_last_run_at: updatedProject.article_last_run_at,
        });
      }

      toast({
        title: "تم تجهيز المقال بنجاح",
        description: "المقال جاهز الآن للقراءة والنسخ",
      });
    } catch (error) {
      console.error("Error generating article:", error);
      toast({
        title: "حدث خطأ",
        description: "فشل تجهيز المقال. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAsPlainText = () => {
    if (!project.article_data) return;

    const article = project.article_data;
    let text = `${article.title}\n\n${article.subtitle}\n\n`;
    text += `${article.intro}\n\n`;
    
    article.sections.forEach((section) => {
      text += `${section.heading}\n\n${section.body}\n\n`;
    });
    
    text += `${article.conclusion}`;

    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ المقال كنص عادي",
    });
  };

  const copyAsMarkdown = () => {
    if (!project.article_data) return;

    const article = project.article_data;
    let markdown = `# ${article.title}\n\n## ${article.subtitle}\n\n`;
    markdown += `### مقدمة\n\n${article.intro}\n\n`;
    
    article.sections.forEach((section) => {
      markdown += `### ${section.heading}\n\n${section.body}\n\n`;
    });
    
    markdown += `### خاتمة\n\n${article.conclusion}`;

    navigator.clipboard.writeText(markdown);
    toast({
      title: "تم النسخ",
      description: "تم نسخ المقال بصيغة Markdown",
    });
  };

  // Loading state
  if (project.article_status === "loading" || isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-3">جاري كتابة المقال…</h3>
            <p className="body-text text-muted-foreground">
              نستخدم الذكاء الاصطناعي لكتابة مقال جاهز للنشر عن: <strong>{project.topic}</strong>
            </p>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (project.article_status === "error") {
    return (
      <Card className="p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-3 text-destructive">حدث خطأ أثناء كتابة المقال</h3>
            <p className="body-text text-muted-foreground mb-4">
              لم نتمكن من إنشاء المقال. يرجى المحاولة مرة أخرى.
            </p>
            <Button onClick={handleGenerateArticle} variant="outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Ready state - display article
  if (project.article_status === "ready" && project.article_data) {
    const article = project.article_data;

    return (
      <div className="space-y-6">
        {/* Header with regenerate button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="heading-3">مقال جاهز للنشر</h3>
              <p className="text-sm text-muted-foreground">الموضوع: {project.topic}</p>
            </div>
          </div>
          <Button onClick={handleGenerateArticle} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة توليد المقال
          </Button>
        </div>

        {/* Article content */}
        <Card className="p-8">
          <div className="space-y-6">
            {/* Title and subtitle */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{article.title}</h1>
              <h2 className="text-xl text-muted-foreground">{article.subtitle}</h2>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>مدة القراءة التقريبية: {article.readingTimeMinutes} دقيقة</span>
                </div>
                <Badge variant="outline">{article.format === 'blog' ? 'مدونة' : article.format === 'news' ? 'خبر' : 'رأي'}</Badge>
              </div>
            </div>

            <Separator />

            {/* Introduction */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">مقدمة</h3>
              <p className="body-text leading-relaxed text-foreground/90">{article.intro}</p>
            </div>

            <Separator />

            {/* Sections */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">محتوى المقال</h3>
              {article.sections.map((section, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="text-base font-semibold text-foreground">{section.heading}</h4>
                  <p className="body-text leading-relaxed text-foreground/90 whitespace-pre-wrap">{section.body}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Conclusion */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">خاتمة</h3>
              <p className="body-text leading-relaxed text-foreground/90">{article.conclusion}</p>
            </div>

            <Separator />

            {/* SEO Meta */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Tag className="w-5 h-5" />
                معلومات SEO
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">عنوان SEO:</p>
                  <p className="text-sm text-muted-foreground">{article.seoMeta.seoTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">وصف SEO:</p>
                  <p className="text-sm text-muted-foreground">{article.seoMeta.seoDescription}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">الكلمات المفتاحية:</p>
                  <div className="flex flex-wrap gap-2">
                    {article.seoMeta.seoKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Copy buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={copyAsPlainText} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 ml-2" />
                نسخ المقال كنص عادي
              </Button>
              <Button onClick={copyAsMarkdown} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 ml-2" />
                نسخ المقال بصيغة Markdown
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Idle state - no article yet
  return (
    <Card className="p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3">مقال جاهز للنشر</h3>
          <p className="body-text text-muted-foreground mb-6">
            ما تم تجهيز مقال لهذا الموضوع بعد.
          </p>
          <Button onClick={handleGenerateArticle} size="lg">
            <BookOpen className="w-5 h-5 ml-2" />
            تجهيز المقال بالذكاء الاصطناعي
          </Button>
        </div>
      </div>
    </Card>
  );
};
