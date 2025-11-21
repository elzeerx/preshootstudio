import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AlertData {
  id: string;
  alert_type: string;
  usage_percentage: number;
  created_at: string;
  token_usage: number;
  token_limit: number;
  user_id: string;
}

export const TokenLimitAlert = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecentAlerts();
    
    // Subscribe to new alerts
    const channel = supabase
      .channel('token-limit-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_limit_alerts',
        },
        (payload: any) => {
          const newAlert = payload.new as AlertData;
          setAlerts(prev => [newAlert, ...prev].slice(0, 3)); // Keep only latest 3
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get alerts from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('token_limit_alerts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      if (data) setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (visibleAlerts.length === 0) return null;

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'limit_exceeded':
        return 'destructive';
      case 'limit_reached':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAlertMessage = (alert: AlertData) => {
    const percentage = alert.usage_percentage.toFixed(1);
    switch (alert.alert_type) {
      case 'limit_exceeded':
        return `تم تجاوز حد الاستخدام الشهري (${percentage}%). لن تتمكن من استخدام AI حتى بداية الشهر القادم.`;
      case 'limit_reached':
        return `وصلت إلى ${percentage}% من حد الاستخدام الشهري. يرجى مراقبة استخدامك.`;
      default:
        return `استخدمت ${percentage}% من حد الاستخدام الشهري.`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {visibleAlerts.map((alert) => (
        <Alert 
          key={alert.id} 
          variant={getAlertVariant(alert.alert_type)}
          className="animate-in slide-in-from-right duration-300"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-start justify-between gap-2">
            <span className="flex-1">{getAlertMessage(alert)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => handleDismiss(alert.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
