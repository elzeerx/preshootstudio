import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  updated_at: string;
  research_status: string | null;
  scripts_status: string | null;
  broll_status: string | null;
  article_status: string | null;
  prompts_status: string | null;
  simplify_status: string | null;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setProjects(data || []);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError(err instanceof Error ? err : new Error("حدث خطأ غير متوقع"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Calculate stats
  const stats = {
    total: projects.length,
    new: projects.filter(p => p.status === "new").length,
    processing: projects.filter(p => p.status === "processing").length,
    ready: projects.filter(p => p.status === "ready").length,
  };

  // Filter projects
  const filterProjects = (searchQuery: string, filterStatus: string) => {
    return projects.filter(project => {
      const matchesSearch = project.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || project.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  // Count completed features per project
  const getCompletedFeatures = (project: Project) => {
    const features = [
      project.research_status === "ready",
      project.simplify_status === "ready",
      project.scripts_status === "ready",
      project.broll_status === "ready",
      project.prompts_status === "ready",
      project.article_status === "ready",
    ];
    return features.filter(Boolean).length;
  };

  return {
    projects,
    isLoading,
    error,
    stats,
    filterProjects,
    getCompletedFeatures,
    refetch: loadProjects,
  };
};

