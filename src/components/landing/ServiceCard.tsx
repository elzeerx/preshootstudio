import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const ServiceCard = ({ icon: Icon, title, description, delay = 0 }: ServiceCardProps) => {
  return (
    <Card
      variant="glass"
      className={`p-6 md:p-8 animate-stagger-${delay}`}
    >
      <div className="flex flex-col items-end text-right space-y-4">
        <div className="w-16 h-16 rounded border-4 border-foreground/20 flex items-center justify-center hover:border-button-primary transition-colors">
          <Icon className="w-8 h-8 text-foreground" strokeWidth={3} />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-foreground">{title}</h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-bold">
          {description}
        </p>
      </div>
    </Card>
  );
};
