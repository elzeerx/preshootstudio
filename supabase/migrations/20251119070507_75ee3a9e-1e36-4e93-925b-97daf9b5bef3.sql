-- Create beta_signups table for early access requests
CREATE TABLE IF NOT EXISTS public.beta_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'notified'))
);

-- Enable Row Level Security
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to sign up for beta (public insert)
CREATE POLICY "Anyone can sign up for beta"
  ON public.beta_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users can view signups
CREATE POLICY "Only authenticated users can view signups"
  ON public.beta_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON public.beta_signups(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_beta_signups_created_at ON public.beta_signups(created_at DESC);