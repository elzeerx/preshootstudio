import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface Project {
  id: string;
  topic: string;
}

interface SimplifyTabProps {
  project: Project;
}

export const SimplifyTab = ({ project }: SimplifyTabProps) => {
  return (
    <Card className="p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-secondary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3">تبسيط الفكرة</h3>
          <div className="space-y-4 body-text leading-relaxed">
            <p>
              هنا راح نضيف لاحقاً تبسيط للموضوع بأسلوب يناسب الجمهور العام، 
              مع أمثلة وتشبيهات تسهّل الفهم.
            </p>
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-foreground">هدف التبسيط:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>تحويل المفاهيم المعقدة إلى شرح بسيط وواضح</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>استخدام أمثلة من الحياة اليومية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>تشبيهات تساعد على الفهم السريع</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>لغة عربية مبسطة وسلسة</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border mt-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">ملاحظة:</strong> التبسيط سيتم توليده 
                باستخدام نماذج الذكاء الاصطناعي المتقدمة لضمان وضوح الشرح ودقته.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
