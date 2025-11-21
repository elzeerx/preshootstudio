import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Resend API client
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  signupId: string;
  name: string;
  email: string;
  language?: string;
}

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { signupId, name, email, language = 'en' }: InvitationRequest = await req.json();
    console.log("Processing invitation for:", { signupId, email, language });

    // Fetch email template from database based on language
    const { data: templateData, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('template_name', 'beta_invitation')
      .eq('language', language)
      .single();

    if (templateError) {
      console.error("Error fetching template:", templateError);
      throw new Error(`Failed to fetch template: ${templateError.message}`);
    }

    // Generate invitation token
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days

    // Store invitation token in database
    const { data: invitation, error: invitationError } = await supabase
      .from('beta_invitations')
      .insert({
        signup_id: signupId,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      throw new Error(`Failed to create invitation: ${invitationError.message}`);
    }

    console.log("Invitation created:", invitation.id);

    // Get the app URL from environment or use a default
    const appUrl = Deno.env.get("VITE_APP_URL") || "http://localhost:5173";
    const inviteLink = `${appUrl}/accept-invite?token=${token}`;

    // Replace template variables
    const emailHtml = templateData.html_content
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{inviteLink\}\}/g, inviteLink);

    // Send invitation email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PreShoot <onboarding@resend.dev>",
        to: [email],
        subject: templateData.subject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    // Update signup status to 'notified' and set invited_at timestamp
    const { error: updateError } = await supabase
      .from('beta_signups')
      .update({ 
        status: 'notified',
        invited_at: new Date().toISOString()
      })
      .eq('id', signupId);

    if (updateError) {
      console.error("Error updating signup status:", updateError);
      throw new Error(`Failed to update signup: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitationId: invitation.id,
        emailId: emailData.id 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
