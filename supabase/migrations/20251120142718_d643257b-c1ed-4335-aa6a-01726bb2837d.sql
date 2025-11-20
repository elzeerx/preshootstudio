-- Create AI token usage table
create table public.ai_token_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid references public.projects(id) on delete cascade,
  
  -- Edge function that made the request
  function_name text not null,
  
  -- Token usage metrics
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  
  -- Model information
  model_used text not null,
  
  -- Request metadata
  request_status text not null check (request_status in ('success', 'error', 'rate_limited', 'payment_required')),
  error_message text,
  
  -- Cost estimation (based on model pricing)
  estimated_cost_usd numeric(10, 6),
  
  -- Timestamps
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.ai_token_usage enable row level security;

-- Indexes for performance
create index idx_ai_token_usage_user_id on public.ai_token_usage(user_id);
create index idx_ai_token_usage_project_id on public.ai_token_usage(project_id);
create index idx_ai_token_usage_created_at on public.ai_token_usage(created_at desc);
create index idx_ai_token_usage_function_name on public.ai_token_usage(function_name);

-- RLS Policies
create policy "Admins can view all token usage"
  on public.ai_token_usage
  for select
  using (has_role(auth.uid(), 'admin'::app_role));

create policy "Users can view their own token usage"
  on public.ai_token_usage
  for select
  using (auth.uid() = user_id);

create policy "Service role can insert token usage"
  on public.ai_token_usage
  for insert
  with check ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create aggregated statistics view
create or replace view public.ai_usage_stats as
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

-- Enable realtime for live indicator
alter publication supabase_realtime add table public.ai_token_usage;