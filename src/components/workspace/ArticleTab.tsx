import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface Project {
  id: string;
  topic: string;
}

interface ArticleTabProps {
  project: Project;
}

export const ArticleTab = ({ project }: ArticleTabProps) => {
  return (
    <Card className="p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3">مقال جاهز للنشر</h3>
          <div className="space-y-4 body-text leading-relaxed">
            <p>
              هنا راح يتم توليد مقال صحفي أو تدوينة احترافية مبنية على نفس الموضوع، 
              محسّنة لمحركات البحث (SEO).
            </p>
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-foreground">مميزات المقال:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">عنوان جذاب</h5>
                  <p className="text-sm text-muted-foreground">
                    عنوان محسّن لـ SEO مع الكلمات المفتاحية
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">مقدمة مشوّقة</h5>
                  <p className="text-sm text-muted-foreground">
                    مقدمة تجذب القارئ وتحفّزه على المتابعة
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">عناوين فرعية منظمة</h5>
                  <p className="text-sm text-muted-foreground">
                    تقسيم منطقي مع H2 و H3 محسّنة
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">محتوى قيّم</h5>
                  <p className="text-sm text-muted-foreground">
                    معلومات دقيقة ومفيدة للقراء
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">خاتمة مع CTA</h5>
                  <p className="text-sm text-muted-foreground">
                    خاتمة احترافية مع دعوة لاتخاذ إجراء
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">Meta Description</h5>
                  <p className="text-sm text-muted-foreground">
                    وصف محسّن لمحركات البحث
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-accent-green/5 rounded-lg border border-accent-green/20 mt-6">
              <p className="text-sm">
                <strong className="text-foreground">ملاحظة:</strong>{" "}
                <span className="text-muted-foreground">
                  المقال سيكون جاهز للنشر مباشرة على مدونتك أو موقعك، 
                  مع مراعاة أفضل ممارسات الـ SEO والكتابة الاحترافية.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
