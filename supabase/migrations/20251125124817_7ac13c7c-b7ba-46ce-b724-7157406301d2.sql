-- Fix RLS policies for beta invitation workflow
-- This allows anonymous users to validate tokens without authentication

-- Drop existing policies on beta_signups that might conflict
DROP POLICY IF EXISTS "Only authenticated users can view signups" ON public.beta_signups;
DROP POLICY IF EXISTS "Users can view their own invitations" ON public.beta_invitations;

-- Allow anonymous users to SELECT from beta_signups (needed for token validation)
CREATE POLICY "Anyone can view beta signups for token validation"
  ON public.beta_signups
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role full access to beta_invitations (already exists, but ensuring it's correct)
DROP POLICY IF EXISTS "Service role can manage invitations" ON public.beta_invitations;
CREATE POLICY "Service role can manage invitations"
  ON public.beta_invitations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to update beta_signups when creating their account
CREATE POLICY "Users can update their own signup record"
  ON public.beta_signups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: The send-invitation-email edge function uses service role, so it can manage all tables
-- The validate-invitation edge function also uses service role to bypass RLS for token validation
-- The AcceptInvite page uses the edge function for validation, then authenticated requests for updates