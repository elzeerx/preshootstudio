import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResearchData } from "@/lib/types/research";
import { QualityMetrics } from "./useProjectDetail";

export interface ResearchVersion {
  id: string;
  project_id: string;
  version_number: number;
  research_data: ResearchData;
  research_summary: string | null;
  quality_score: number | null;
  quality_metrics: QualityMetrics | null;
  created_at: string;
  created_by: string | null;
}

export const useResearchHistory = (projectId: string | undefined) => {
  const [versions, setVersions] = useState<ResearchVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("research_history")
        .select("*")
        .eq("project_id", id)
        .order("version_number", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setVersions(
        (data || []).map((v) => ({
          ...v,
          research_data: v.research_data as unknown as ResearchData,
          quality_metrics: v.quality_metrics as unknown as QualityMetrics | null,
        }))
      );
    } catch (err) {
      console.error("Error loading research history:", err);
      setError(err instanceof Error ? err : new Error("حدث خطأ غير متوقع"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadHistory(projectId);
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  return {
    versions,
    isLoading,
    error,
    refetch: projectId ? () => loadHistory(projectId) : undefined,
  };
};
