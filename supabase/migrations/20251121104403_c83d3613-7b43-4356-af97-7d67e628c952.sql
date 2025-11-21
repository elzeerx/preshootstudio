-- Fix research_quality_score column to allow values 0-100
ALTER TABLE public.projects 
ALTER COLUMN research_quality_score TYPE NUMERIC(5,2);

ALTER TABLE public.research_history 
ALTER COLUMN quality_score TYPE NUMERIC(5,2);