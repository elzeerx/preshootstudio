import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Project {
  id: string;
  topic: string;
}

interface ExportTabProps {
  project: Project;
}

export const ExportTab = ({ project }: ExportTabProps) => {
  return (
    <Card className="p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-secondary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3">تصدير حزمة PreShoot</h3>
          <div className="space-y-4 body-text leading-relaxed">
            <p>
              من هنا راح تقدر مستقبلاً تصدّر كل شيء في حزمة واحدة: 
              البحث، السكريبتات، الـ B-Roll، البرومبتات، والمقال.
            </p>
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-foreground">صيغ التصدير المتوفرة:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h5 className="font-semibold mb-2 text-foreground">📄 ملف PDF شامل</h5>
                  <p className="text-sm text-muted-foreground">
                    حزمة كاملة بتنسيق احترافي جاهز للطباعة
                  </p>
                </div>
                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <h5 className="font-semibold mb-2 text-foreground">📝 ملفات Word منفصلة</h5>
                  <p className="text-sm text-muted-foreground">
                    كل قسم في ملف منفصل قابل للتعديل
                  </p>
                </div>
                <div className="p-4 bg-accent-green/5 rounded-lg border border-accent-green/20">
                  <h5 className="font-semibold mb-2 text-foreground">💾 ملف JSON</h5>
                  <p className="text-sm text-muted-foreground">
                    البيانات الخام للاستخدام في تطبيقات أخرى
                  </p>
                </div>
                <div className="p-4 bg-accent-orange/5 rounded-lg border border-accent-orange/20">
                  <h5 className="font-semibold mb-2 text-foreground">📦 حزمة ZIP كاملة</h5>
                  <p className="text-sm text-muted-foreground">
                    جميع الملفات والبرومبتات في أرشيف واحد
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-6 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30 text-center">
              <p className="body-text-secondary mb-4">
                ميزة التصدير ستكون متاحة بعد اكتمال توليد المحتوى في جميع التبويبات
              </p>
              <Button disabled size="lg" className="gap-2">
                <Download className="w-5 h-5" />
                التصدير غير متاح في هذه النسخة التجريبية
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                قريباً ستتمكن من تصدير جميع محتويات المشروع بضغطة زر واحدة
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
