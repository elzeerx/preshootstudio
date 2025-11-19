import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FAQSectionSkeleton = () => {
  return (
    <Card variant="glass" className="p-8 md:p-12 border-4 border-white/20">
      <div className="w-full space-y-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="border-b-4 border-border/20 pb-4">
            <Skeleton className="h-7 w-3/4 mb-4 bg-white/10 ml-auto" />
            <Skeleton className="h-20 w-full bg-white/10" />
          </div>
        ))}
      </div>
    </Card>
  );
};
