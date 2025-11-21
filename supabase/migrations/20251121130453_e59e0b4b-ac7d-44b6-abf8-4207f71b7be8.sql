-- Create beta_invitations table for tracking invitation tokens
CREATE TABLE public.beta_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_id UUID NOT NULL REFERENCES public.beta_signups(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT token_unique UNIQUE(token)
);

-- Add index for fast token lookups
CREATE INDEX idx_beta_invitations_token ON public.beta_invitations(token);
CREATE INDEX idx_beta_invitations_signup_id ON public.beta_invitations(signup_id);

-- Enable RLS
ALTER TABLE public.beta_invitations ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage invitations
CREATE POLICY "Service role can manage invitations"
ON public.beta_invitations
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Allow authenticated users to view their own invitations
CREATE POLICY "Users can view their own invitations"
ON public.beta_invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.beta_signups
    WHERE beta_signups.id = beta_invitations.signup_id
  )
);

-- Add new columns to beta_signups for tracking workflow
ALTER TABLE public.beta_signups 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);