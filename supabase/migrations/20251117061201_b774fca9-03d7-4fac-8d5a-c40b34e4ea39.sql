-- Add scripts fields to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS scripts_status TEXT DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS scripts_last_run_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scripts_data JSONB;

-- Add comment on columns
COMMENT ON COLUMN public.projects.scripts_status IS 'Status of scripts generation: idle, loading, ready, error';
COMMENT ON COLUMN public.projects.scripts_last_run_at IS 'Last time scripts were generated';
COMMENT ON COLUMN public.projects.scripts_data IS 'JSON containing teleprompter, reel, and long video scripts';