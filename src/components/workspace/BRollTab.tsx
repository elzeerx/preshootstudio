import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";

interface Project {
  id: string;
  topic: string;
}

interface BRollTabProps {
  project: Project;
}

export const BRollTab = ({ project }: BRollTabProps) => {
  return (
    <Card className="p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
          <Video className="w-6 h-6 text-accent-green" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3">خطة لقطات الـ B-Roll</h3>
          <div className="space-y-4 body-text leading-relaxed">
            <p>
              هنا راح نضيف لاحقاً قائمة باللقطات المقترحة، نوع اللقطة، 
              حركة الكاميرا، وبرومبتات لصور تمثّل المشاهد.
            </p>
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-foreground">ما سيتضمنه تبويب B-Roll:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">وصف اللقطة</h5>
                  <p className="text-sm text-muted-foreground">
                    شرح تفصيلي لكل لقطة B-Roll مقترحة
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">نوع اللقطة</h5>
                  <p className="text-sm text-muted-foreground">
                    Close-up, Wide Shot, Medium, Drone, إلخ
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">حركة الكاميرا</h5>
                  <p className="text-sm text-muted-foreground">
                    Pan, Tilt, Dolly, Static، وغيرها
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">التوقيت المقترح</h5>
                  <p className="text-sm text-muted-foreground">
                    متى تُستخدم هذه اللقطة في الفيديو
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">برومبتات الصور</h5>
                  <p className="text-sm text-muted-foreground">
                    برومبتات جاهزة لتوليد صور مرجعية للمشاهد
                  </p>
                </div>
                <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                  <h5 className="font-semibold mb-1 text-foreground">مصادر محتملة</h5>
                  <p className="text-sm text-muted-foreground">
                    Stock footage، تصوير مخصص، أو مصادر أخرى
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
