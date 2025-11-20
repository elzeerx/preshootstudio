import { Card, CardContent } from "@/components/ui/card";
import { Rocket, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

interface ProjectStatsProps {
  stats: {
    total: number;
    new: number;
    processing: number;
    ready: number;
  };
}

export const ProjectStats = ({ stats }: ProjectStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-scale-in">
      <Card variant="subtle" className="hover:scale-105 transition-transform">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border-2 border-border bg-muted/30 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-foreground/70 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">إجمالي المشاريع</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="subtle" className="hover:scale-105 transition-transform">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border-2 border-border bg-muted/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-foreground/70 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.new}</p>
              <p className="text-xs text-muted-foreground">مشاريع جديدة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="subtle" className="hover:scale-105 transition-transform">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border-2 border-border bg-muted/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-foreground/70 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.processing}</p>
              <p className="text-xs text-muted-foreground">قيد التجهيز</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="subtle" className="hover:scale-105 transition-transform">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border-2 border-border bg-muted/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-foreground/70 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ready}</p>
              <p className="text-xs text-muted-foreground">مشاريع جاهزة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

