-- =====================================================
-- PHASE 5: Research Enhancement Tables
-- =====================================================

-- 5.1 Research History/Versioning Table
CREATE TABLE public.research_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  research_data JSONB NOT NULL,
  research_summary TEXT,
  quality_score NUMERIC(3,2) CHECK (quality_score >= 0 AND quality_score <= 100),
  quality_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index for faster lookups
CREATE INDEX idx_research_history_project ON public.research_history(project_id, version_number DESC);

-- Enable RLS
ALTER TABLE public.research_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for research_history
CREATE POLICY "Users can view their own research history"
ON public.research_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = research_history.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert research history for their projects"
ON public.research_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = research_history.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own research history"
ON public.research_history
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = research_history.project_id
    AND projects.user_id = auth.uid()
  )
);

-- 5.4 Smart Cache Table for Tavily Searches
CREATE TABLE public.tavily_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_hash TEXT NOT NULL UNIQUE,
  query_text TEXT NOT NULL,
  search_results JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for cache lookups
CREATE INDEX idx_tavily_cache_hash ON public.tavily_cache(query_hash);
CREATE INDEX idx_tavily_cache_expiry ON public.tavily_cache(expires_at);

-- Enable RLS (cache is shared across users for efficiency)
ALTER TABLE public.tavily_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Allow authenticated users to read cache
CREATE POLICY "Authenticated users can read cache"
ON public.tavily_cache
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policy - Only system can insert/update cache (via service role)
CREATE POLICY "Service role can manage cache"
ON public.tavily_cache
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.tavily_cache
  WHERE expires_at < now();
END;
$$;

-- Add manual_edits field to projects table to track manual research edits
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS research_manual_edits JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS research_quality_score NUMERIC(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS research_quality_metrics JSONB DEFAULT NULL;