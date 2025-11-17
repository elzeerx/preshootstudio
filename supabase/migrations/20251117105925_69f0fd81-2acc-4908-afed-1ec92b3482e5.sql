-- Add prompts fields to projects table
ALTER TABLE public.projects
ADD COLUMN prompts_status TEXT DEFAULT 'idle',
ADD COLUMN prompts_last_run_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN prompts_data JSONB;

COMMENT ON COLUMN public.projects.prompts_status IS 'Status of prompts generation: idle, loading, ready, error';
COMMENT ON COLUMN public.projects.prompts_last_run_at IS 'Last time prompts were generated';
COMMENT ON COLUMN public.projects.prompts_data IS 'Generated prompts data for images, videos, and thumbnails';