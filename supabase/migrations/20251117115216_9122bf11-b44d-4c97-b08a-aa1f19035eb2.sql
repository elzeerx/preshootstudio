-- Add article fields to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS article_status TEXT DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS article_last_run_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS article_data JSONB;

COMMENT ON COLUMN public.projects.article_status IS 'Status of article generation: idle, loading, ready, error';
COMMENT ON COLUMN public.projects.article_last_run_at IS 'Last time article generation was run';
COMMENT ON COLUMN public.projects.article_data IS 'Generated article data including title, sections, and SEO metadata';