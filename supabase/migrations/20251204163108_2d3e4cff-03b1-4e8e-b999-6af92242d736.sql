-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_all_users_token_usage();

-- Recreate with new return type including bonus tokens and plan info
CREATE OR REPLACE FUNCTION public.get_all_users_token_usage()
RETURNS TABLE(
  user_id uuid, 
  email text, 
  full_name text, 
  monthly_token_limit integer, 
  alert_threshold_percentage integer, 
  limit_notifications_enabled boolean, 
  total_tokens bigint, 
  total_cost numeric, 
  request_count bigint,
  bonus_tokens integer,
  plan_name text,
  plan_token_limit integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    COUNT(atu.id)::BIGINT as request_count,
    COALESCE(p.bonus_tokens, 0) as bonus_tokens,
    COALESCE(sp.name, 'Free') as plan_name,
    COALESCE(sp.token_limit_monthly, 50000) as plan_token_limit
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON s.user_id = p.id AND s.status = 'active'
  LEFT JOIN public.subscription_plans sp ON sp.id = s.plan_id
  LEFT JOIN public.ai_token_usage atu 
    ON atu.user_id = p.id 
    AND atu.created_at >= date_trunc('month', CURRENT_TIMESTAMP)
  GROUP BY p.id, p.email, p.full_name, p.monthly_token_limit, 
           p.alert_threshold_percentage, p.limit_notifications_enabled,
           p.bonus_tokens, sp.name, sp.token_limit_monthly
  ORDER BY p.email;
END;
$$;