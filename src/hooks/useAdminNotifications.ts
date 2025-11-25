import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from './useUserRole';

export const useAdminNotifications = () => {
  const { isAdmin } = useUserRole();

  useEffect(() => {
    if (!isAdmin) return;

    console.log('[Admin Notifications] Setting up realtime listener');

    // Subscribe to beta_signups table for INSERT events
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'beta_signups',
        },
        (payload) => {
          console.log('[Admin Notifications] New signup received:', payload);
          
          const newSignup = payload.new as {
            id: string;
            name: string;
            email: string;
            notes?: string;
          };

          // Show toast notification
          toast.success('طلب وصول جديد!', {
            description: `${newSignup.name} (${newSignup.email})`,
            duration: 8000,
            action: {
              label: 'عرض',
              onClick: () => {
                window.location.href = '/admin?tab=signups';
              },
            },
          });
        }
      )
      .subscribe((status) => {
        console.log('[Admin Notifications] Subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('[Admin Notifications] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);
};
