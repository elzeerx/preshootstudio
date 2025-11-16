import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

interface Project {
  id: string;
  topic: string;
  status: string;
}

interface ResearchTabProps {
  project: Project;
}

export const ResearchTab = ({ project }: ResearchTabProps) => {
  return (
    <Card className="p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Search className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3">البحث عن الموضوع</h3>
          <div className="space-y-4 body-text leading-relaxed">
            <p>
              في هذا التبويب راح نعرض لاحقاً ملخص البحث، أهم النقاط، المصادر، 
              والترندات المتعلقة بالموضوع.
            </p>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="font-semibold text-primary">
                الموضوع الحالي: {project.topic}
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-foreground">ما سيتم إضافته لاحقاً:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">ملخص البحث</h5>
                  <p className="text-sm text-muted-foreground">معلومات شاملة من مصادر متعددة</p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">أهم النقاط</h5>
                  <p className="text-sm text-muted-foreground">النقاط الأساسية والمهمة</p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">المصادر</h5>
                  <p className="text-sm text-muted-foreground">روابط موثوقة ومراجع</p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">الترندات</h5>
                  <p className="text-sm text-muted-foreground">أحدث الاتجاهات والمواضيع الرائجة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
