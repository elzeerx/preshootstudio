import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Copy, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { BRollData, BRollShot } from "@/lib/types/broll";

interface Project {
  id: string;
  topic: string;
  broll_status?: string | null;
  broll_data?: BRollData | null;
  broll_last_run_at?: string | null;
}

interface BRollTabProps {
  project: Project;
  onRefresh?: () => void;
}

const SHOT_TYPE_LABELS: Record<string, string> = {
  'close-up': 'لقطة قريبة',
  'medium': 'لقطة متوسطة',
  'wide': 'لقطة واسعة',
  'macro': 'لقطة ماكرو',
  'screen-record': 'تسجيل شاشة',
  'product': 'لقطة منتج',
  'b-roll': 'لقطة دعم'
};

const CAMERA_MOVEMENT_LABELS: Record<string, string> = {
  'static': 'ثابتة',
  'pan': 'تحريك أفقي (Pan)',
  'tilt': 'تحريك عمودي (Tilt)',
  'slide': 'انزلاق (Slide)',
  'handheld': 'يدوية (Handheld)',
  'zoom-in': 'زووم للداخل',
  'zoom-out': 'زووم للخارج',
  'orbit': 'دوران حول العنصر'
};

export const BRollTab = ({ project, onRefresh }: BRollTabProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const copyAllBRoll = async () => {
    if (!project.broll_data) return;
    
    const brollData = project.broll_data as BRollData;
    let content = `# خطة لقطات الـ B-Roll: ${project.topic}\n\n`;
    
    if (brollData.generalTips && brollData.generalTips.length > 0) {
      content += `## نصائح عامة للتصوير\n`;
      brollData.generalTips.forEach((tip) => {
        content += `• ${tip}\n`;
      });
      content += '\n';
    }
    
    content += `## اللقطات المقترحة (${brollData.shots.length} لقطة)\n\n`;
    
    brollData.shots.forEach((shot, index) => {
      content += `### ${index + 1}. ${shot.title}\n`;
      content += `**الوصف:** ${shot.description}\n`;
      content += `**نوع اللقطة:** ${SHOT_TYPE_LABELS[shot.shotType] || shot.shotType}\n`;
      content += `**حركة الكاميرا:** ${CAMERA_MOVEMENT_LABELS[shot.cameraMovement] || shot.cameraMovement}\n`;
      if (shot.durationSec > 0) {
        content += `**المدة:** ${shot.durationSec} ثانية\n`;
      }
      content += `**المكان/السياق:** ${shot.locationOrContext}\n`;
      if (shot.notes) {
        content += `**ملاحظات:** ${shot.notes}\n`;
      }
      content += '\n';
    });
    
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "تم النسخ",
        description: "تم نسخ خطة B-Roll كاملة بنجاح"
      });
    } catch (error) {
      toast({
        title: "فشل النسخ",
        description: "حدث خطأ أثناء النسخ",
        variant: "destructive"
      });
    }
  };

  const handleGenerateBRoll = async () => {
    setIsGenerating(true);
    
    try {
      const { error } = await supabase.functions.invoke('run-broll', {
        body: { projectId: project.id }
      });

      if (error) throw error;

      toast({
        title: "تم تجهيز خطة B-Roll بنجاح",
        description: "يمكنك الآن الاطلاع على اللقطات المقترحة"
      });

      onRefresh?.();
    } catch (error) {
      console.error('Error generating B-Roll:', error);
      toast({
        title: "حدث خطأ",
        description: "فشل تجهيز خطة B-Roll. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ",
        description: `تم نسخ ${label} إلى الحافظة`
      });
    } catch (error) {
      toast({
        title: "فشل النسخ",
        description: "حدث خطأ أثناء النسخ",
        variant: "destructive"
      });
    }
  };

  const copyShotDescription = (shot: BRollShot) => {
    const text = `${shot.title}\n\n${shot.description}\n\nالمكان/السياق: ${shot.locationOrContext}\n\nملاحظات: ${shot.notes}`;
    copyToClipboard(text, 'وصف اللقطة');
  };

  // Idle state
  if (!project.broll_status || project.broll_status === 'idle' || !project.broll_data) {
    return (
      <Card className="p-8" dir="rtl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
            <Video className="w-6 h-6 text-accent-green" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-3 text-right">خطة لقطات الـ B-Roll</h3>
            <p className="body-text text-muted-foreground mb-6 text-right">
              ما تم تجهيز خطة B-Roll لهذا الموضوع بعد.
            </p>
            <Button 
              onClick={handleGenerateBRoll}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التجهيز...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  تجهيز خطة B-Roll بالذكاء الاصطناعي
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Loading state
  if (project.broll_status === 'loading' || isGenerating) {
    return (
      <Card className="p-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <Skeleton className="h-9 w-32" />
          </div>

          {/* General tips skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-1" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Shots skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-9 w-40" />
            </div>

            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  {/* Shot header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                    <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                  </div>

                  <Separator />

                  {/* Shot details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>

                  <Separator />

                  {/* AI prompt section */}
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-9 w-full mt-2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (project.broll_status === 'error') {
    return (
      <Card className="p-8" dir="rtl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-2">حدث خطأ</h3>
            <p className="body-text text-muted-foreground mb-6">
              حدث خطأ أثناء تجهيز خطة الـ B-Roll.
            </p>
            <Button 
              onClick={handleGenerateBRoll}
              disabled={isGenerating}
              variant="outline"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري المحاولة...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Ready state
  const brollData = project.broll_data as BRollData;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with regenerate and copy all buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
            <Video className="w-5 h-5 text-accent-green" />
          </div>
          <h3 className="heading-3">خطة لقطات الـ B-Roll</h3>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={copyAllBRoll}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            نسخ الخطة كاملة
          </Button>
          <Button
            onClick={handleGenerateBRoll}
            disabled={isGenerating}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التجديد...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                إعادة توليد خطة B-Roll
              </>
            )}
          </Button>
        </div>
      </div>

      {/* General Tips Section */}
      {brollData.generalTips && brollData.generalTips.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-lg mb-4">نصائح عامة للتصوير</h4>
          <ul className="space-y-2">
            {brollData.generalTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3 body-text">
                <span className="text-accent-green font-bold mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Shots Section */}
      <div>
        <h4 className="font-semibold text-lg mb-4">اللقطات المقترحة ({brollData.shots.length} لقطة)</h4>
        <div className="grid gap-6">
          {brollData.shots.map((shot) => (
            <Card key={shot.id} className="p-6">
              {/* Shot Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h5 className="font-bold text-lg mb-2">{shot.title}</h5>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {SHOT_TYPE_LABELS[shot.shotType] || shot.shotType}
                    </Badge>
                    <Badge variant="outline">
                      {CAMERA_MOVEMENT_LABELS[shot.cameraMovement] || shot.cameraMovement}
                    </Badge>
                    {shot.durationSec > 0 && (
                      <Badge variant="outline" className="gap-1">
                        ⏱ {shot.durationSec} ثانية
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Shot Description */}
              <div className="space-y-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">وصف اللقطة</p>
                  <p className="body-text">{shot.description}</p>
                </div>

                {shot.locationOrContext && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">المكان / السياق</p>
                    <p className="body-text">{shot.locationOrContext}</p>
                  </div>
                )}

                {shot.notes && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">ملاحظات المخرج</p>
                    <p className="body-text">{shot.notes}</p>
                  </div>
                )}

                {/* AI Image Prompt */}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">برومبت لصورة تمثّل اللقطة (AI)</p>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm text-foreground/90 select-all">
                    {shot.aiImagePrompt}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <Button
                  onClick={() => copyShotDescription(shot)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  نسخ وصف اللقطة
                </Button>
                <Button
                  onClick={() => copyToClipboard(shot.aiImagePrompt, 'برومبت الصورة')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  نسخ برومبت الصورة
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
