import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  gradient?: string;
  className?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  badge,
  gradient = "from-primary/20 to-accent/20",
  className = "",
}: FeatureCardProps) => {
  return (
    <Card className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-border/50 hover:border-primary/50 ${className}`}>
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Badge */}
      {badge && (
        <Badge className="absolute top-4 left-4 z-10 bg-primary/90 text-primary-foreground">
          {badge}
        </Badge>
      )}

      {/* Content */}
      <div className="relative p-8">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
          <Icon className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Hover indicator */}
        <div className="mt-6 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-sm font-medium">اكتشف المزيد</span>
          <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-lg border-2 border-primary/50 animate-pulse-glow" />
      </div>
    </Card>
  );
};
