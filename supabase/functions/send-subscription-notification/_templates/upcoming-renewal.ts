interface UpcomingRenewalData {
  user_name: string;
  plan_name: string;
  billing_period: string;
  amount: number;
  currency: string;
  renewal_date: string;
}

export function getUpcomingRenewalTemplate(data: UpcomingRenewalData): string {
  const renewalDate = new Date(data.renewal_date).toLocaleDateString('ar-SA', {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تذكير بالتجديد</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; max-width: 600px;">
          <tr>
            <td style="padding: 40px 20px;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 30px; text-align: center;">🔔 تذكير بالتجديد القادم</h1>
              
              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                عزيزنا ${data.user_name}،
              </p>

              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                نود تذكيرك بأن اشتراكك في PreShoot Studio سيتم تجديده قريباً.
              </p>

              <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #2a2a2a; border-radius: 6px; margin: 24px 0;">
                <tr>
                  <td>
                    <p style="color: #a855f7; font-size: 18px; font-weight: bold; margin: 0 0 16px;">تفاصيل التجديد:</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>الخطة:</strong> ${data.plan_name}</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>فترة الفوترة:</strong> ${data.billing_period}</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>المبلغ:</strong> $${data.amount.toFixed(2)} ${data.currency}</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>تاريخ التجديد:</strong> ${renewalDate}</p>
                  </td>
                </tr>
              </table>

              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                سيتم تحصيل المبلغ تلقائياً من طريقة الدفع المسجلة لديك. لا حاجة لاتخاذ أي إجراء.
              </p>

              <table width="100%" cellpadding="16" cellspacing="0" style="background-color: #1a2a2a; border-radius: 6px; border-right: 4px solid #10b981; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="color: #e0e0e0; font-size: 14px; line-height: 22px; margin: 0;">
                      💡 إذا كنت ترغب في تغيير خطتك أو تحديث معلومات الدفع، يمكنك القيام بذلك من صفحة الملف الشخصي.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="https://preshootstudio.com/profile" style="display: inline-block; background-color: #a855f7; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px;">
                      إدارة الاشتراك
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #333333; margin: 32px 0;">

              <p style="color: #888888; font-size: 14px; line-height: 22px; margin: 16px 0;">
                إذا كانت لديك أي أسئلة، لا تتردد في <a href="mailto:contact@preshootstudio.com" style="color: #a855f7; text-decoration: underline;">التواصل معنا</a>
              </p>

              <p style="color: #888888; font-size: 14px; line-height: 22px; margin: 16px 0;">
                شكراً لاستخدامك PreShoot Studio!<br>
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
