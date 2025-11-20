import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { History, Clock, RotateCcw, Sparkles } from "lucide-react";
import { useResearchHistory, ResearchVersion } from "@/hooks/useResearchHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/helpers/formatters";
import { getQualityLabel, getQualityVariant } from "@/lib/helpers/researchQuality";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface ResearchHistoryDialogProps {
  projectId: string;
  onRestore: () => void;
}

export const ResearchHistoryDialog = ({
  projectId,
  onRestore,
}: ResearchHistoryDialogProps) => {
  const { versions, isLoading, refetch } = useResearchHistory(projectId);
  const [isRestoring, setIsRestoring] = useState(false);
  const [open, setOpen] = useState(false);

  const handleRestore = async (version: ResearchVersion) => {
    try {
      setIsRestoring(true);

      const { error } = await supabase
        .from("projects")
        .update({
          research_data: version.research_data as any,
          research_summary: version.research_summary,
          research_quality_score: version.quality_score,
          research_quality_metrics: version.quality_metrics as any,
          research_manual_edits: null, // Clear manual edits when restoring
        })
        .eq("id", projectId);

      if (error) throw error;

      toast.success(`تم استرجاع الإصدار ${version.version_number}`);
      setOpen(false);
      onRestore();
    } catch (error) {
      console.error("Error restoring version:", error);
      toast.error("فشل استرجاع الإصدار");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 ml-2" />
          السجل
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">سجل البحث</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد إصدارات سابقة
              </div>
            ) : (
              versions.map((version, index) => (
                <div key={version.id}>
                  <div className="p-4 rounded-lg border border-border space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {index === 0 ? "الإصدار الحالي" : `إصدار ${version.version_number}`}
                        </Badge>
                        {version.quality_score && (
                          <Badge variant={getQualityVariant(version.quality_score)}>
                            <Sparkles className="w-3 h-3 ml-1" />
                            {getQualityLabel(version.quality_score)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatDate(version.created_at)}
                      </div>
                    </div>

                    <p className="text-sm text-right line-clamp-3">
                      {version.research_summary}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {version.research_data.sources?.length || 0} مصادر •{" "}
                        {version.research_data.keyPoints?.length || 0} نقاط رئيسية
                      </div>
                      {index !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(version)}
                          disabled={isRestoring}
                        >
                          <RotateCcw className="w-4 h-4 ml-2" />
                          استرجاع
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < versions.length - 1 && <Separator className="my-3" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
