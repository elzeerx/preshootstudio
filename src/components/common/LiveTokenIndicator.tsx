import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const LiveTokenIndicator = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentTokens, setCurrentTokens] = useState(0);

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('token-usage')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_token_usage',
        },
        (payload: any) => {
          setIsActive(true);
          setCurrentTokens(payload.new.total_tokens);
          
          // Reset after 3 seconds
          setTimeout(() => setIsActive(false), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="border-primary bg-primary/10">
        <CardContent className="p-4 flex items-center gap-2">
          <Activity className="h-4 w-4 animate-pulse text-primary" />
          <span className="text-sm font-medium">
            جاري استخدام AI... ({currentTokens.toLocaleString('ar-SA')} tokens)
          </span>
        </CardContent>
      </Card>
    </div>
  );
};
