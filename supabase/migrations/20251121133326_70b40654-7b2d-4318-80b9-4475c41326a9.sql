-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY "Admins can manage email templates"
  ON public.email_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default invitation template
INSERT INTO public.email_templates (template_name, subject, html_content, variables)
VALUES (
  'beta_invitation',
  'دعوتك للانضمام إلى PreShoot Beta',
  '<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; 
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
      <h2>عزيزي/عزيزتي {{name}},</h2>
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
        <a href="{{inviteLink}}" class="cta-button">
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
</html>',
  '["name", "inviteLink"]'::jsonb
);