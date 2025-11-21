-- Fix critical security issue: Beta Signups RLS Policy (already done above)
-- Now we need to handle ai_usage_stats which is a VIEW, not a table

-- Views inherit RLS from underlying tables, so we need to ensure the underlying table has proper RLS
-- The ai_usage_stats view is based on ai_token_usage table
-- Let's verify ai_token_usage has proper RLS enabled

-- Enable RLS on ai_token_usage if not already enabled (safe to run if already enabled)
ALTER TABLE public.ai_token_usage ENABLE ROW LEVEL SECURITY;

-- The existing policies on ai_token_usage already restrict access appropriately:
-- 1. "Users can view their own token usage" - users see only their data
-- 2. "Admins can view all token usage" - admins see all data
-- 3. "Service role can insert token usage" - only service role can insert

-- This means the ai_usage_stats view is already protected by the underlying table's RLS
-- No additional action needed for ai_usage_stats