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
        <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center hover:border-accent transition-colors">
          <Icon className="w-8 h-8 text-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground">{title}</h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
};
