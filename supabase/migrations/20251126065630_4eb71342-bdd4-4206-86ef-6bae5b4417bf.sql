-- Add content type classification to projects
ALTER TABLE public.projects 
  ADD COLUMN content_type TEXT DEFAULT 'factual',
  ADD COLUMN creative_data JSONB;

-- Add check constraint for valid content types
ALTER TABLE public.projects
  ADD CONSTRAINT valid_content_type 
  CHECK (content_type IN ('factual', 'creative', 'personal', 'opinion'));

-- Add comment for documentation
COMMENT ON COLUMN public.projects.content_type IS 'Type of content: factual (research-based), creative (entertainment), personal (lifestyle/stories), opinion (commentary)';
COMMENT ON COLUMN public.projects.creative_data IS 'Additional data for non-factual content types (angles, hooks, story beats, etc.)';