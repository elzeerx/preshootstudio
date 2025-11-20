-- Recreate the view without security definer properties
drop view if exists public.ai_usage_stats;

create view public.ai_usage_stats 
with (security_invoker = true) as
select
  user_id,
  function_name,
  model_used,
  date_trunc('day', created_at) as usage_date,
  count(*) as request_count,
  sum(prompt_tokens) as total_prompt_tokens,
  sum(completion_tokens) as total_completion_tokens,
  sum(total_tokens) as total_tokens,
  sum(estimated_cost_usd) as total_cost_usd,
  count(case when request_status = 'success' then 1 end) as successful_requests,
  count(case when request_status = 'error' then 1 end) as failed_requests,
  count(case when request_status = 'rate_limited' then 1 end) as rate_limited_requests
from public.ai_token_usage
group by user_id, function_name, model_used, date_trunc('day', created_at);