import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, Save, Plus, Languages } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Json } from "@/integrations/supabase/types";
import DOMPurify from "dompurify";

interface EmailTemplate {
  id: string;
  template_name: string;
  language: string;
  subject: string;
  html_content: string;
  variables: string[];
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
];

export const EmailTemplateEditor = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const template = templates.find(t => t.language === selectedLanguage);
    setCurrentTemplate(template || null);
  }, [selectedLanguage, templates]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_name", "beta_invitation");

      if (error) throw error;
      
      const parsedTemplates = data.map(template => {
        let parsedVariables: string[] = [];
        if (template.variables) {
          if (Array.isArray(template.variables)) {
            parsedVariables = template.variables.filter((v): v is string => typeof v === 'string');
          } else if (typeof template.variables === 'string') {
            try {
              const parsed = JSON.parse(template.variables);
              parsedVariables = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
            } catch {
              parsedVariables = [];
            }
          }
        }
        
        return {
          ...template,
          variables: parsedVariables,
        };
      });
      
      setTemplates(parsedTemplates);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل تحميل القوالب: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTemplate) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: currentTemplate.subject,
          html_content: currentTemplate.html_content,
        })
        .eq("id", currentTemplate.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ القالب بنجاح",
      });
      
      await loadTemplates();
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

  const handleCreateTemplate = async (language: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .insert({
          template_name: "beta_invitation",
          language,
          subject: "",
          html_content: "",
          variables: ["name", "inviteLink"],
        });

      if (error) throw error;

      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء القالب الجديد بنجاح",
      });
      
      await loadTemplates();
      setSelectedLanguage(language);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء القالب: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewHtml = () => {
    if (!currentTemplate) return "";
    
    const sampleName = currentTemplate.language === 'ar' ? "أحمد محمد" : "John Doe";
    const htmlContent = currentTemplate.html_content
      .replace(/\{\{name\}\}/g, sampleName)
      .replace(/\{\{inviteLink\}\}/g, "https://example.com/accept-invite?token=sample-token");
    
    // Sanitize HTML to prevent XSS attacks
    return DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'table', 'tr', 'td', 'th', 'tbody', 'thead'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel']
    });
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

  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    lang => !templates.find(t => t.language === lang.code)
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                تخصيص قالب البريد الإلكتروني
              </CardTitle>
              <CardDescription>
                قم بتعديل قوالب دعوة البيتا بلغات مختلفة
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="language">اللغة</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {availableLanguages.length > 0 && (
              <div className="pt-6">
                <Select onValueChange={handleCreateTemplate}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="إضافة لغة جديدة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {currentTemplate ? (
            <>
              <div className="space-y-2">
                <Label>المتغيرات المتاحة</Label>
                <p className="text-sm text-muted-foreground">
                  {currentTemplate.variables.map(v => `{{${v}}}`).join(", ")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">عنوان البريد</Label>
                <Input
                  id="subject"
                  value={currentTemplate.subject}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                  placeholder="عنوان البريد الإلكتروني"
                  dir={currentTemplate.language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="html-content">محتوى HTML</Label>
                <Textarea
                  id="html-content"
                  value={currentTemplate.html_content}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, html_content: e.target.value })}
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
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد قالب لهذه اللغة. استخدم القائمة أعلاه لإنشاء قالب جديد.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>معاينة البريد الإلكتروني</DialogTitle>
          </DialogHeader>
          {currentTemplate && (
            <div className="border rounded-lg p-4 bg-background">
              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-muted-foreground">الموضوع:</p>
                <p className="font-medium" dir={currentTemplate.language === 'ar' ? 'rtl' : 'ltr'}>
                  {currentTemplate.subject}
                </p>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
