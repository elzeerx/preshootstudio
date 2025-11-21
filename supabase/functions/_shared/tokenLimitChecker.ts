import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface TokenLimitCheck {
  canProceed: boolean;
  currentUsage: number;
  limit: number;
  usagePercentage: number;
  shouldAlert: boolean;
  alertType?: 'warning' | 'limit_reached' | 'limit_exceeded';
  message?: string;
}

export async function checkTokenLimit(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  estimatedTokens: number = 0
): Promise<TokenLimitCheck> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's current usage and limits
    const { data, error } = await supabase
      .rpc('get_user_monthly_token_usage', { user_id_param: userId });

    if (error || !data || data.length === 0) {
      console.error('Error fetching token usage:', error);
      // Default to allowing if we can't check
      return {
        canProceed: true,
        currentUsage: 0,
        limit: 1000000,
        usagePercentage: 0,
        shouldAlert: false,
      };
    }

    const usage = data[0];
    const currentUsage = Number(usage.total_tokens) + estimatedTokens;
    const limit = usage.limit_amount || 1000000;
    const alertThreshold = usage.alert_threshold || 80;
    const notificationsEnabled = usage.notifications_enabled !== false;

    const usagePercentage = (currentUsage / limit) * 100;

    let shouldAlert = false;
    let alertType: 'warning' | 'limit_reached' | 'limit_exceeded' | undefined;
    let message: string | undefined;

    // Check if we should create an alert
    if (notificationsEnabled) {
      if (usagePercentage >= 100) {
        shouldAlert = true;
        alertType = 'limit_exceeded';
        message = `تم تجاوز حد الاستخدام الشهري (${usagePercentage.toFixed(1)}%)`;
        
        // Log the alert
        await supabase.from('token_limit_alerts').insert({
          user_id: userId,
          alert_type: alertType,
          token_usage: currentUsage,
          token_limit: limit,
          usage_percentage: usagePercentage,
        });
      } else if (usagePercentage >= alertThreshold && usagePercentage < 100) {
        shouldAlert = true;
        alertType = usagePercentage >= 90 ? 'limit_reached' : 'warning';
        message = `اقتربت من حد الاستخدام الشهري (${usagePercentage.toFixed(1)}%)`;
        
        // Check if we already sent this alert recently (within last hour)
        const { data: recentAlerts } = await supabase
          .from('token_limit_alerts')
          .select('created_at')
          .eq('user_id', userId)
          .eq('alert_type', alertType)
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .limit(1);

        // Only insert if no recent alert exists
        if (!recentAlerts || recentAlerts.length === 0) {
          await supabase.from('token_limit_alerts').insert({
            user_id: userId,
            alert_type: alertType,
            token_usage: currentUsage,
            token_limit: limit,
            usage_percentage: usagePercentage,
          });
        }
      }
    }

    return {
      canProceed: usagePercentage < 100, // Only block if exceeded
      currentUsage,
      limit,
      usagePercentage,
      shouldAlert,
      alertType,
      message,
    };
  } catch (error) {
    console.error('Error in checkTokenLimit:', error);
    // Default to allowing if there's an error
    return {
      canProceed: true,
      currentUsage: 0,
      limit: 1000000,
      usagePercentage: 0,
      shouldAlert: false,
    };
  }
}
