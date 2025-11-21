-- Add token usage limits and settings to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS monthly_token_limit INTEGER DEFAULT 1000000,
ADD COLUMN IF NOT EXISTS alert_threshold_percentage INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS limit_notifications_enabled BOOLEAN DEFAULT true;

-- Create a function to get user's current month token usage
CREATE OR REPLACE FUNCTION public.get_user_monthly_token_usage(user_id_param UUID)
RETURNS TABLE (
  total_tokens BIGINT,
  total_cost NUMERIC,
  request_count BIGINT,
  limit_amount INTEGER,
  alert_threshold INTEGER,
  notifications_enabled BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(atu.total_tokens), 0)::BIGINT as total_tokens,
    COALESCE(SUM(atu.estimated_cost_usd), 0)::NUMERIC as total_cost,
    COUNT(*)::BIGINT as request_count,
    p.monthly_token_limit,
    p.alert_threshold_percentage,
    p.limit_notifications_enabled
  FROM public.profiles p
  LEFT JOIN public.ai_token_usage atu 
    ON atu.user_id = p.id 
    AND atu.created_at >= date_trunc('month', CURRENT_TIMESTAMP)
  WHERE p.id = user_id_param
  GROUP BY p.id, p.monthly_token_limit, p.alert_threshold_percentage, p.limit_notifications_enabled;
END;
$$;

-- Create a table for token limit alerts history
CREATE TABLE IF NOT EXISTS public.token_limit_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('warning', 'limit_reached', 'limit_exceeded')),
  token_usage BIGINT NOT NULL,
  token_limit INTEGER NOT NULL,
  usage_percentage NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on token_limit_alerts
ALTER TABLE public.token_limit_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for token_limit_alerts
CREATE POLICY "Users can view their own alerts"
ON public.token_limit_alerts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert alerts"
ON public.token_limit_alerts
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_token_limit_alerts_user_created 
ON public.token_limit_alerts(user_id, created_at DESC);