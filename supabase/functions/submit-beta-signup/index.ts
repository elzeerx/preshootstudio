import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_WINDOW_HOURS = 1;
const MAX_ATTEMPTS_PER_WINDOW = 3;

interface SignupRequest {
  name: string;
  email: string;
  notes?: string;
  preferred_language?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP address
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';

    console.log(`Beta signup attempt from IP: ${clientIp}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const signupData: SignupRequest = await req.json();

    // Validate required fields
    if (!signupData.name || !signupData.email) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS);

    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('beta_signup_rate_limits')
      .select('*')
      .eq('ip_address', clientIp)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (rateLimitError && rateLimitError.code !== 'PGRST116') {
      console.error('Rate limit check error:', rateLimitError);
      throw rateLimitError;
    }

    // If rate limit exists and exceeded
    if (rateLimitData && rateLimitData.attempt_count >= MAX_ATTEMPTS_PER_WINDOW) {
      const timeRemaining = new Date(rateLimitData.window_start);
      timeRemaining.setHours(timeRemaining.getHours() + RATE_LIMIT_WINDOW_HOURS);
      const minutesRemaining = Math.ceil((timeRemaining.getTime() - Date.now()) / 60000);

      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Too many signup attempts. Please try again later.',
          retryAfterMinutes: minutesRemaining
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert beta signup
    const { error: signupError } = await supabase
      .from('beta_signups')
      .insert([{
        name: signupData.name.trim(),
        email: signupData.email.toLowerCase().trim(),
        notes: signupData.notes?.trim(),
        preferred_language: signupData.preferred_language || 'en',
        status: 'pending'
      }]);

    if (signupError) {
      console.error('Signup insert error:', signupError);
      
      // Check if it's a duplicate email error
      if (signupError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'This email is already registered for beta access' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw signupError;
    }

    // Update or create rate limit record
    if (rateLimitData) {
      // Update existing record
      await supabase
        .from('beta_signup_rate_limits')
        .update({
          attempt_count: rateLimitData.attempt_count + 1,
          last_attempt: new Date().toISOString()
        })
        .eq('id', rateLimitData.id);
    } else {
      // Create new rate limit record
      await supabase
        .from('beta_signup_rate_limits')
        .insert([{
          ip_address: clientIp,
          attempt_count: 1,
          window_start: new Date().toISOString(),
          last_attempt: new Date().toISOString()
        }]);
    }

    // Notify admins asynchronously (don't await)
    supabase.functions.invoke('notify-admins-new-signup', {
      body: {
        signupName: signupData.name,
        signupEmail: signupData.email,
        signupReason: signupData.notes
      }
    }).catch(err => console.error('Admin notification error:', err));

    console.log(`Beta signup successful for: ${signupData.email}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Beta signup submitted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-beta-signup:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
