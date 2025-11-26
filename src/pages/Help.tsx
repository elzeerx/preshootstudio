import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail } from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">مركز المساعدة</h1>
          <p className="text-muted-foreground text-center mb-12">
            نحن هنا لمساعدتك في الاستفادة القصوى من Preshoot Studio
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>البدء مع Preshoot Studio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <h4 className="font-semibold">كيف أبدأ؟</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>قم بطلب الوصول من خلال صفحة "طلب الوصول"</li>
                  <li>انتظر موافقة الإدارة ودعوة عبر البريد الإلكتروني</li>
                  <li>انقر على رابط الدعوة لإنشاء حسابك</li>
                  <li>قم بتسجيل الدخول وابدأ في إنشاء مشاريعك الأولى</li>
                </ol>

                <h4 className="font-semibold mt-6">إنشاء المشروع الأول</h4>
                <p>
                  بعد تسجيل الدخول، انقر على "إنشاء مشروع جديد" واختر نوع المحتوى (معلوماتي، إبداعي، شخصي، أو رأي).
                  أدخل موضوع المشروع وابدأ في استخدام أدوات الذكاء الاصطناعي لإنشاء المحتوى.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إدارة المشاريع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <h4 className="font-semibold">أنواع المحتوى</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>معلوماتي (Factual)</strong>: للمحتوى القائم على البحث والحقائق</li>
                  <li><strong>إبداعي (Creative)</strong>: للترفيه والفلوقات والألعاب والمراجعات</li>
                  <li><strong>شخصي (Personal)</strong>: لأسلوب الحياة والتجارب الشخصية</li>
                  <li><strong>رأي (Opinion)</strong>: للآراء والتحليلات الشخصية</li>
                </ul>

                <h4 className="font-semibold mt-6">حدود المشاريع</h4>
                <p>تعتمد حدود المشاريع على باقة اشتراكك:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Free</strong>: 5 مشاريع شهرياً</li>
                  <li><strong>Creator</strong>: 25 مشروع شهرياً</li>
                  <li><strong>Pro</strong>: 100 مشروع شهرياً</li>
                  <li><strong>Studio</strong>: 999 مشروع شهرياً</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أدوات إنشاء المحتوى</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <h4 className="font-semibold">علامات التبويب المتاحة</h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold">1. البحث (Research)</h5>
                    <p>يقوم بإجراء بحث معمق حول موضوعك ويجمع المعلومات والإحصاءات ذات الصلة.</p>
                  </div>

                  <div>
                    <h5 className="font-semibold">2. النصوص (Scripts)</h5>
                    <p>ينشئ نصوص فيديو احترافية بناءً على البحث والموضوع.</p>
                  </div>

                  <div>
                    <h5 className="font-semibold">3. B-Roll</h5>
                    <p>يقترح أفكار لقطات B-roll ومشاهد داعمة لتعزيز الفيديو الخاص بك.</p>
                  </div>

                  <div>
                    <h5 className="font-semibold">4. Prompts</h5>
                    <p>ينشئ أوامر لإنشاء الصور باستخدام الذكاء الاصطناعي لخدمات مثل Midjourney و FLUX.</p>
                  </div>

                  <div>
                    <h5 className="font-semibold">5. المقال (Article)</h5>
                    <p>يحول المحتوى الخاص بك إلى مقال مكتوب كامل.</p>
                  </div>

                  <div>
                    <h5 className="font-semibold">6. التبسيط (Simplify)</h5>
                    <p>يبسط المحتوى المعقد ليجعله أكثر سهولة في الفهم.</p>
                  </div>

                  <div>
                    <h5 className="font-semibold">7. التصدير (Export)</h5>
                    <p>يصدر جميع محتوى مشروعك بتنسيق واحد منظم. (متاح في الباقات المدفوعة فقط)</p>
                  </div>
                </div>

                <h4 className="font-semibold mt-6">حدود إعادة التوليد (Redo)</h4>
                <p>يمكنك إعادة توليد المحتوى في كل علامة تبويب:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Free</strong>: إعادة واحدة لكل علامة تبويب لكل مشروع</li>
                  <li><strong>Creator</strong>: 5 إعادات لكل علامة تبويب</li>
                  <li><strong>Pro</strong>: 15 إعادة لكل علامة تبويب</li>
                  <li><strong>Studio</strong>: 99 إعادة لكل علامة تبويب</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الاشتراكات والفوترة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <h4 className="font-semibold">الباقات المتاحة</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Free</strong>: 5 مشاريع، 50,000 توكن، بدون تصدير</li>
                  <li><strong>Creator ($19/شهر)</strong>: 25 مشروع، 250,000 توكن، تصدير</li>
                  <li><strong>Pro ($49/شهر)</strong>: 100 مشروع، 750,000 توكن، دعم أولوية</li>
                  <li><strong>Studio ($149/شهر)</strong>: 999 مشروع، 3,000,000 توكن، وصول API</li>
                </ul>

                <h4 className="font-semibold mt-6">الدفع</h4>
                <p>نقبل الدفع عبر PayPal بالدولار الأمريكي (USD). يمكنك الاختيار بين الفوترة الشهرية أو السنوية.</p>

                <h4 className="font-semibold mt-6">ترقية أو تخفيض الباقة</h4>
                <p>
                  يمكنك ترقية أو تخفيض باقتك في أي وقت من صفحة "الملف الشخصي". عند الترقية، سيتم محاسبتك 
                  على الفرق المتبقي. عند التخفيض، سيتم تطبيق التغيير في دورة الفوترة التالية.
                </p>

                <h4 className="font-semibold mt-6">الإلغاء</h4>
                <p>
                  يمكنك إلغاء اشتراكك في أي وقت من إعدادات حسابك. ستظل لديك إمكانية الوصول حتى نهاية 
                  فترة الفوترة الحالية.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الأسئلة الشائعة</CardTitle>
              </CardHeader>
              <CardContent className="text-right">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-right">ما هو التوكن (Token)؟</AccordionTrigger>
                    <AccordionContent className="text-right">
                      التوكن هو وحدة قياس لاستخدام الذكاء الاصطناعي. كل طلب إلى الذكاء الاصطناعي يستهلك عدداً من التوكنز بناءً على 
                      طول وتعقيد المحتوى المُولَّد. تتضمن كل باقة حصة شهرية من التوكنز.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-right">هل يمكنني استخدام المحتوى المُولَّد تجارياً؟</AccordionTrigger>
                    <AccordionContent className="text-right">
                      نعم، أنت تمتلك المحتوى الذي تنشئه باستخدام Preshoot Studio. ومع ذلك، نوصي بشدة بمراجعة والتحقق 
                      من أي محتوى مُولَّد بواسطة الذكاء الاصطناعي قبل استخدامه تجارياً لضمان الدقة والملاءمة.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-right">ما هو الفرق بين أنواع المحتوى المختلفة؟</AccordionTrigger>
                    <AccordionContent className="text-right">
                      المحتوى المعلوماتي (Factual) يركز على البحث والحقائق، بينما المحتوى الإبداعي (Creative) يركز على 
                      الترفيه والإبداع. المحتوى الشخصي (Personal) يتعلق بالتجارب الشخصية، والمحتوى الرأي (Opinion) 
                      يقدم وجهات نظر وتحليلات. اختر النوع الذي يناسب مشروعك للحصول على أفضل النتائج.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-right">لماذا لا يمكنني التصدير؟</AccordionTrigger>
                    <AccordionContent className="text-right">
                      ميزة التصدير متاحة فقط للباقات المدفوعة (Creator، Pro، Studio). قم بالترقية لإلغاء قفل هذه الميزة.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-right">كيف يتم حساب حدود المشاريع؟</AccordionTrigger>
                    <AccordionContent className="text-right">
                      تتجدد حدود المشاريع الشهرية في بداية كل دورة فوترة. إذا كانت لديك باقة Free، تحصل على 5 مشاريع جديدة 
                      في بداية كل شهر. المشاريع الحالية تبقى، ولكن لا يمكنك إنشاء مشاريع جديدة حتى تتجدد حصتك.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-right">هل بياناتي آمنة؟</AccordionTrigger>
                    <AccordionContent className="text-right">
                      نعم، نأخذ أمان البيانات على محمل الجد. نحن نمتثل للائحة حماية خصوصية البيانات رقم 26/2024 الصادرة 
                      عن هيئة الاتصالات وتقنية المعلومات في الكويت. يتم تشفير جميع البيانات أثناء النقل والتخزين، ولا نشارك 
                      بياناتك مع أطراف ثالثة دون موافقتك.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التواصل معنا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-right">
                <p>لم تجد إجابة لسؤالك؟ نحن هنا للمساعدة!</p>
                
                <div className="flex items-center justify-end gap-2 text-primary">
                  <span className="font-semibold">contact@preshootstudio.com</span>
                  <Mail className="h-5 w-5" />
                </div>

                <p className="text-sm text-muted-foreground">
                  نسعى للرد على جميع الاستفسارات خلال 24-48 ساعة (مستخدمو Pro و Studio يحصلون على دعم أولوية).
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

export default Help;
