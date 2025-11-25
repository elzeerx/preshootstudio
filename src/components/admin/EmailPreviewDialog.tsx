import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signupName: string;
  signupEmail: string;
  language?: string;
}

export const EmailPreviewDialog = ({
  open,
  onOpenChange,
  signupName,
  signupEmail,
  language = "ar",
}: EmailPreviewDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailHtml, setEmailHtml] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");

  useEffect(() => {
    if (open) {
      loadEmailPreview();
    }
  }, [open, signupName, signupEmail, language]);

  const loadEmailPreview = async () => {
    setLoading(true);
    try {
      // Fetch the email template
      const { data: template, error: templateError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_name", "beta_invitation")
        .eq("language", language)
        .single();

      if (templateError || !template) {
        throw new Error("Email template not found");
      }

      // Generate a sample invitation link (just for preview)
      const sampleToken = "sample-preview-token-123";
      const inviteUrl = `${window.location.origin}/accept-invite?token=${sampleToken}`;

      // Replace placeholders with actual data
      let processedHtml = template.html_content
        .replace(/{{name}}/g, signupName)
        .replace(/{{email}}/g, signupEmail)
        .replace(/{{invite_url}}/g, inviteUrl)
        .replace(/{{app_name}}/g, "PreShoot Studio")
        .replace(/{{year}}/g, new Date().getFullYear().toString());

      let processedSubject = template.subject
        .replace(/{{name}}/g, signupName)
        .replace(/{{app_name}}/g, "PreShoot Studio");

      setEmailHtml(processedHtml);
      setEmailSubject(processedSubject);
    } catch (error) {
      console.error("Error loading email preview:", error);
      toast({
        title: "خطأ في تحميل المعاينة",
        description: "حدث خطأ أثناء تحميل معاينة البريد الإلكتروني",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Eye className="w-6 h-6 text-accent" />
            معاينة البريد الإلكتروني
          </DialogTitle>
          <DialogDescription>
            هذه معاينة للبريد الإلكتروني الذي سيتم إرساله إلى {signupName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Email Metadata */}
            <div className="mb-4 p-4 bg-muted/30 rounded-lg border-2 border-border space-y-2">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">إلى:</p>
                  <p className="text-sm text-foreground font-mono truncate">
                    {signupEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">الموضوع:</p>
                  <p className="text-sm text-foreground">{emailSubject}</p>
                </div>
              </div>
            </div>

            {/* Email Preview */}
            <div className="border-2 border-border rounded-lg bg-white overflow-hidden">
              <div className="p-2 bg-muted/50 border-b-2 border-border">
                <p className="text-xs text-muted-foreground font-mono">
                  معاينة البريد الإلكتروني - Email Preview
                </p>
              </div>
              <div
                className="p-6 overflow-auto"
                style={{ maxHeight: "500px" }}
                dangerouslySetInnerHTML={{ __html: emailHtml }}
              />
            </div>

            {/* Preview Notice */}
            <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-foreground">
                <strong>ملاحظة:</strong> هذه معاينة فقط. رابط الدعوة المعروض هنا
                ليس حقيقياً. سيتم إنشاء رابط فريد عند إرسال الدعوة الفعلية.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
