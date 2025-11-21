import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Json } from "@/integrations/supabase/types";

interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  html_content: string;
  variables: string[];
}

export const EmailTemplateEditor = () => {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_name", "beta_invitation")
        .single();

      if (error) throw error;
      
      // Parse variables safely
      let parsedVariables: string[] = [];
      if (data.variables) {
        if (Array.isArray(data.variables)) {
          parsedVariables = data.variables.filter((v): v is string => typeof v === 'string');
        } else if (typeof data.variables === 'string') {
          try {
            const parsed = JSON.parse(data.variables);
            parsedVariables = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
          } catch {
            parsedVariables = [];
          }
        }
      }
      
      setTemplate({
        ...data,
        variables: parsedVariables,
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل القالب: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: template.subject,
          html_content: template.html_content,
        })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ القالب بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل حفظ القالب: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewHtml = () => {
    if (!template) return "";
    
    // Replace variables with sample data for preview
    return template.html_content
      .replace(/\{\{name\}\}/g, "أحمد محمد")
      .replace(/\{\{inviteLink\}\}/g, "https://example.com/accept-invite?token=sample-token");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  if (!template) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">لم يتم العثور على القالب</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>تخصيص قالب البريد الإلكتروني</CardTitle>
          <CardDescription>
            قم بتعديل قالب دعوة البيتا. المتغيرات المتاحة: {template.variables.map(v => `{{${v}}}`).join(", ")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">عنوان البريد</Label>
            <Input
              id="subject"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              placeholder="عنوان البريد الإلكتروني"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="html-content">محتوى HTML</Label>
            <Textarea
              id="html-content"
              value={template.html_content}
              onChange={(e) => setTemplate({ ...template, html_content: e.target.value })}
              placeholder="محتوى البريد الإلكتروني بصيغة HTML"
              className="min-h-[400px] font-mono text-sm"
              dir="ltr"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="ml-2 h-4 w-4" />
              {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="ml-2 h-4 w-4" />
              معاينة
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>معاينة البريد الإلكتروني</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-4 bg-background">
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-muted-foreground">الموضوع:</p>
              <p className="font-medium">{template.subject}</p>
            </div>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
