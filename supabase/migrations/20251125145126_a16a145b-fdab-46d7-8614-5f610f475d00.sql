-- Create project_moderation table for content monitoring
CREATE TABLE IF NOT EXISTS public.project_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  moderated_by UUID REFERENCES auth.users(id),
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected')),
  content_flags TEXT[] DEFAULT '{}',
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  training_eligible BOOLEAN DEFAULT false,
  training_tags TEXT[] DEFAULT '{}',
  notes TEXT,
  moderated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create training_data_exports table for export audit trail
CREATE TABLE IF NOT EXISTS public.training_data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exported_by UUID REFERENCES auth.users(id) NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('full', 'research_only', 'scripts_only', 'curated', 'prompts_only', 'broll_only')),
  project_count INTEGER,
  total_tokens BIGINT,
  file_format TEXT CHECK (file_format IN ('jsonl', 'csv', 'json')),
  storage_path TEXT,
  filters_applied JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.project_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_data_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can view all projects
CREATE POLICY "Admins can view all projects"
ON public.projects
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Admins can manage all project moderation records
CREATE POLICY "Admins can manage project moderation"
ON public.project_moderation
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Admins can view all export records
CREATE POLICY "Admins can view training exports"
ON public.training_data_exports
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Admins can create export records
CREATE POLICY "Admins can create training exports"
ON public.training_data_exports
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on project_moderation
CREATE TRIGGER update_project_moderation_updated_at
BEFORE UPDATE ON public.project_moderation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_project_moderation_project_id ON public.project_moderation(project_id);
CREATE INDEX IF NOT EXISTS idx_project_moderation_status ON public.project_moderation(moderation_status);
CREATE INDEX IF NOT EXISTS idx_project_moderation_training_eligible ON public.project_moderation(training_eligible);
CREATE INDEX IF NOT EXISTS idx_training_exports_exported_by ON public.training_data_exports(exported_by);