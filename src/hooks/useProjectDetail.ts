import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectDetail {
  id: string;
  topic: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  research_status: string | null;
  scripts_status: string | null;
  broll_status: string | null;
  prompts_status: string | null;
  article_status: string | null;
  simplify_status: string | null;
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

      setProject(data);
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

