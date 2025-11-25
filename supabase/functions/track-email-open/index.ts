import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 1x1 transparent GIF pixel
const TRANSPARENT_GIF = Uint8Array.from(
  atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
  c => c.charCodeAt(0)
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get token from query parameter
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      console.log('No token provided');
      return new Response(TRANSPARENT_GIF, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    console.log('📧 Email open tracked for token:', token);

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Start background task to update database
    const updateTask = async () => {
      try {
        // Get current invitation
        const { data: invitation } = await supabaseAdmin
          .from('beta_invitations')
          .select('email_opened_at, opened_count')
          .eq('token', token)
          .single();

        if (!invitation) {
          console.log('Invitation not found for token:', token);
          return;
        }

        // Update email open tracking
        const updates: any = {
          opened_count: (invitation.opened_count || 0) + 1
        };

        // Set first open timestamp if not already set
        if (!invitation.email_opened_at) {
          updates.email_opened_at = new Date().toISOString();
        }

        const { error } = await supabaseAdmin
          .from('beta_invitations')
          .update(updates)
          .eq('token', token);

        if (error) {
          console.error('Error updating email open tracking:', error);
        } else {
          console.log('✅ Email open tracked successfully');
        }
      } catch (error) {
        console.error('Error in background task:', error);
      }
    };

    // Run update in background (using Promise without awaiting)
    updateTask().catch(err => console.error('Background task error:', err));

    // Return tracking pixel immediately
    return new Response(TRANSPARENT_GIF, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('❌ Error in track-email-open:', error);
    // Still return tracking pixel even on error
    return new Response(TRANSPARENT_GIF, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
      },
    });
  }
});
