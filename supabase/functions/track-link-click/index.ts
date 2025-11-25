import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      console.log('No token provided, redirecting to home');
      return Response.redirect(Deno.env.get('VITE_APP_URL') || 'https://localhost:5173', 302);
    }

    console.log('🔗 Link click tracked for token:', token);

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
          .select('link_clicked_at, clicked_count')
          .eq('token', token)
          .single();

        if (!invitation) {
          console.log('Invitation not found for token:', token);
          return;
        }

        // Update link click tracking
        const updates: any = {
          clicked_count: (invitation.clicked_count || 0) + 1
        };

        // Set first click timestamp if not already set
        if (!invitation.link_clicked_at) {
          updates.link_clicked_at = new Date().toISOString();
        }

        const { error } = await supabaseAdmin
          .from('beta_invitations')
          .update(updates)
          .eq('token', token);

        if (error) {
          console.error('Error updating link click tracking:', error);
        } else {
          console.log('✅ Link click tracked successfully');
        }
      } catch (error) {
        console.error('Error in background task:', error);
      }
    };

    // Run update in background (using Promise without awaiting)
    updateTask().catch(err => console.error('Background task error:', err));

    // Redirect to actual invitation page immediately
    const appUrl = Deno.env.get('VITE_APP_URL') || 'https://localhost:5173';
    const redirectUrl = `${appUrl}/accept-invite?token=${token}`;

    return Response.redirect(redirectUrl, 302);

  } catch (error) {
    console.error('❌ Error in track-link-click:', error);
    // Redirect to home on error
    return Response.redirect(Deno.env.get('VITE_APP_URL') || 'https://localhost:5173', 302);
  }
});
