import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">الشروط والأحكام</h1>
          <p className="text-muted-foreground text-center mb-8">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. مقدمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  مرحباً بكم في Preshoot Studio ("الخدمة")، منصة مدعومة بالذكاء الاصطناعي لإنشاء محتوى ما قبل التصوير.
                  باستخدامك لهذه الخدمة، فإنك توافق على الالتزام بهذه الشروط والأحكام ("الشروط").
                </p>
                <p>
                  تخضع هذه الخدمة للقوانين الكويتية بما في ذلك لائحة حماية خصوصية البيانات رقم 26/2024 الصادرة عن 
                  هيئة الاتصالات وتقنية المعلومات (CITRA) وقانون المعاملات الإلكترونية رقم 20 لسنة 2014.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. التعريفات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>"الخدمة"</strong>: منصة Preshoot Studio وجميع الميزات المرتبطة بها</li>
                  <li><strong>"المستخدم"</strong> أو <strong>"أنت"</strong>: الشخص أو الكيان الذي يستخدم الخدمة</li>
                  <li><strong>"البيانات الشخصية"</strong>: أي بيانات تتعلق بشخص طبيعي محدد أو قابل للتحديد وفقاً للائحة رقم 26/2024</li>
                  <li><strong>"المحتوى المُولَّد"</strong>: النصوص والمخرجات والمواد التي تنتجها خدمات الذكاء الاصطناعي</li>
                  <li><strong>"مراقب البيانات"</strong>: Preshoot Studio بصفته الجهة التي تحدد أغراض ووسائل معالجة البيانات الشخصية</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. استخدام الخدمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <h4 className="font-semibold">3.1 الأهلية</h4>
                <p>يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام هذه الخدمة. باستخدامك للخدمة، فإنك تقر وتضمن أنك تستوفي متطلب العمر هذا.</p>
                
                <h4 className="font-semibold">3.2 الوصول إلى النسخة التجريبية</h4>
                <p>خدمتنا حالياً في مرحلة تجريبية (Beta) ويتطلب الوصول إليها دعوة من فريق الإدارة. يتم منح الوصول وفقاً لتقدير Preshoot Studio.</p>
                
                <h4 className="font-semibold">3.3 مسؤوليات الحساب</h4>
                <p>أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك وعن جميع الأنشطة التي تحدث تحت حسابك.</p>
                
                <h4 className="font-semibold">3.4 الاستخدام المقبول</h4>
                <p>توافق على عدم استخدام الخدمة لأغراض غير قانونية أو ضارة أو تنتهك حقوق الآخرين أو تنتهك القوانين الكويتية.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. المحتوى والملكية الفكرية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <h4 className="font-semibold">4.1 المحتوى المُولَّد بالذكاء الاصطناعي</h4>
                <p>
                  تحتفظ بملكية المحتوى الذي تنشئه باستخدام خدمات الذكاء الاصطناعي الخاصة بنا، مع مراعاة الامتثال 
                  للاستراتيجية الوطنية للذكاء الاصطناعي في الكويت 2025-2028.
                </p>
                
                <h4 className="font-semibold">4.2 محتوى المستخدم</h4>
                <p>
                  تحتفظ بجميع حقوق الملكية الفكرية للمحتوى الذي تقدمه ("محتوى المستخدم"). بتقديم المحتوى، 
                  فإنك تمنحنا ترخيصاً عالمياً غير حصري لاستخدام المحتوى وتخزينه ومعالجته لغرض تقديم الخدمة.
                </p>
                
                <h4 className="font-semibold">4.3 ملكية المنصة</h4>
                <p>
                  تظل منصة Preshoot Studio وجميع التقنيات الأساسية والعلامات التجارية والشعارات ملكاً حصرياً لـ Preshoot Studio.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. الذكاء الاصطناعي والمحتوى المُولَّد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <h4 className="font-semibold">5.1 طبيعة مخرجات الذكاء الاصطناعي</h4>
                <p>
                  تُنشئ خدماتنا محتوى باستخدام نماذج الذكاء الاصطناعي المتقدمة (Google Gemini، OpenAI GPT). 
                  قد لا يكون المحتوى المُولَّد دقيقاً أو كاملاً أو مناسباً لجميع الأغراض.
                </p>
                
                <h4 className="font-semibold">5.2 مسؤولية المستخدم</h4>
                <p>
                  أنت مسؤول بشكل كامل عن مراجعة والتحقق من واستخدام أي محتوى مُولَّد. يجب عليك التحقق من دقة 
                  وملاءمة المحتوى قبل استخدامه في أي سياق احترافي أو تجاري أو عام.
                </p>
                
                <h4 className="font-semibold">5.3 عدم ضمان الدقة</h4>
                <p>
                  لا نضمن دقة أو اكتمال أو موثوقية أو ملاءمة المحتوى المُولَّد بالذكاء الاصطناعي. لا يشكل 
                  المحتوى المُولَّد مشورة مهنية من أي نوع.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. الاشتراكات والدفع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <h4 className="font-semibold">6.1 الباقات</h4>
                <p>نقدم باقات اشتراك متعددة: Free، Creator، Pro، و Studio. تختلف كل باقة في عدد المشاريع والتوكنز والميزات.</p>
                
                <h4 className="font-semibold">6.2 الدفع</h4>
                <p>
                  تتم معالجة الدفعات عبر PayPal بالدولار الأمريكي (USD). بالاشتراك، توافق على الرسوم المتكررة 
                  وفقاً لفترة الفوترة المختارة (شهرياً أو سنوياً).
                </p>
                
                <h4 className="font-semibold">6.3 التجديد التلقائي</h4>
                <p>
                  تتجدد الاشتراكات تلقائياً ما لم يتم إلغاؤها قبل نهاية فترة الفوترة الحالية. يمكنك إلغاء اشتراكك في أي وقت من إعدادات حسابك.
                </p>
                
                <h4 className="font-semibold">6.4 الاسترداد</h4>
                <p>
                  الدفعات غير قابلة للاسترداد بشكل عام إلا إذا كان ذلك مطلوباً بموجب القانون الكويتي. 
                  يمكنك إلغاء اشتراكك في أي وقت لمنع الرسوم المستقبلية.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. حماية البيانات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  نلتزم بحماية بياناتك الشخصية وفقاً لـ <strong>لائحة حماية خصوصية البيانات رقم 26/2024</strong> 
                  الصادرة عن هيئة الاتصالات وتقنية المعلومات (CITRA) و<strong>قانون المعاملات الإلكترونية رقم 20 لسنة 2014</strong>.
                </p>
                <p>
                  لمزيد من التفاصيل حول كيفية جمع واستخدام وحماية بياناتك الشخصية، يرجى مراجعة 
                  <a href="/privacy" className="text-primary hover:underline"> سياسة الخصوصية</a> الخاصة بنا.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. إخلاء المسؤولية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  يتم تقديم الخدمة "كما هي" و"حسب التوافر" دون أي ضمانات من أي نوع، صريحة أو ضمنية. 
                  لا نضمن أن الخدمة ستكون خالية من الأخطاء أو غير منقطعة أو آمنة.
                </p>
                <p>
                  إلى أقصى حد يسمح به القانون، لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة أو عرضية 
                  أو تبعية أو خاصة ناتجة عن استخدامك أو عدم قدرتك على استخدام الخدمة.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. الإنهاء</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  نحتفظ بالحق في تعليق أو إنهاء وصولك إلى الخدمة في أي وقت، مع أو بدون إشعار، لأي سبب، 
                  بما في ذلك انتهاك هذه الشروط.
                </p>
                <p>
                  يمكنك إنهاء حسابك في أي وقت عن طريق الاتصال بنا على contact@preshootstudio.com
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. التعديلات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التغييرات على هذه الصفحة مع تاريخ 
                  "آخر تحديث" المحدّث. استمرارك في استخدام الخدمة بعد التغييرات يشكل قبولك للشروط المعدلة.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. القانون الحاكم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  تخضع هذه الشروط وتفسر وفقاً لقوانين دولة الكويت، بما في ذلك:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>لائحة حماية خصوصية البيانات رقم 26/2024 (CITRA)</li>
                  <li>قانون المعاملات الإلكترونية رقم 20 لسنة 2014</li>
                  <li>المادة 231 من قانون الجزاء الكويتي</li>
                  <li>القانون رقم 37 لسنة 2014 بشأن إنشاء هيئة الاتصالات وتقنية المعلومات</li>
                  <li>المادة 39 من الدستور الكويتي (حماية الخصوصية)</li>
                </ul>
                <p className="mt-4">
                  تخضع أي نزاعات تنشأ عن هذه الشروط للاختصاص الحصري للمحاكم الكويتية.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>إذا كانت لديك أي أسئلة حول هذه الشروط والأحكام، يرجى الاتصال بنا على:</p>
                <p className="font-semibold">
                  البريد الإلكتروني: contact@preshootstudio.com
                </p>
                <p>
                  الموقع الإلكتروني: <a href="https://preshootstudio.com" className="text-primary hover:underline">https://preshootstudio.com</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default Terms;
