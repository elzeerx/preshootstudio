import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SubscriptionLimits {
  tier: string;
  canCreateProject: boolean;
  canExport: boolean;
  projectsUsed: number;
  projectLimit: number;
  redoLimit: number;
  tokensUsed: number;
  tokenLimit: number;
}

export async function getUserSubscriptionLimits(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string
): Promise<SubscriptionLimits> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get user's profile for tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  const tier = profile?.subscription_tier || 'free';

  // Get subscription details
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  // Default to free plan
  const plan = subscription?.plan || {
    project_limit_monthly: 5,
    token_limit_monthly: 50000,
    redo_limit_per_tab: 1,
    export_enabled: false,
  };

  // Get monthly project count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: projectsUsed } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  // Get token usage
  const { data: tokenUsage } = await supabase
    .rpc('get_user_monthly_token_usage', { user_id_param: userId });

  return {
    tier,
    canCreateProject: !plan.project_limit_monthly || (projectsUsed || 0) < plan.project_limit_monthly,
    canExport: plan.export_enabled,
    projectsUsed: projectsUsed || 0,
    projectLimit: plan.project_limit_monthly || 999,
    redoLimit: plan.redo_limit_per_tab,
    tokensUsed: tokenUsage?.[0]?.total_tokens || 0,
    tokenLimit: plan.token_limit_monthly,
  };
}

export async function checkRedoLimit(
  supabaseUrl: string,
  supabaseKey: string,
  projectId: string,
  tabName: string
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get project with run count
  const columnMap: Record<string, string> = {
    research: 'research_run_count',
    scripts: 'scripts_run_count',
    broll: 'broll_run_count',
    prompts: 'prompts_run_count',
    article: 'article_run_count',
    simplify: 'simplify_run_count',
  };

  const column = columnMap[tabName];
  if (!column) {
    throw new Error(`Invalid tab name: ${tabName}`);
  }

  const { data: project } = await supabase
    .from('projects')
    .select(`${column}, user_id`)
    .eq('id', projectId)
    .single();

  if (!project) {
    throw new Error('Project not found');
  }

  const currentRunCount = (project as any)[column] || 0;

  // Get user's subscription limits
  const limits = await getUserSubscriptionLimits(supabaseUrl, supabaseKey, (project as any).user_id);

  // First run (0) + redo limit
  const allowed = currentRunCount <= limits.redoLimit;

  return {
    allowed,
    current: currentRunCount,
    limit: limits.redoLimit + 1, // +1 for initial run
  };
}

export async function incrementRunCount(
  supabaseUrl: string,
  supabaseKey: string,
  projectId: string,
  tabName: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const columnMap: Record<string, string> = {
    research: 'research_run_count',
    scripts: 'scripts_run_count',
    broll: 'broll_run_count',
    prompts: 'prompts_run_count',
    article: 'article_run_count',
    simplify: 'simplify_run_count',
  };

  const column = columnMap[tabName];
  if (!column) {
    throw new Error(`Invalid tab name: ${tabName}`);
  }

  // Get current count
  const { data: project } = await supabase
    .from('projects')
    .select(column)
    .eq('id', projectId)
    .single();

  const currentCount = (project as any)?.[column] || 0;

  // Increment
  await supabase
    .from('projects')
    .update({ [column]: currentCount + 1 })
    .eq('id', projectId);
}
