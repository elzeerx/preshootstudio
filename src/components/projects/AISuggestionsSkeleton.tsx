import { Skeleton } from "@/components/ui/skeleton";

export const AISuggestionsSkeleton = () => {
  return (
    <div className="space-y-3 animate-fade-in">
      <Skeleton className="h-4 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="h-auto min-h-[60px] w-full px-4 py-3 rounded-md border border-border bg-card animate-pulse"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};
