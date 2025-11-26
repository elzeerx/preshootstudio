import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Copy, RefreshCw, Clock, Tag, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleData } from "@/lib/types/article";
import { hasValidResearchForContentType, getMissingResearchMessage } from "@/lib/helpers/researchValidation";
import { CreativeResearchData } from "@/lib/types/creativeResearch";

interface Project {
  id: string;
  topic: string;
  content_type?: string;
  article_status?: string;
  article_data?: ArticleData;
  article_last_run_at?: string;
  research_data?: any;
  creative_data?: CreativeResearchData;
}

interface ArticleTabProps {
  project: Project;
  onProjectUpdate?: () => void;
}

export const ArticleTab = ({ project, onProjectUpdate }: ArticleTabProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const hasResearch = hasValidResearchForContentType(
    project.research_data,
    project.creative_data,
    project.content_type || 'factual'
  );

  const handleGenerateArticle = async () => {
    // Check for research before proceeding
    if (!hasResearch) {
      toast({
        title: "البحث مطلوب",
        description: getMissingResearchMessage(project.content_type || 'factual'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-article", {
        body: { projectId: project.id },
      });

      if (error) throw error;

      // Trigger parent refetch
      onProjectUpdate?.();

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
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Article content skeleton */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>

            <Separator />

            {/* Introduction */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <Separator />

            {/* Sections */}
            <div className="space-y-6">
              <Skeleton className="h-6 w-32" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>

            <Separator />

            {/* Conclusion */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            <Separator />

            {/* SEO Meta */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-20" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Copy buttons */}
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
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
              <RefreshCw className="w-4 h-4 ms-2" />
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
            <RefreshCw className="w-4 h-4 ms-2" />
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
      {!hasResearch && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>البحث مطلوب</AlertTitle>
          <AlertDescription>
            {getMissingResearchMessage(project.content_type || 'factual')}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3">مقال جاهز للنشر</h3>
          <p className="body-text text-muted-foreground mb-6">
            ما تم تجهيز مقال لهذا الموضوع بعد.
          </p>
          <Button onClick={handleGenerateArticle} size="lg" disabled={!hasResearch}>
            <BookOpen className="w-5 h-5 ml-2" />
            تجهيز المقال بالذكاء الاصطناعي
          </Button>
        </div>
      </div>
    </Card>
  );
};
