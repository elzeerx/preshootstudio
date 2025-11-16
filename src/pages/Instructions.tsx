import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

const Instructions = () => {
  const instructions = [
    {
      id: 1,
      text: "لا تقم بتنفيذ أكثر من مهمة أو Feature رئيسي في نفس الوقت",
      category: "workflow"
    },
    {
      id: 2,
      text: "حافظ على أن اللغة الأساسية للمستخدم هي العربية والـ RTL",
      category: "design"
    },
    {
      id: 3,
      text: "لا تغيّر README و LOG إلا عند طلب صريح مني بإضافة بند جديد",
      category: "documentation"
    },
    {
      id: 4,
      text: "استخدم دائمًا نفس Design System والألوان المعرفة",
      category: "design"
    },
    {
      id: 5,
      text: "عندما نطلب ميزة جديدة، أنشئ خطة مختصرة في الكود أو في LOG قبل التنفيذ (Planning)",
      category: "workflow"
    },
    {
      id: 6,
      text: "استخدم semantic tokens من index.css بدلاً من الألوان المباشرة",
      category: "design"
    },
    {
      id: 7,
      text: "جميع API Keys يتم إدارتها عبر environment variables في Lovable",
      category: "security"
    },
    {
      id: 8,
      text: "اكتب التعليقات في الكود بالإنجليزية، والـ UI بالعربية",
      category: "coding"
    }
  ];

  const categoryColors = {
    workflow: "bg-primary/10 text-primary border-primary/20",
    design: "bg-secondary/10 text-secondary-foreground border-secondary/20",
    documentation: "bg-accent-green/10 text-accent-green border-accent-green/20",
    security: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
    coding: "bg-accent/10 text-accent border-accent/20"
  };

  const categoryLabels = {
    workflow: "سير العمل",
    design: "التصميم",
    documentation: "التوثيق",
    security: "الأمان",
    coding: "البرمجة"
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="heading-1 mb-4">تعليمات المشروع</h1>
          <p className="body-text-secondary max-w-2xl mx-auto">
            هذه التعليمات موجهة لمساعد Lovable للحفاظ على اتساق المشروع وجودة العمل
          </p>
        </div>

        {/* Project Info Card */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h2 className="heading-3 mb-3">PreShoot AI</h2>
          <p className="body-text mb-4">
            مساعدك الشخصي قبل التصوير وبعده - منصة شاملة لمساعدة صناع المحتوى العرب
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-accent-green" />
            <span>نعمل بمبدأ مهام صغيرة متتالية (Step-by-Step)</span>
          </div>
        </Card>

        {/* Instructions List */}
        <div className="space-y-4 mb-8">
          <h2 className="heading-2 mb-6">القواعد الأساسية</h2>
          {instructions.map((instruction) => (
            <Card 
              key={instruction.id} 
              className={`p-5 transition-all hover:shadow-md border-2 ${
                categoryColors[instruction.category as keyof typeof categoryColors]
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center font-bold">
                    {instruction.id}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="body-text font-medium mb-2">
                    {instruction.text}
                  </p>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-background">
                    {categoryLabels[instruction.category as keyof typeof categoryLabels]}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Design System Reference */}
        <Card className="p-6 bg-muted/50">
          <h3 className="heading-3 mb-4">مرجع Design System</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-foreground">الألوان الأساسية</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary"></div>
                  <span className="text-muted-foreground">Primary - #4C6FFF</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-secondary"></div>
                  <span className="text-muted-foreground">Secondary - #FFC857</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-accent-green"></div>
                  <span className="text-muted-foreground">Accent Green - #22C55E</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-accent-orange"></div>
                  <span className="text-muted-foreground">Accent Orange - #F97316</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">الخطوط</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• الخط الأساسي: IBM Plex Sans Arabic</p>
                <p>• Fallback: Inter</p>
                <p>• الاتجاه: RTL (من اليمين لليسار)</p>
              </div>
              
              <h4 className="font-semibold mb-3 mt-6 text-foreground">التكامل مع AI</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• OpenAI GPT-5</p>
                <p>• Anthropic Claude</p>
                <p>• API Keys في Environment Variables</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="body-text-secondary text-sm">
            📚 للمزيد من التفاصيل، راجع <code className="bg-muted px-2 py-1 rounded">README.md</code> و <code className="bg-muted px-2 py-1 rounded">docs/LOG.md</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
