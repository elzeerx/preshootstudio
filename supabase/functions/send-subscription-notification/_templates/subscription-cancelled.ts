interface SubscriptionCancelledData {
  user_name: string;
  plan_name: string;
  end_date: string;
}

export function getSubscriptionCancelledTemplate(data: SubscriptionCancelledData): string {
  const endDate = new Date(data.end_date).toLocaleDateString('ar-SA', {
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
  <title>تم إلغاء اشتراكك</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; max-width: 600px;">
          <tr>
            <td style="padding: 40px 20px;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 30px; text-align: center;">😔 تم إلغاء اشتراكك</h1>
              
              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                عزيزنا ${data.user_name}،
              </p>

              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                نؤكد لك أنه تم إلغاء اشتراكك في PreShoot Studio بنجاح.
              </p>

              <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #2a2a2a; border-radius: 6px; margin: 24px 0;">
                <tr>
                  <td>
                    <p style="color: #a855f7; font-size: 18px; font-weight: bold; margin: 0 0 16px;">تفاصيل الإلغاء:</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>الخطة الملغاة:</strong> ${data.plan_name}</p>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 8px 0;"><strong>آخر يوم للوصول:</strong> ${endDate}</p>
                  </td>
                </tr>
              </table>

              <p style="color: #e0e0e0; font-size: 16px; line-height: 26px; margin: 16px 0;">
                ستتمكن من الوصول إلى جميع ميزات خطتك حتى نهاية الفترة المدفوعة. بعد ذلك، سيتم تحويل حسابك تلقائياً إلى الخطة المجانية.
              </p>

              <table width="100%" cellpadding="16" cellspacing="0" style="background-color: #1a2a2a; border-radius: 6px; border-right: 4px solid #3b82f6; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="color: #e0e0e0; font-size: 14px; line-height: 22px; margin: 0;">
                      💡 يمكنك إعادة تفعيل اشتراكك في أي وقت من صفحة الأسعار.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="16" cellspacing="0" style="background-color: #2a2a2a; border-radius: 6px; margin: 20px 0;">
                <tr>
                  <td>
                    <p style="color: #e0e0e0; font-size: 15px; line-height: 24px; margin: 0;">
                      نأسف لرؤيتك تغادر! نرحب بملاحظاتك لتحسين خدماتنا. يرجى <a href="mailto:contact@preshootstudio.com" style="color: #a855f7; text-decoration: underline;">مشاركة ملاحظاتك معنا</a>.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="https://preshootstudio.com/pricing" style="display: inline-block; background-color: #a855f7; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px;">
                      عرض الخطط المتاحة
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #333333; margin: 32px 0;">

              <p style="color: #888888; font-size: 14px; line-height: 22px; margin: 16px 0;">
                شكراً لاستخدامك PreShoot Studio. نأمل أن نراك مجدداً قريباً!<br>
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
