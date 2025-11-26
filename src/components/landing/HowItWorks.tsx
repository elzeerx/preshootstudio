import { ScrollReveal } from "./ScrollReveal";
import { Keyboard, Brain, Package } from "lucide-react";

const steps = [
  {
    icon: Keyboard,
    title: "أدخل فكرتك",
    description: "اكتب موضوع الفيديو أو المحتوى الذي تريد إنتاجه",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "الذكاء الاصطناعي يعمل",
    description: "نبحث، نحلل، ونجمع كل ما تحتاجه من معلومات وأفكار",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Package,
    title: "احصل على كل شيء",
    description: "سكريبت، B-Roll، برومبتات صور، ومقال - كل شيء جاهز للاستخدام",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="كيف-يعمل">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-premium">
              كيف يعمل PreShoot؟
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ثلاث خطوات بسيطة لتحويل فكرتك إلى محتوى احترافي
            </p>
          </div>
        </ScrollReveal>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary opacity-20" style={{ transform: "translateY(-50%)" }} />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 200} direction="up">
                <div className="relative group">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                    {index + 1}
                  </div>

                  {/* Card */}
                  <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-500 cursor-pointer border border-border/50 hover:border-primary/50">
                    <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </div>

                    <h3 className="text-2xl font-bold mb-3 text-foreground">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
