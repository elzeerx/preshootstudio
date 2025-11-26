interface PlanChangedData {
  user_name: string;
  old_plan_name: string;
  new_plan_name: string;
  billing_period: string;
  amount: number;
  currency: string;
}

export function getPlanChangedTemplate(data: PlanChangedData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تم تغيير خطة اشتراكك</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; max-width: 600px;">
          <tr>
            <td style="padding: 40px 20px;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 30px; text-align: center;">🔄 تم تغيير خطتك</h1>
              
              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                عزيزنا ${data.user_name}،
              </p>

              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                نؤكد لك أنه تم تغيير خطة اشتراكك بنجاح. تم احتساب الفرق في السعر تلقائياً.
              </p>

              <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #2a2a2a; border-radius: 6px; margin: 24px 0;">
                <tr>
                  <td>
                    <p style="color: #a855f7; font-size: 18px; font-weight: bold; margin: 0 0 16px;">تفاصيل التغيير:</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>الخطة السابقة:</strong> ${data.old_plan_name}</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>الخطة الجديدة:</strong> ${data.new_plan_name}</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>فترة الفوترة:</strong> ${data.billing_period}</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>السعر الجديد:</strong> $${data.amount.toFixed(2)} ${data.currency}</p>
                  </td>
                </tr>
              </table>

              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                ستحصل على ميزات خطتك الجديدة فوراً.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="https://preshootstudio.com/profile" style="display: inline-block; background-color: #a855f7; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px;">
                      عرض تفاصيل الاشتراك
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #333333; margin: 32px 0;">

              <p style="color: #888888; font-size: 14px; line-height: 22px; margin: 16px 0;">
                إذا لم تقم بهذا التغيير، يرجى <a href="mailto:contact@preshootstudio.com" style="color: #a855f7; text-decoration: underline;">التواصل معنا فوراً</a>
              </p>

              <p style="color: #888888; font-size: 14px; line-height: 22px; margin: 16px 0;">
                مع أطيب التحيات،<br>
                فريق PreShoot Studio
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
