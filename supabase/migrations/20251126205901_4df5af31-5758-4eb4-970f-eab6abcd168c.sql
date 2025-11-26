-- Fix security issue: Remove public access to beta_signups table
-- The validate-invitation edge function uses service role and bypasses RLS,
-- so we don't need a public SELECT policy

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view beta signups for token validation" ON public.beta_signups;

-- Add restricted SELECT policies
-- Admins can view all beta signups
CREATE POLICY "Admins can view all beta signups"
ON public.beta_signups
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own signup record (once they have a user_id)
CREATE POLICY "Users can view their own signup"
ON public.beta_signups
FOR SELECT
USING (auth.uid() = user_id);