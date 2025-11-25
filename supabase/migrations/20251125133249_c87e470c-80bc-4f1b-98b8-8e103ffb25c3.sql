-- Update default token limit for new beta users from 1M to 100K
ALTER TABLE profiles 
ALTER COLUMN monthly_token_limit SET DEFAULT 100000;

-- Update existing beta users to standard beta limit (100K)
UPDATE profiles 
SET monthly_token_limit = 100000 
WHERE monthly_token_limit = 1000000;

-- Add RLS policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to update user token limits
CREATE POLICY "Admins can update user token limits"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create helper function to get all users' token usage for admin dashboard
CREATE OR REPLACE FUNCTION public.get_all_users_token_usage()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  monthly_token_limit integer,
  alert_threshold_percentage integer,
  limit_notifications_enabled boolean,
  total_tokens bigint,
  total_cost numeric,
  request_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.monthly_token_limit,
    p.alert_threshold_percentage,
    p.limit_notifications_enabled,
    COALESCE(SUM(atu.total_tokens), 0)::BIGINT as total_tokens,
    COALESCE(SUM(atu.estimated_cost_usd), 0)::NUMERIC as total_cost,
    COUNT(atu.id)::BIGINT as request_count
  FROM public.profiles p
  LEFT JOIN public.ai_token_usage atu 
    ON atu.user_id = p.id 
    AND atu.created_at >= date_trunc('month', CURRENT_TIMESTAMP)
  GROUP BY p.id, p.email, p.full_name, p.monthly_token_limit, 
           p.alert_threshold_percentage, p.limit_notifications_enabled
  ORDER BY p.email;
END;
$$;