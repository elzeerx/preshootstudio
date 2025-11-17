-- Add B-Roll fields to projects table
ALTER TABLE public.projects
ADD COLUMN broll_status TEXT DEFAULT 'idle',
ADD COLUMN broll_last_run_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN broll_data JSONB;

COMMENT ON COLUMN public.projects.broll_status IS 'Status of B-Roll generation: idle, loading, ready, error';
COMMENT ON COLUMN public.projects.broll_last_run_at IS 'Timestamp of last B-Roll generation run';
COMMENT ON COLUMN public.projects.broll_data IS 'Generated B-Roll shots and tips data';