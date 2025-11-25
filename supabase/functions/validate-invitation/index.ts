import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  token: string;
}

interface ValidationResponse {
  valid: boolean;
  expired?: boolean;
  alreadyUsed?: boolean;
  tokenExpired?: boolean;
  signup?: {
    id: string;
    name: string;
    email: string;
    user_id: string | null;
  };
  invitation?: {
    id: string;
    expires_at: string;
    accepted_at: string | null;
  };
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Validating invitation token...');
    
    // Initialize Supabase client with service role (bypasses RLS)
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

    const { token } = await req.json() as ValidationRequest;

    if (!token) {
      console.error('❌ No token provided');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Token is required' 
        } as ValidationResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('🔎 Looking up invitation for token...');

    // Query invitation with signup data using service role
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('beta_invitations')
      .select(`
        id,
        token,
        expires_at,
        accepted_at,
        signup_id,
        beta_signups (
          id,
          name,
          email,
          user_id
        )
      `)
      .eq('token', token)
      .maybeSingle();

    if (invitationError) {
      console.error('❌ Database error:', invitationError);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Database error occurred' 
        } as ValidationResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    if (!invitation) {
      console.log('❌ Invalid token - not found');
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Invalid invitation token' 
        } as ValidationResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      console.log('⚠️ Token already used');
      return new Response(
        JSON.stringify({ 
          valid: false,
          alreadyUsed: true,
          error: 'Invitation has already been accepted' 
        } as ValidationResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Check if expired
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    if (expiresAt < now) {
      console.log('⚠️ Token expired');
      return new Response(
        JSON.stringify({ 
          valid: false,
          tokenExpired: true,
          expired: true,
          error: 'Invitation has expired' 
        } as ValidationResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Extract signup data
    const signupData = Array.isArray(invitation.beta_signups) 
      ? invitation.beta_signups[0] 
      : invitation.beta_signups;

    if (!signupData) {
      console.error('❌ No signup data found');
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Signup data not found' 
        } as ValidationResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Check if user account already exists
    if (signupData.user_id) {
      console.log('⚠️ User account already exists');
      return new Response(
        JSON.stringify({ 
          valid: false,
          alreadyUsed: true,
          error: 'Account has already been created for this invitation' 
        } as ValidationResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('✅ Token validation successful');

    // Return valid response
    return new Response(
      JSON.stringify({
        valid: true,
        signup: {
          id: signupData.id,
          name: signupData.name,
          email: signupData.email,
          user_id: signupData.user_id
        },
        invitation: {
          id: invitation.id,
          expires_at: invitation.expires_at,
          accepted_at: invitation.accepted_at
        }
      } as ValidationResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      } as ValidationResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
