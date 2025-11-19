import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const faqs = [
  {
    question: "ما هو PreShoot Studio؟",
    answer:
      "PreShoot Studio هو أداة شاملة لصنّاع المحتوى تساعدك على تحويل الأفكار إلى محتوى احترافي جاهز للنشر. من البحث المعمّق إلى كتابة السكريبتات وتخطيط B-Roll وإنشاء المقالات - كل ما تحتاجه في مكان واحد مدعوم بالذكاء الاصطناعي.",
  },
  {
    question: "هل يدعم اللغة العربية؟",
    answer:
      "نعم! PreShoot Studio مصمم بالكامل لدعم اللغة العربية مع واجهة RTL (من اليمين لليسار) احترافية. جميع الميزات تعمل بشكل ممتاز مع المحتوى العربي.",
  },
  {
    question: "كم يستغرق إنشاء المشروع؟",
    answer:
      "من الفكرة إلى المحتوى الجاهز في دقائق معدودة! بدلاً من قضاء ساعات في البحث والتخطيط، يمكنك الحصول على سكريبت كامل، خطة B-Roll، برومبتات AI، ومقال SEO جاهز في أقل من 10 دقائق.",
  },
  {
    question: "ما الفرق بين الإصدار المجاني والمدفوع؟",
    answer:
      "الإصدار المجاني يتيح لك إنشاء عدد محدود من المشاريع شهرياً مع كامل الميزات. الإصدارات المدفوعة توفر مشاريع غير محدودة، أولوية في المعالجة، ميزات متقدمة إضافية، ودعم فني مخصص.",
  },
  {
    question: "هل أحتاج خبرة تقنية للاستخدام؟",
    answer:
      "إطلاقاً! الواجهة مصممة لتكون بسيطة وسهلة الاستخدام. فقط أدخل موضوعك، واترك الباقي للذكاء الاصطناعي. لا حاجة لأي خبرة تقنية أو برمجية.",
  },
  {
    question: "كيف يمكنني البدء؟",
    answer:
      "سجّل حسابك المجاني، أنشئ مشروعك الأول بإدخال الموضوع، وانتظر بضع دقائق حتى يجهّز لك النظام كل شيء. ستحصل على بحث شامل، سكريبتات، خطط تصوير، برومبتات، ومقالات جاهزة للنشر!",
  },
];

export const FAQSection = () => {
  return (
    <Card variant="editorial" className="p-8 md:p-12">
      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border-b border-border pb-4"
          >
            <AccordionTrigger className="text-right text-lg md:text-xl font-bold text-foreground hover:text-foreground/80">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-right text-base md:text-lg text-muted-foreground leading-relaxed pt-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};
