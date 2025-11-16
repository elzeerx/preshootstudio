import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface Project {
  id: string;
  topic: string;
}

interface ScriptsTabProps {
  project: Project;
}

export const ScriptsTab = ({ project }: ScriptsTabProps) => {
  return (
    <Card className="p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3">سكريبتات التصوير</h3>
          <div className="space-y-4 body-text leading-relaxed">
            <p>
              هنا راح يتم توليد سكريبتات متنوعة حسب نوع المحتوى والمنصة المستهدفة.
            </p>
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-foreground">أنواع السكريبتات المتوفرة:</h4>
              <div className="space-y-3">
                <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
                  <h5 className="font-semibold mb-1 text-foreground">• سكريبت مخصص لوضع التلقين (Teleprompter)</h5>
                  <p className="text-sm text-muted-foreground">
                    نص كامل جاهز للقراءة المباشرة أمام الكاميرا، مع علامات التوقف والتنفس
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-secondary/20 rounded-lg bg-secondary/5">
                  <h5 className="font-semibold mb-1 text-foreground">• سكريبت مختصر للريلز</h5>
                  <p className="text-sm text-muted-foreground">
                    نص قصير ومشوّق (30-60 ثانية) مناسب لإنستقرام وتيك توك
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-accent-green/20 rounded-lg bg-accent-green/5">
                  <h5 className="font-semibold mb-1 text-foreground">• سكريبت مفصّل لفيديو طويل على يوتيوب</h5>
                  <p className="text-sm text-muted-foreground">
                    سكريبت شامل مع مقدمة، محتوى رئيسي مقسّم لأقسام، وخاتمة مع CTA
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border mt-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">تنويه:</strong> هذه السكريبتات راح تتولد 
                لاحقاً باستخدام نماذج GPT و Claude المتقدمة، مع مراعاة أسلوب المحتوى 
                والجمهور المستهدف.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
