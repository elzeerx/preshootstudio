import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScriptsData, getToneLabel } from "@/lib/types/scripts";

interface Project {
  id: string;
  topic: string;
  scripts_status?: string;
  scripts_data?: ScriptsData;
}

interface ScriptsTabProps {
  project: Project;
  onRefresh: () => void;
}

export const ScriptsTab = ({ project, onRefresh }: ScriptsTabProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const runScripts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-scripts', {
        body: { projectId: project.id }
      });

      if (error) throw error;

      toast({
        title: "تم تجهيز السكريبتات",
        description: "السكريبتات جاهزة للاستخدام الآن",
      });

      onRefresh();
    } catch (error) {
      console.error('Error running scripts:', error);
      toast({
        title: "حدث خطأ",
        description: "فشل تجهيز السكريبتات، الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast({
        title: "تم النسخ",
        description: "تم نسخ السكريبت إلى الحافظة",
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Error copying:', error);
      toast({
        title: "فشل النسخ",
        description: "حدث خطأ أثناء النسخ",
        variant: "destructive",
      });
    }
  };

  const status = project.scripts_status || 'idle';
  const scriptsData = project.scripts_data;

  // Idle state
  if (status === 'idle' || !scriptsData) {
    return (
      <Card className="p-8" dir="rtl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-3 text-right">سكريبتات التصوير</h3>
            <p className="body-text mb-6 text-right">
              ما تم تجهيز سكريبتات لهذا الموضوع بعد.
            </p>
            <Button onClick={runScripts} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  جاري التجهيز...
                </>
              ) : (
                'تجهيز السكريبتات بالذكاء الاصطناعي'
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <Card className="p-8" dir="rtl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-3">جاري كتابة السكريبتات…</h3>
            <p className="body-text text-muted-foreground">
              نستخدم الذكاء الاصطناعي لكتابة سكريبتات تناسب الموضوع: <strong>{project.topic}</strong>
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <Card className="p-8" dir="rtl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-3">حدث خطأ</h3>
            <p className="body-text text-muted-foreground mb-4">
              حدث خطأ أثناء تجهيز السكريبتات.
            </p>
            <Button onClick={runScripts} variant="outline">
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Ready state with scripts
  return (
    <div className="space-y-6" dir="rtl">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="heading-3">سكريبتات التصوير</h3>
          </div>
          <Button onClick={runScripts} variant="ghost" size="sm">
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة توليد السكريبتات
          </Button>
        </div>

        <Tabs defaultValue="teleprompter" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teleprompter">سكريبت التلقين</TabsTrigger>
            <TabsTrigger value="reel">سكريبت الريلز</TabsTrigger>
            <TabsTrigger value="longVideo">سكريبت الفيديو الطويل</TabsTrigger>
          </TabsList>

          {/* Teleprompter Script */}
          <TabsContent value="teleprompter" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">{scriptsData.teleprompter.title}</h4>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>النبرة: {getToneLabel(scriptsData.teleprompter.tone)}</span>
                  <span>المدة التقريبية: {scriptsData.teleprompter.estimatedDurationSec} ثانية</span>
                </div>
              </div>

              <Card className="p-6 bg-muted/30">
                <div className="space-y-3">
                  {scriptsData.teleprompter.lines.map((line, index) => (
                    <p key={index} className="text-lg leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </Card>

              <Button 
                onClick={() => copyToClipboard(scriptsData.teleprompter.lines.join('\n\n'), 'teleprompter')}
                variant="outline"
                className="w-full"
              >
                {copiedSection === 'teleprompter' ? (
                  <>
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="ml-2 h-4 w-4" />
                    نسخ السكريبت كامل
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Reel Script */}
          <TabsContent value="reel" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">{scriptsData.reel.title}</h4>
                <p className="text-sm text-muted-foreground">
                  مدة تقريبية: {scriptsData.reel.estimatedDurationSec} ثانية
                </p>
              </div>

              <div className="space-y-4">
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <h5 className="font-semibold mb-2">الافتتاحية (Hook):</h5>
                  <p className="leading-relaxed">{scriptsData.reel.hook}</p>
                </Card>

                <Card className="p-4 bg-secondary/5 border-secondary/20">
                  <h5 className="font-semibold mb-2">النقاط الرئيسية:</h5>
                  <ul className="space-y-2">
                    {scriptsData.reel.bodyPoints.map((point, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-4 bg-accent/5 border-accent/20">
                  <h5 className="font-semibold mb-2">الخاتمة:</h5>
                  <p className="leading-relaxed">{scriptsData.reel.outro}</p>
                </Card>
              </div>

              <Button 
                onClick={() => {
                  const fullReel = `${scriptsData.reel.hook}\n\n${scriptsData.reel.bodyPoints.join('\n')}\n\n${scriptsData.reel.outro}`;
                  copyToClipboard(fullReel, 'reel');
                }}
                variant="outline"
                className="w-full"
              >
                {copiedSection === 'reel' ? (
                  <>
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="ml-2 h-4 w-4" />
                    نسخ سكريبت الريلز
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Long Video Script */}
          <TabsContent value="longVideo" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">{scriptsData.longVideo.title}</h4>
                <p className="text-sm text-muted-foreground">
                  المدة التقريبية: {scriptsData.longVideo.estimatedDurationMin} دقيقة
                </p>
              </div>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <h5 className="font-semibold mb-2">المقدمة:</h5>
                <p className="leading-relaxed">{scriptsData.longVideo.intro}</p>
              </Card>

              <div className="space-y-3">
                <h5 className="font-semibold">مخطط الفيديو (Outline):</h5>
                {scriptsData.longVideo.sections.map((section, index) => (
                  <Card key={index} className="p-4 bg-secondary/5 border-secondary/20">
                    <h6 className="font-semibold mb-1">{section.title}</h6>
                    <p className="text-sm text-muted-foreground mb-2">{section.summary}</p>
                    <ul className="space-y-1">
                      {section.bullets.map((bullet, bIndex) => (
                        <li key={bIndex} className="flex gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>

              <Card className="p-4 bg-muted/30">
                <h5 className="font-semibold mb-2">النص الكامل:</h5>
                <div className="max-h-96 overflow-y-auto prose prose-sm max-w-none">
                  <p className="whitespace-pre-line leading-relaxed">{scriptsData.longVideo.fullScript}</p>
                </div>
              </Card>

              <Card className="p-4 bg-accent/5 border-accent/20">
                <h5 className="font-semibold mb-2">الخاتمة:</h5>
                <p className="leading-relaxed">{scriptsData.longVideo.outro}</p>
              </Card>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    const outline = scriptsData.longVideo.sections
                      .map(s => `${s.title}\n${s.summary}\n${s.bullets.map(b => `• ${b}`).join('\n')}`)
                      .join('\n\n');
                    copyToClipboard(outline, 'outline');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {copiedSection === 'outline' ? (
                    <>
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="ml-2 h-4 w-4" />
                      نسخ المخطط فقط
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    const fullScript = `${scriptsData.longVideo.intro}\n\n${scriptsData.longVideo.fullScript}\n\n${scriptsData.longVideo.outro}`;
                    copyToClipboard(fullScript, 'fullVideo');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {copiedSection === 'fullVideo' ? (
                    <>
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="ml-2 h-4 w-4" />
                      نسخ السكريبت الكامل
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
