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

    const { signupId, name, email }: InvitationRequest = await req.json();
    console.log("Processing invitation for:", { signupId, email });

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
        subject: "دعوتك للانضمام إلى PreShoot Beta",
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background-color: #f5f5f5; 
                margin: 0; 
                padding: 0;
                direction: rtl;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border-radius: 12px; 
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 40px 20px; 
                text-align: center;
              }
              .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 28px;
                font-weight: 700;
              }
              .content { 
                padding: 40px 30px;
              }
              .content h2 { 
                color: #333333; 
                margin-top: 0;
                font-size: 22px;
              }
              .content p { 
                color: #666666; 
                line-height: 1.8;
                font-size: 16px;
              }
              .cta-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff !important; 
                padding: 16px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                margin: 20px 0;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
              }
              .footer { 
                background-color: #f8f9fa; 
                padding: 30px; 
                text-align: center; 
                color: #999999;
                font-size: 14px;
              }
              .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
                margin: 30px 0;
              }
              .highlight {
                background-color: #fff3cd;
                padding: 15px;
                border-radius: 6px;
                border-right: 4px solid #ffc107;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 مرحباً بك في PreShoot Beta</h1>
              </div>
              <div class="content">
                <h2>عزيزي/عزيزتي ${name}،</h2>
                <p>
                  يسعدنا أن نخبرك بأنه تمت الموافقة على طلبك للانضمام إلى النسخة التجريبية من PreShoot!
                </p>
                <p>
                  PreShoot هي منصة متطورة لإنتاج المحتوى الإبداعي، وأنت من بين أوائل المستخدمين الذين سيختبرون ميزاتها الرائدة.
                </p>
                
                <div class="divider"></div>
                
                <div class="highlight">
                  <p style="margin: 0; color: #856404;">
                    <strong>⏰ مهم:</strong> رابط الدعوة صالح لمدة 7 أيام فقط. لا تفوت هذه الفرصة!
                  </p>
                </div>
                
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${inviteLink}" class="cta-button">
                    قبول الدعوة وإنشاء الحساب
                  </a>
                </p>
                
                <div class="divider"></div>
                
                <h3 style="color: #333;">ماذا يمكنك أن تفعل الآن؟</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>إنشاء مشاريع إبداعية جديدة</li>
                  <li>الوصول إلى أدوات البحث والتحليل المتقدمة</li>
                  <li>إنشاء نصوص وسيناريوهات احترافية</li>
                  <li>التواصل مع فريق الدعم مباشرة</li>
                </ul>
                
                <p>
                  نحن متحمسون لرؤية ما ستبدعه باستخدام PreShoot. آراؤك وملاحظاتك ستساعدنا في تحسين المنصة.
                </p>
                
                <p style="margin-top: 30px;">
                  <strong>هل لديك أسئلة؟</strong><br>
                  فريق الدعم جاهز لمساعدتك في أي وقت.
                </p>
              </div>
              <div class="footer">
                <p style="margin: 0;">
                  هذه الدعوة مخصصة لك فقط. يرجى عدم مشاركتها مع الآخرين.
                </p>
                <p style="margin: 10px 0 0 0;">
                  © 2024 PreShoot. جميع الحقوق محفوظة.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
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
