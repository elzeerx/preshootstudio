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
      variant="subtle"
      className={`p-6 md:p-8 hover:shadow-editorial-hover transition-all duration-300 hover:-translate-y-2 animate-stagger-${delay}`}
    >
      <div className="flex flex-col items-end text-right space-y-4">
        <div className="p-4 bg-accent text-accent-foreground rounded-lg">
          <Icon className="w-8 h-8 md:w-12 md:h-12" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground">{title}</h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
};
