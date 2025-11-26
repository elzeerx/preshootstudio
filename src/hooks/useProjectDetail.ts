import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResearchData } from "@/lib/types/research";
import { ScriptsData } from "@/lib/types/scripts";
import { BRollData } from "@/lib/types/broll";
import { PromptsData } from "@/lib/types/prompts";
import { ArticleData } from "@/lib/types/article";
import { SimplifyData } from "@/lib/types/simplify";
import { CreativeResearchData } from "@/lib/types/creativeResearch";

export interface QualityMetrics {
  sourceCount: number;
  sourceDiversity: number;
  recencyScore: number;
  overallScore: number;
}

export interface ProjectDetail {
  id: string;
  topic: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  content_type?: string;
  creative_data?: CreativeResearchData;
  research_status: string | null;
  research_data?: ResearchData;
  research_summary?: string;
  research_last_run_at?: string | null;
  research_quality_score?: number | null;
  research_quality_metrics?: QualityMetrics | null;
  research_manual_edits?: Record<string, boolean> | null;
  scripts_status: string | null;
  scripts_data?: ScriptsData;
  scripts_last_run_at?: string | null;
  broll_status: string | null;
  broll_data?: BRollData;
  broll_last_run_at?: string | null;
  prompts_status: string | null;
  prompts_data?: PromptsData;
  prompts_last_run_at?: string | null;
  article_status: string | null;
  article_data?: ArticleData;
  article_last_run_at?: string | null;
  simplify_status: string | null;
  simplify_data?: SimplifyData;
  simplify_last_run_at?: string | null;
}

export const useProjectDetail = (projectId: string | undefined) => {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadProject = async (id: string, isRefetch = false) => {
    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      setNotFound(false);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotFound(true);
        if (isRefetch) {
          setIsRefetching(false);
        } else {
          setIsLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data) {
        setNotFound(true);
        return;
      }

      setProject({
        ...data,
        content_type: data.content_type,
        creative_data: data.creative_data as unknown as CreativeResearchData | undefined,
        research_data: data.research_data as unknown as ResearchData | undefined,
        research_quality_metrics: data.research_quality_metrics as unknown as QualityMetrics | null | undefined,
        research_manual_edits: data.research_manual_edits as unknown as Record<string, boolean> | null | undefined,
        scripts_data: data.scripts_data as unknown as ScriptsData | undefined,
        broll_data: data.broll_data as unknown as BRollData | undefined,
        prompts_data: data.prompts_data as unknown as PromptsData | undefined,
        article_data: data.article_data as unknown as ArticleData | undefined,
        simplify_data: data.simplify_data as unknown as SimplifyData | undefined,
      });
    } catch (err) {
      console.error("Error loading project:", err);
      setError(err instanceof Error ? err : new Error("حدث خطأ غير متوقع"));
      setNotFound(true);
    } finally {
      if (isRefetch) {
        setIsRefetching(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    } else {
      setIsLoading(false);
      setNotFound(true);
    }
  }, [projectId]);

  return {
    project,
    isLoading,
    isRefetching,
    error,
    notFound,
    refetch: projectId ? () => loadProject(projectId, true) : undefined,
  };
};

