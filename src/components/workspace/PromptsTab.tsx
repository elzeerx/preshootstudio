import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Image as ImageIcon, Video, FileImage, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PromptsData, ImagePrompt, VideoPrompt, ThumbnailPrompt } from "@/lib/types/prompts";

interface Project {
  id: string;
  topic: string;
  prompts_status?: string | null;
  prompts_data?: PromptsData | null;
  [key: string]: any;
}

interface PromptsTabProps {
  project: Project;
}

export const PromptsTab = ({ project: initialProject }: PromptsTabProps) => {
  const [project, setProject] = useState(initialProject);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePrompts = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('run-prompts', {
        body: { projectId: project.id }
      });

      if (error) throw error;

      // Refresh project data
      const { data: updatedProject, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .single();

      if (fetchError) throw fetchError;
      
      setProject({
        ...updatedProject,
        prompts_data: updatedProject.prompts_data as any
      } as Project);
      toast.success('تم تجهيز حزمة البرومبتات بنجاح!');
    } catch (error) {
      console.error('Error generating prompts:', error);
      toast.error('حدث خطأ أثناء تجهيز البرومبتات');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`تم نسخ ${label}`);
    } catch (error) {
      toast.error('فشل النسخ');
    }
  };

  const getModelLabel = (model: string) => {
    const labels: Record<string, string> = {
      midjourney: "مناسب لـ Midjourney",
      gemini: "مناسب لـ Gemini",
      generic: "عام – يصلح لمعظم مولدات الصور"
    };
    return labels[model] || model;
  };

  // Loading state
  if (isGenerating || project.prompts_status === 'loading') {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <h3 className="heading-3">جاري تجهيز حزمة البرومبتات…</h3>
          <p className="body-text text-muted-foreground text-center max-w-md">
            نستخدم الذكاء الاصطناعي لإنشاء برومبتات جاهزة للصور والفيديو حول: <strong>{project.topic}</strong>
          </p>
        </div>
      </Card>
    );
  }

  // Error state
  if (project.prompts_status === 'error') {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h3 className="heading-3">حدث خطأ أثناء تجهيز حزمة البرومبتات</h3>
          <Button onClick={handleGeneratePrompts} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري المحاولة...
              </>
            ) : (
              'إعادة المحاولة'
            )}
          </Button>
        </div>
      </Card>
    );
  }

  // Idle state - no prompts generated yet
  if (!project.prompts_data || project.prompts_status === 'idle') {
    return (
      <Card className="p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent-orange/20 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-6 h-6 text-accent-orange" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-3">برومبتات الصور والفيديو</h3>
            <p className="body-text text-muted-foreground mb-6">
              ما تم تجهيز برومبتات لهذا الموضوع بعد.
            </p>
            <Button onClick={handleGeneratePrompts} disabled={isGenerating} size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري التجهيز...
                </>
              ) : (
                <>
                  <ImageIcon className="ml-2 h-4 w-4" />
                  تجهيز حزمة البرومبتات بالذكاء الاصطناعي
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Ready state - show prompts
  const promptsData = project.prompts_data as PromptsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="heading-3 mb-2">حزمة البرومبتات</h3>
            <p className="body-text text-muted-foreground">
              الموضوع: <strong>{project.topic}</strong>
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleGeneratePrompts} 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري التوليد...
              </>
            ) : (
              'إعادة توليد البرومبتات'
            )}
          </Button>
        </div>
      </Card>

      {/* Tabs for different prompt types */}
      <Tabs defaultValue="images" dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="images">
            <ImageIcon className="ml-2 h-4 w-4" />
            برومبتات الصور
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="ml-2 h-4 w-4" />
            برومبتات الفيديو
          </TabsTrigger>
          <TabsTrigger value="thumbnails">
            <FileImage className="ml-2 h-4 w-4" />
            برومبتات الـ Thumbnail
          </TabsTrigger>
        </TabsList>

        {/* Image Prompts */}
        <TabsContent value="images" className="space-y-4 mt-6">
          {promptsData.imagePrompts && promptsData.imagePrompts.length > 0 ? (
            promptsData.imagePrompts.map((prompt: ImagePrompt) => (
              <Card key={prompt.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-lg">{prompt.label}</h4>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant="secondary">{getModelLabel(prompt.model)}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">نسبة الأبعاد:</span>
                      <span className="mr-2 font-medium">{prompt.aspectRatio}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الأسلوب البصري:</span>
                      <span className="mr-2 font-medium">{prompt.style}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      نص البرومبت (إنجليزي):
                    </label>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm leading-relaxed">
                      {prompt.prompt}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(prompt.prompt, 'برومبت الصورة')}
                  >
                    <Copy className="ml-2 h-4 w-4" />
                    نسخ برومبت الصورة
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">لا توجد برومبتات للصور</p>
            </Card>
          )}
        </TabsContent>

        {/* Video Prompts */}
        <TabsContent value="videos" className="space-y-4 mt-6">
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              يمكن استخدام هذه البرومبتات مع مولدات الفيديو مثل Sora و Veo و غيرها.
            </p>
          </div>

          {promptsData.videoPrompts && promptsData.videoPrompts.length > 0 ? (
            promptsData.videoPrompts.map((prompt: VideoPrompt) => (
              <Card key={prompt.id} className="p-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">{prompt.label}</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">المدة المقترحة:</span>
                      <span className="mr-2 font-medium">{prompt.durationSec} ثانية</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الأسلوب:</span>
                      <span className="mr-2 font-medium">{prompt.style}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      برومبت الفيديو (إنجليزي):
                    </label>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm leading-relaxed">
                      {prompt.prompt}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(prompt.prompt, 'برومبت الفيديو')}
                  >
                    <Copy className="ml-2 h-4 w-4" />
                    نسخ برومبت الفيديو
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">لا توجد برومبتات للفيديو</p>
            </Card>
          )}
        </TabsContent>

        {/* Thumbnail Prompts */}
        <TabsContent value="thumbnails" className="space-y-4 mt-6">
          {promptsData.thumbnailPrompts && promptsData.thumbnailPrompts.length > 0 ? (
            promptsData.thumbnailPrompts.map((prompt: ThumbnailPrompt) => (
              <Card key={prompt.id} className="p-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">{prompt.label}</h4>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      برومبت الـ Thumbnail (إنجليزي):
                    </label>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm leading-relaxed">
                      {prompt.prompt}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(prompt.prompt, 'برومبت الـ Thumbnail')}
                  >
                    <Copy className="ml-2 h-4 w-4" />
                    نسخ برومبت الـ Thumbnail
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">لم يتم توليد برومبتات Thumbnails لهذا الموضوع</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Notes Section */}
      {promptsData.notes && promptsData.notes.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-lg mb-4">ملاحظات حول استخدام البرومبتات</h4>
          <ul className="space-y-2">
            {promptsData.notes.map((note, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="body-text">{note}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
