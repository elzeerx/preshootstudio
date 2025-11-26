import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, FileText, FileJson, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { LockedFeature } from "@/components/subscription/LockedFeature";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PreShootExportPack } from "@/lib/types/export";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  topic: string;
  research_status: string | null;
  scripts_status: string | null;
  broll_status: string | null;
  prompts_status: string | null;
  article_status: string | null;
}

interface ExportTabProps {
  project: Project;
}

export const ExportTab = ({ project }: ExportTabProps) => {
  const [exportPack, setExportPack] = useState<PreShootExportPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { limits } = useSubscription();
  const navigate = useNavigate();

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-accent-green" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'idle':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'ready':
        return 'جاهز';
      case 'error':
        return 'خطأ';
      case 'loading':
        return 'جاري التحميل';
      case 'idle':
        return 'لم يتم';
      default:
        return 'غير متوفر';
    }
  };

  const getStatusVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'ready':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleBuildExportPack = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('run-export', {
        body: { projectId: project.id },
      });

      if (invokeError) throw invokeError;

      setExportPack(data as PreShootExportPack);
      toast({
        title: "تم تجهيز الحزمة بنجاح",
        description: "حزمة PreShoot جاهزة الآن للتحميل والنسخ",
      });
    } catch (err: any) {
      console.error('Error building export pack:', err);
      setError(err.message || 'حدث خطأ أثناء بناء حزمة التصدير');
      toast({
        title: "حدث خطأ",
        description: err.message || 'حدث خطأ أثناء بناء حزمة التصدير',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!exportPack) return;
    
    navigator.clipboard.writeText(exportPack.markdown);
    toast({
      title: "تم النسخ",
      description: "تم نسخ Markdown إلى الحافظة",
    });
  };

  const handleDownloadMarkdown = () => {
    if (!exportPack) return;

    const blob = new Blob([exportPack.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preshoot-${project.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "تم التحميل",
      description: "تم تحميل ملف Markdown بنجاح",
    });
  };

  const handleDownloadJSON = () => {
    if (!exportPack) return;

    const blob = new Blob([JSON.stringify(exportPack, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preshoot-${project.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "تم التحميل",
      description: "تم تحميل ملف JSON بنجاح",
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Check if export is locked */}
      {!limits.canExport ? (
        <LockedFeature
          title="تصدير الملفات"
          description="تصدير حزمة PreShoot الكاملة متاح فقط في الخطط المدفوعة. قم بالترقية للحصول على إمكانية تصدير جميع مشاريعك."
          onUpgrade={() => navigate('/pricing')}
        />
      ) : (
        <>
          {/* Header */}
          <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="heading-3 mb-2">تصدير حزمة PreShoot</h3>
            <p className="body-text-secondary">
              من هنا تقدر تحمّل الحزمة الكاملة لمشروعك (JSON + Markdown).
            </p>
          </div>
        </div>
      </Card>

      {/* Status Overview */}
      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">حالة المخرجات</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(project.research_status)}
              <span className="body-text">البحث</span>
            </div>
            <Badge variant={getStatusVariant(project.research_status)}>
              {getStatusLabel(project.research_status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(project.scripts_status)}
              <span className="body-text">السكريبتات</span>
            </div>
            <Badge variant={getStatusVariant(project.scripts_status)}>
              {getStatusLabel(project.scripts_status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(project.broll_status)}
              <span className="body-text">B-Roll</span>
            </div>
            <Badge variant={getStatusVariant(project.broll_status)}>
              {getStatusLabel(project.broll_status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(project.prompts_status)}
              <span className="body-text">البرومبتات</span>
            </div>
            <Badge variant={getStatusVariant(project.prompts_status)}>
              {getStatusLabel(project.prompts_status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(project.article_status)}
              <span className="body-text">المقال</span>
            </div>
            <Badge variant={getStatusVariant(project.article_status)}>
              {getStatusLabel(project.article_status)}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          يفضّل تجهيز جميع الأجزاء قبل التصدير للحصول على حزمة متكاملة، لكن يمكنك التصدير حتى لو بعضها غير جاهز.
        </p>
      </Card>

      {/* Build Export Pack Button */}
      {!exportPack && (
        <Card className="p-6">
          <div className="text-center">
            <Button 
              onClick={handleBuildExportPack} 
              disabled={isLoading}
              size="lg"
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري بناء حزمة التصدير...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  تجهيز حزمة PreShoot
                </>
              )}
            </Button>
            {error && (
              <div className="mt-4">
                <p className="text-destructive mb-2">{error}</p>
                <Button onClick={handleBuildExportPack} variant="outline" size="sm">
                  إعادة المحاولة
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Export Pack Preview and Download */}
      {exportPack && (
        <>
          {/* Markdown Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5" />
                معاينة الحزمة (Markdown)
              </h4>
              <Button onClick={handleCopyMarkdown} variant="outline" size="sm" className="gap-2">
                <Copy className="w-4 h-4" />
                نسخ Markdown
              </Button>
            </div>
            <Textarea
              value={exportPack.markdown}
              readOnly
              className="font-mono text-sm min-h-[400px] resize-none"
              dir="rtl"
            />
          </Card>

          {/* Download Options */}
          <Card className="p-6">
            <h4 className="font-semibold text-foreground mb-4">خيارات التحميل</h4>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleDownloadMarkdown} variant="default" className="gap-2">
                <FileText className="w-5 h-5" />
                تحميل Markdown كملف
              </Button>
              <Button onClick={handleDownloadJSON} variant="secondary" className="gap-2">
                <FileJson className="w-5 h-5" />
                تحميل JSON كامل كملف
              </Button>
              <Button onClick={handleBuildExportPack} variant="ghost" className="gap-2">
                <Download className="w-5 h-5" />
                إعادة تجهيز الحزمة
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
