-- إنشاء جدول المشاريع
-- هذا الجدول يخزن جميع مشاريع المستخدمين في PreShoot AI
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processing', 'ready')),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- السياسات: في الوقت الحالي نسمح للجميع بالقراءة والكتابة
-- لاحقاً سنضيف authentication ونربط المشاريع بالمستخدمين
CREATE POLICY "Allow all access to projects for now" 
ON public.projects 
FOR ALL 
USING (true)
WITH CHECK (true);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- إنشاء trigger لتحديث updated_at عند أي تعديل
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إضافة تعليقات توضيحية
COMMENT ON TABLE public.projects IS 'جدول المشاريع - يخزن جميع مشاريع صناع المحتوى في PreShoot AI';
COMMENT ON COLUMN public.projects.topic IS 'موضوع المشروع الذي أدخله المستخدم';
COMMENT ON COLUMN public.projects.status IS 'حالة المشروع: new (جديد) | processing (قيد المعالجة) | ready (جاهز)';
COMMENT ON COLUMN public.projects.notes IS 'ملاحظات إضافية (اختياري)';
COMMENT ON COLUMN public.projects.metadata IS 'بيانات إضافية بصيغة JSON للاستخدام المستقبلي';