-- Add language support to email_templates
ALTER TABLE email_templates ADD COLUMN language text NOT NULL DEFAULT 'en';

-- Create unique constraint on template_name and language
ALTER TABLE email_templates DROP CONSTRAINT IF EXISTS email_templates_template_name_key;
ALTER TABLE email_templates ADD CONSTRAINT email_templates_template_name_language_key 
  UNIQUE (template_name, language);

-- Update existing template to be English
UPDATE email_templates SET language = 'en' WHERE template_name = 'beta_invitation';

-- Insert Arabic version of beta invitation template
INSERT INTO email_templates (template_name, language, subject, html_content, variables)
VALUES (
  'beta_invitation',
  'ar',
  'دعوة للانضمام إلى النسخة التجريبية من PreShoot',
  '<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
    <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="color: #1a1a1a; margin-bottom: 20px; font-size: 24px;">مرحباً {{name}}!</h1>
      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
        يسعدنا دعوتك للانضمام إلى النسخة التجريبية من PreShoot. تم الموافقة على طلبك ويمكنك الآن إنشاء حسابك.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{inviteLink}}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          إنشاء حساب الآن
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        ملاحظة: هذا الرابط صالح لمدة 7 أيام من تاريخ الإرسال.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        © 2024 PreShoot. جميع الحقوق محفوظة.
      </p>
    </div>
  </div>',
  '["name", "inviteLink"]'::jsonb
);

-- Add preferred_language column to beta_signups for user language preference
ALTER TABLE beta_signups ADD COLUMN preferred_language text DEFAULT 'en';