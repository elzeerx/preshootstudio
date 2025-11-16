-- إضافة حقول البحث إلى جدول المشاريع
-- هذه الحقول تخزن حالة ونتائج البحث بالذكاء الاصطناعي

ALTER TABLE public.projects
ADD COLUMN research_status TEXT DEFAULT 'idle' CHECK (research_status IN ('idle', 'loading', 'ready', 'error')),
ADD COLUMN research_last_run_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN research_summary TEXT,
ADD COLUMN research_data JSONB;

-- إضافة تعليقات توضيحية
COMMENT ON COLUMN public.projects.research_status IS 'حالة البحث: idle (لم يبدأ) | loading (قيد التنفيذ) | ready (جاهز) | error (خطأ)';
COMMENT ON COLUMN public.projects.research_last_run_at IS 'آخر مرة تم فيها تجهيز البحث';
COMMENT ON COLUMN public.projects.research_summary IS 'ملخص مختصر للبحث بالعربية';
COMMENT ON COLUMN public.projects.research_data IS 'البيانات الكاملة للبحث بصيغة JSON منظمة';