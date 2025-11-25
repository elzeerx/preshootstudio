-- Fix foreign key constraint on research_history to allow user deletion
-- Drop existing constraint
ALTER TABLE research_history 
DROP CONSTRAINT IF EXISTS research_history_created_by_fkey;

-- Add new constraint with ON DELETE SET NULL
ALTER TABLE research_history
ADD CONSTRAINT research_history_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;