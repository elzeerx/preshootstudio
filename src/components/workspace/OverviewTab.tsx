import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface Project {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OverviewTabProps {
  project: Project;
}

export const OverviewTab = ({ project }: OverviewTabProps) => {
  return (
    <Card className="p-8" dir="rtl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3 text-right">نظرة عامة على المشروع</h3>
          <div className="space-y-4 body-text leading-relaxed text-right">
            <p>
              هذا هو الـ Workspace الخاص بالموضوع:{" "}
              <span className="font-semibold text-primary">{project.topic}</span>
            </p>
            <p>
              في المراحل القادمة، راح نضيف هنا ملخص شامل لكل ما يتم توليده من بحث 
              وسكريبتات ولقطات B-Roll وبرومبتات ومقالات.
            </p>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-2 text-foreground text-right">ما الذي يمكنك فعله هنا؟</h4>
              <ul className="space-y-2 text-sm text-muted-foreground text-right list-none">
                <li>• استكشاف التبويبات المختلفة أعلاه</li>
                <li>• كل تبويب يمثل مرحلة من مراحل إنتاج المحتوى</li>
                <li>• حالياً المحتوى تجريبي، والميزات الفعلية قادمة قريباً</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
