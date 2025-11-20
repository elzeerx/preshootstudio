import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResearchData } from "@/lib/types/research";
import { ScriptsData } from "@/lib/types/scripts";
import { BRollData } from "@/lib/types/broll";
import { PromptsData } from "@/lib/types/prompts";
import { ArticleData } from "@/lib/types/article";
import { SimplifyData } from "@/lib/types/simplify";

export interface ProjectDetail {
  id: string;
  topic: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  research_status: string | null;
  research_data?: ResearchData;
  research_summary?: string;
  scripts_status: string | null;
  scripts_data?: ScriptsData;
  broll_status: string | null;
  broll_data?: BRollData;
  prompts_status: string | null;
  prompts_data?: PromptsData;
  article_status: string | null;
  article_data?: ArticleData;
  simplify_status: string | null;
  simplify_data?: SimplifyData;
}

export const useProjectDetail = (projectId: string | undefined) => {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadProject = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotFound(true);
        setIsLoading(false);
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
        research_data: data.research_data as unknown as ResearchData | undefined,
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
      setIsLoading(false);
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
    error,
    notFound,
    refetch: projectId ? () => loadProject(projectId) : undefined,
  };
};

