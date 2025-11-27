-- Create table for tracking beta signup rate limits
CREATE TABLE IF NOT EXISTS public.beta_signup_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for fast IP lookups
CREATE INDEX IF NOT EXISTS idx_beta_signup_rate_limits_ip ON public.beta_signup_rate_limits(ip_address);

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_beta_signup_rate_limits_window ON public.beta_signup_rate_limits(window_start);

-- Enable RLS
ALTER TABLE public.beta_signup_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies needed - this table is managed only by service role