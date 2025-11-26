interface PaymentFailedData {
  user_name: string;
  plan_name: string;
  amount: number;
  currency: string;
  retry_date: string;
  reason: string;
}

export function getPaymentFailedTemplate(data: PaymentFailedData): string {
  const retryDate = new Date(data.retry_date).toLocaleDateString('ar-SA', {
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
  <title>فشل الدفع</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; max-width: 600px;">
          <tr>
            <td style="padding: 40px 20px;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 30px; text-align: center;">⚠️ فشل في معالجة الدفع</h1>
              
              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                عزيزنا ${data.user_name}،
              </p>

              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                نأسف لإبلاغك بأنه لم نتمكن من معالجة دفعتك الأخيرة لاشتراكك في PreShoot Studio.
              </p>

              <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #2a1a1a; border-radius: 6px; border-right: 4px solid #ef4444; margin: 24px 0;">
                <tr>
                  <td>
                    <p style="color: #ef4444; font-size: 18px; font-weight: bold; margin: 0 0 16px;">تفاصيل الدفعة الفاشلة:</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>الخطة:</strong> ${data.plan_name}</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>المبلغ:</strong> $${data.amount.toFixed(2)} ${data.currency}</p>
                    ${data.reason ? `<p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>السبب:</strong> ${data.reason}</p>` : ''}
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>محاولة إعادة الدفع:</strong> ${retryDate}</p>
                  </td>
                </tr>
              </table>

              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                لتجنب انقطاع الخدمة، يرجى تحديث معلومات الدفع الخاصة بك في أقرب وقت ممكن.
              </p>

              <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #2a2414; border-radius: 6px; margin: 16px 0;">
                <tr>
                  <td>
                    <p style="color: #fbbf24; font-size: 15px; line-height: 24px; margin: 0;">
                      <strong>تنبيه:</strong> إذا لم يتم تحديث معلومات الدفع، سيتم تعليق اشتراكك بعد ${retryDate}.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="https://preshootstudio.com/profile" style="display: inline-block; background-color: #ef4444; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px;">
                      تحديث معلومات الدفع
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #333333; margin: 32px 0;">

              <p style="color: #888888; font-size: 14px; line-height: 22px; margin: 16px 0;">
                إذا كنت بحاجة إلى مساعدة، يرجى <a href="mailto:contact@preshootstudio.com" style="color: #a855f7; text-decoration: underline;">التواصل معنا</a>
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
