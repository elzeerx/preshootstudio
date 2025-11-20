import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface TokenUsageData {
  userId: string;
  projectId?: string;
  functionName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  modelUsed: string;
  requestStatus: 'success' | 'error' | 'rate_limited' | 'payment_required';
  errorMessage?: string;
}

export async function trackTokenUsage(
  supabaseUrl: string,
  supabaseKey: string,
  data: TokenUsageData
): Promise<void> {
  try {
    // Create a service role client for inserting token usage
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Estimate cost based on Gemini 2.5 Flash pricing
    // Gemini 2.5 Flash: $0.075 per 1M input tokens, $0.30 per 1M output tokens
    const estimatedCost = 
      (data.promptTokens * 0.075 / 1000000) +
      (data.completionTokens * 0.30 / 1000000);

    const { error } = await supabase
      .from('ai_token_usage')
      .insert({
        user_id: data.userId,
        project_id: data.projectId,
        function_name: data.functionName,
        prompt_tokens: data.promptTokens,
        completion_tokens: data.completionTokens,
        total_tokens: data.totalTokens,
        model_used: data.modelUsed,
        request_status: data.requestStatus,
        error_message: data.errorMessage,
        estimated_cost_usd: estimatedCost,
      });

    if (error) {
      console.error('Error tracking token usage:', error);
    }
  } catch (error) {
    console.error('Failed to track token usage:', error);
  }
}
