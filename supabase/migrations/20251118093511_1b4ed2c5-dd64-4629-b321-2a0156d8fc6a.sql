-- Add simplify fields to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS simplify_status TEXT DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS simplify_last_run_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS simplify_data JSONB;