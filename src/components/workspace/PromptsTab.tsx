import { Card } from "@/components/ui/card";
import { Image } from "lucide-react";

interface Project {
  id: string;
  topic: string;
}

interface PromptsTabProps {
  project: Project;
}

export const PromptsTab = ({ project }: PromptsTabProps) => {
  return (
    <Card className="p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent-orange/20 flex items-center justify-center flex-shrink-0">
          <Image className="w-6 h-6 text-accent-orange" />
        </div>
        <div className="flex-1">
          <h3 className="heading-3 mb-3">برومبتات الصور والفيديو</h3>
          <div className="space-y-4 body-text leading-relaxed">
            <p>
              في هذا التبويب راح ننشئ حزمة برومبتات جاهزة لـ Midjourney، Gemini، 
              وأدوات الفيديو، على حسب الموضوع.
            </p>
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-foreground">أنواع البرومبتات المتوفرة:</h4>
              <div className="space-y-3">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h5 className="font-semibold mb-2 text-foreground">برومبتات لتوليد الصور</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• برومبتات Midjourney احترافية</li>
                    <li>• برومبتات DALL-E و Stable Diffusion</li>
                    <li>• برومبتات Gemini Image Generation</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <h5 className="font-semibold mb-2 text-foreground">برومبتات لتوليد الفيديو</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• برومبتات Runway ML</li>
                    <li>• برومبتات Pika Labs</li>
                    <li>• برومبتات لأدوات الفيديو الأخرى</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                <h5 className="font-semibold mb-2 text-foreground">مواصفات البرومبتات:</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• وصف دقيق ومفصّل للمشهد</li>
                  <li>• تحديد الأسلوب الفني (Art Style)</li>
                  <li>• الإضاءة والألوان المناسبة</li>
                  <li>• معايير الجودة (4K, Ultra HD, Cinematic)</li>
                  <li>• Negative Prompts (ما يجب تجنبه)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
