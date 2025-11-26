import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">سياسة الخصوصية</h1>
          <p className="text-muted-foreground text-center mb-8">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA', { calendar: 'gregory', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>مقدمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  تلتزم Preshoot Studio ("نحن" أو "خدمتنا") بحماية خصوصيتك وبياناتك الشخصية. توضح سياسة 
                  الخصوصية هذه كيفية جمع واستخدام وحماية ومشاركة معلوماتك وفقاً لـ:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>لائحة حماية خصوصية البيانات رقم 26/2024</strong> (الإصدار 2.0) الصادرة عن هيئة الاتصالات وتقنية المعلومات (CITRA)</li>
                  <li><strong>قانون المعاملات الإلكترونية رقم 20 لسنة 2014</strong></li>
                  <li><strong>القانون رقم 37 لسنة 2014</strong> بشأن إنشاء هيئة الاتصالات وتقنية المعلومات</li>
                  <li><strong>المادة 231 من قانون الجزاء الكويتي</strong></li>
                  <li><strong>المادة 39 من الدستور الكويتي</strong></li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>1. المعلومات التي نجمعها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>نقوم بجمع الأنواع التالية من البيانات الشخصية وفقاً لتعريف اللائحة رقم 26/2024:</p>
                
                <h4 className="font-semibold">1.1 معلومات الحساب</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>الاسم الكامل</li>
                  <li>عنوان البريد الإلكتروني</li>
                  <li>معلومات الحساب (معرف المستخدم، كلمة المرور المشفرة)</li>
                </ul>

                <h4 className="font-semibold">1.2 بيانات الاستخدام</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>سجلات المشاريع والمحتوى المُدخل</li>
                  <li>استخدام التوكنز ومقاييس الخدمة</li>
                  <li>تفاعلات الذكاء الاصطناعي والمخرجات المُولَّدة</li>
                  <li>عنوان IP وبيانات الجهاز ونوع المتصفح</li>
                  <li>أوقات الوصول وأنماط الاستخدام</li>
                </ul>

                <h4 className="font-semibold">1.3 معلومات الدفع</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>معرف معاملة PayPal (لا نقوم بتخزين تفاصيل بطاقة الائتمان مباشرة)</li>
                  <li>سجل الاشتراك والفوترة</li>
                  <li>مبالغ وتواريخ المعاملات</li>
                </ul>

                <h4 className="font-semibold">1.4 ملفات تعريف الارتباط والتقنيات المشابهة</h4>
                <p>نستخدم ملفات تعريف الارتباط لتتبع الجلسات وتحسين تجربة المستخدم والتحليلات.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. الأساس القانوني للمعالجة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>نقوم بمعالجة بياناتك الشخصية بناءً على الأسس القانونية التالية:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>الموافقة</strong>: موافقتك الصريحة عند إنشاء حساب واستخدام خدماتنا</li>
                  <li><strong>الضرورة التعاقدية</strong>: لتنفيذ اتفاقية الخدمة وتقديم الميزات المطلوبة</li>
                  <li><strong>المصلحة المشروعة</strong>: لتحسين خدماتنا والأمان والوقاية من الاحتيال</li>
                  <li><strong>الالتزام القانوني</strong>: للامتثال للقوانين واللوائح الكويتية</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. كيف نستخدم معلوماتك</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>نستخدم بياناتك الشخصية للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>تقديم وتشغيل خدمة Preshoot Studio</li>
                  <li>معالجة إنشاء المحتوى بواسطة الذكاء الاصطناعي</li>
                  <li>إدارة حسابك واشتراكك</li>
                  <li>معالجة المدفوعات وتتبع الاستخدام</li>
                  <li>إرسال الإشعارات الخدمية والتحديثات المهمة</li>
                  <li>تحسين خدماتنا ونماذج الذكاء الاصطناعي</li>
                  <li>الكشف عن الاحتيال والانتهاكات الأمنية ومنعها</li>
                  <li>الامتثال للالتزامات القانونية</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. مشاركة البيانات مع الأطراف الثالثة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>نشارك بياناتك الشخصية مع الأطراف الثالثة التالية:</p>
                
                <h4 className="font-semibold">4.1 مزودو خدمات الذكاء الاصطناعي</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Google Gemini</strong>: لمعالجة إنشاء المحتوى بالذكاء الاصطناعي</li>
                  <li><strong>OpenAI (GPT)</strong>: لمعالجة إنشاء المحتوى بالذكاء الاصطناعي</li>
                </ul>

                <h4 className="font-semibold">4.2 معالج الدفع</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>PayPal</strong>: لمعالجة المدفوعات والاشتراكات</li>
                </ul>

                <h4 className="font-semibold">4.3 خدمات البريد الإلكتروني</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Resend</strong>: لإرسال رسائل البريد الإلكتروني للخدمة والإشعارات</li>
                </ul>

                <h4 className="font-semibold">4.4 البنية التحتية السحابية</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Supabase/Lovable Cloud</strong>: لاستضافة قاعدة البيانات والتخزين والوظائف الخلفية</li>
                </ul>

                <p className="mt-4">
                  نتأكد من أن جميع مزودي الخدمة الخارجيين يلتزمون بمعايير حماية البيانات المناسبة ويعالجون 
                  بياناتك فقط وفقاً لتعليماتنا.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. نقل البيانات الدولي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  قد يتم نقل بياناتك الشخصية ومعالجتها في خوادم موجودة خارج دولة الكويت. نتخذ التدابير المناسبة 
                  لضمان حماية بياناتك وفقاً للائحة رقم 26/2024، بما في ذلك:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>تطبيق بنود تعاقدية قياسية مع مزودي الخدمة</li>
                  <li>التأكد من وجود ضمانات كافية لحماية البيانات</li>
                  <li>تشفير البيانات أثناء النقل والتخزين</li>
                  <li>الحصول على موافقتك الصريحة عند الضرورة</li>
                </ul>
                <p>
                  تُفضّل اللائحة رقم 26/2024 توطين البيانات داخل الكويت حيثما أمكن. نحن نقيّم باستمرار 
                  خيارات التخزين المحلي للبيانات.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. حقوقك</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>بموجب اللائحة رقم 26/2024، لديك الحقوق التالية:</p>
                
                <h4 className="font-semibold">6.1 حق الوصول</h4>
                <p>يمكنك طلب نسخة من بياناتك الشخصية التي نحتفظ بها.</p>

                <h4 className="font-semibold">6.2 حق التصحيح</h4>
                <p>يمكنك طلب تصحيح بياناتك الشخصية غير الدقيقة أو غير الكاملة.</p>

                <h4 className="font-semibold">6.3 حق الحذف ("الحق في النسيان")</h4>
                <p>يمكنك طلب حذف بياناتك الشخصية في ظروف معينة.</p>

                <h4 className="font-semibold">6.4 حق نقل البيانات</h4>
                <p>يمكنك طلب نقل بياناتك إلى خدمة أخرى بتنسيق منظم وشائع الاستخدام وقابل للقراءة آلياً.</p>

                <h4 className="font-semibold">6.5 حق الاعتراض</h4>
                <p>يمكنك الاعتراض على معالجة بياناتك في ظروف معينة.</p>

                <h4 className="font-semibold">6.6 سحب الموافقة</h4>
                <p>يمكنك سحب موافقتك على معالجة بياناتك في أي وقت.</p>

                <p className="mt-4 font-semibold">
                  لممارسة أي من هذه الحقوق، يرجى الاتصال بنا على: contact@preshootstudio.com
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. أمن البيانات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>نطبق تدابير أمنية فنية وتنظيمية مناسبة لحماية بياناتك الشخصية، بما في ذلك:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>التشفير أثناء النقل (TLS/SSL)</li>
                  <li>التشفير أثناء التخزين للبيانات الحساسة</li>
                  <li>ضوابط الوصول والمصادقة</li>
                  <li>عمليات التدقيق الأمني المنتظمة</li>
                  <li>تدريب الموظفين على حماية البيانات</li>
                  <li>إدارة آمنة للنسخ الاحتياطي والكوارث</li>
                </ul>
                <p>
                  على الرغم من جهودنا، لا يمكن ضمان أمان بنسبة 100%. نشجعك على استخدام كلمات مرور قوية 
                  وعدم مشاركة بيانات اعتماد حسابك.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. إشعار خرق البيانات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  في حالة حدوث خرق للبيانات يؤثر على بياناتك الشخصية، سنقوم بإخطارك وهيئة الاتصالات وتقنية 
                  المعلومات (CITRA) دون تأخير لا مبرر له ووفقاً لمتطلبات اللائحة رقم 26/2024.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. الاحتفاظ بالبيانات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  نحتفظ ببياناتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. بعد إنهاء الحساب، 
                  سنحذف أو نجعل بياناتك مجهولة المصدر في غضون فترة معقولة، ما لم يكن الاحتفاظ بها مطلوباً قانونياً.
                </p>
                <p>
                  <strong>فترات الاحتفاظ النموذجية:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>بيانات الحساب: طوال فترة نشاط الحساب + 90 يوماً</li>
                  <li>سجلات المعاملات: 7 سنوات (للامتثال الضريبي)</li>
                  <li>سجلات الاستخدام: سنة واحدة</li>
                  <li>بيانات الذكاء الاصطناعي: 30 يوماً بعد التوليد</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. ملفات تعريف الارتباط</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>نستخدم ملفات تعريف الارتباط والتقنيات المشابهة للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>ملفات تعريف ارتباط ضرورية</strong>: لوظائف الموقع الأساسية والمصادقة</li>
                  <li><strong>ملفات تعريف ارتباط التحليلات</strong>: لفهم كيفية استخدام خدماتنا</li>
                  <li><strong>ملفات تعريف ارتباط التفضيلات</strong>: لتذكر إعداداتك واختياراتك</li>
                </ul>
                <p>يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. حماية بيانات الأطفال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  خدماتنا غير موجهة للأشخاص الذين تقل أعمارهم عن 18 عاماً. لا نقوم عن قصد بجمع بيانات شخصية 
                  من الأطفال. إذا علمنا أننا جمعنا بيانات شخصية من طفل، سنتخذ خطوات لحذف هذه المعلومات.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. التغييرات على السياسة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات مادية عبر البريد 
                  الإلكتروني أو إشعار بارز على خدماتنا. استمرارك في استخدام الخدمة بعد هذه التغييرات يشكل 
                  قبولك للسياسة المحدثة.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>13. معلومات الاتصال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>
                  إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه أو ترغب في ممارسة حقوقك، يرجى الاتصال بنا:
                </p>
                <div className="space-y-2">
                  <p><strong>مسؤول حماية البيانات</strong></p>
                  <p>البريد الإلكتروني: contact@preshootstudio.com</p>
                  <p>الموقع الإلكتروني: <a href="https://preshootstudio.com" className="text-primary hover:underline">https://preshootstudio.com</a></p>
                </div>
                <p className="mt-4">
                  يمكنك أيضاً تقديم شكوى إلى <strong>هيئة الاتصالات وتقنية المعلومات (CITRA)</strong> 
                  إذا كنت تعتقد أننا لم نمتثل للائحة حماية خصوصية البيانات رقم 26/2024.
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

export default Privacy;
