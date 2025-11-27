-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can sign up for beta" ON public.beta_signups;

-- Create a new PERMISSIVE INSERT policy for anonymous and authenticated users
CREATE POLICY "Anyone can sign up for beta"
ON public.beta_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);