import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  signupId?: string;
  signupName: string;
  signupEmail: string;
  signupReason?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appUrl = Deno.env.get("VITE_APP_URL") || "https://preshootstudio.com";

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { signupId, signupName, signupEmail, signupReason }: NotifyRequest =
      await req.json();

    console.log("Processing notification for signup:", {
      signupId,
      signupName,
      signupEmail,
    });

    // Get all admin users
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw new Error("Failed to fetch admin roles");
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admins found to notify");
      return new Response(
        JSON.stringify({ message: "No admins found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const adminIds = adminRoles.map((role) => role.user_id);
    console.log(`Found ${adminIds.length} admins to notify`);

    // Get admin email addresses
    const { data: adminProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .in("id", adminIds);

    if (profilesError) {
      console.error("Error fetching admin profiles:", profilesError);
      throw new Error("Failed to fetch admin profiles");
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log("No admin profiles found");
      return new Response(
        JSON.stringify({ message: "No admin emails found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const adminEmails = adminProfiles.map((profile) => profile.email);
    console.log(`Sending notifications to ${adminEmails.length} admins`);

    // Prepare email content
    const subject = "🔔 طلب وصول جديد - New Access Request";
    
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
          .field { margin-bottom: 20px; padding: 15px; background: #f7f7f7; border-radius: 8px; }
          .label { font-weight: bold; color: #667eea; margin-bottom: 5px; display: block; }
          .value { color: #333; }
          .reason { background: #fff8e1; border-right: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin-top: 20px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">طلب وصول جديد</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New Access Request Received</p>
        </div>
        
        <div class="content">
          <p>تم استلام طلب وصول جديد إلى PreShoot AI:</p>
          <p>A new access request has been received for PreShoot AI:</p>
          
          <div class="field">
            <span class="label">الاسم / Name:</span>
            <span class="value">${signupName}</span>
          </div>
          
          <div class="field">
            <span class="label">البريد الإلكتروني / Email:</span>
            <span class="value">${signupEmail}</span>
          </div>
          
          ${signupReason ? `
            <div class="reason">
              <span class="label">السبب / Reason:</span>
              <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${signupReason}</div>
            </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${appUrl}/admin" class="button">
              مراجعة الطلب / Review Request
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>PreShoot Studio © 2025</p>
          <p style="font-size: 12px; color: #999;">هذا البريد الإلكتروني تم إرساله تلقائياً / This email was sent automatically</p>
        </div>
      </body>
      </html>
    `;

    // Send email to all admins using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PreShoot <contact@preshootstudio.com>",
        to: adminEmails,
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Error sending email:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notified ${adminEmails.length} admins`,
        emailId: emailData?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in notify-admins-new-signup function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
