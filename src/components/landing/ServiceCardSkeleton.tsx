import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ServiceCardSkeleton = () => {
  return (
    <Card variant="glass" className="p-6 md:p-8">
      <div className="flex flex-col items-end text-right space-y-4">
        <Skeleton className="w-16 h-16 rounded border-4 border-foreground/20 bg-white/10" />
        <Skeleton className="h-8 w-3/4 bg-white/10" />
        <Skeleton className="h-20 w-full bg-white/10" />
      </div>
    </Card>
  );
};
