import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Download, Database } from 'lucide-react';

const EXPORT_TYPES = [
  { value: 'full', label: 'تصدير كامل' },
  { value: 'research_only', label: 'البحث فقط' },
  { value: 'scripts_only', label: 'السكريبتات فقط' },
  { value: 'prompts_only', label: 'المطالبات فقط' },
  { value: 'broll_only', label: 'B-Roll فقط' },
  { value: 'curated', label: 'مخصص' },
];

const FILE_FORMATS = [
  { value: 'jsonl', label: 'JSONL (للتدريب)' },
  { value: 'json', label: 'JSON (البنية الكاملة)' },
  { value: 'csv', label: 'CSV (للتحليل)' },
];

const CONTENT_SECTIONS = [
  { id: 'research', label: 'البحث' },
  { id: 'scripts', label: 'السكريبتات' },
  { id: 'prompts', label: 'المطالبات' },
  { id: 'broll', label: 'B-Roll' },
  { id: 'article', label: 'المقال' },
  { id: 'simplify', label: 'التبسيط' },
];

export function TrainingDataExporter() {
  const [exportType, setExportType] = useState('full');
  const [fileFormat, setFileFormat] = useState('jsonl');
  const [minQuality, setMinQuality] = useState(3);
  const [selectedSections, setSelectedSections] = useState<string[]>(['research', 'scripts']);
  const [anonymize, setAnonymize] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-training-data', {
        body: {
          exportType,
          fileFormat,
          minQuality,
          selectedSections,
          anonymize,
        },
      });

      if (error) throw error;

      // Create download
      const blob = new Blob([data.content], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-data-${Date.now()}.${fileFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`تم تصدير ${data.projectCount} مشروع بنجاح`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('فشل التصدير');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          تصدير بيانات التدريب
        </CardTitle>
        <CardDescription>
          تصدير البيانات المعتمدة لتدريب النماذج وتحسينها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Type */}
        <div>
          <Label className="mb-2 block">نوع التصدير</Label>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPORT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Format */}
        <div>
          <Label className="mb-2 block">صيغة الملف</Label>
          <Select value={fileFormat} onValueChange={setFileFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILE_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality Threshold */}
        <div>
          <Label htmlFor="min-quality" className="mb-2 block">
            الحد الأدنى للجودة: {minQuality} ⭐
          </Label>
          <Input
            id="min-quality"
            type="range"
            min="1"
            max="5"
            value={minQuality}
            onChange={(e) => setMinQuality(Number(e.target.value))}
            className="cursor-pointer"
          />
        </div>

        {/* Content Sections */}
        <div>
          <Label className="mb-2 block">أقسام المحتوى</Label>
          <div className="grid grid-cols-2 gap-3">
            {CONTENT_SECTIONS.map((section) => (
              <div key={section.id} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={section.id}
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => handleSectionToggle(section.id)}
                />
                <label htmlFor={section.id} className="text-sm cursor-pointer">
                  {section.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Anonymize Option */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="anonymize"
            checked={anonymize}
            onCheckedChange={(checked) => setAnonymize(checked as boolean)}
          />
          <label htmlFor="anonymize" className="text-sm cursor-pointer">
            إخفاء هوية البيانات (إزالة معرفات المستخدمين)
          </label>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || selectedSections.length === 0}
          className="w-full"
        >
          <Download className="h-4 w-4 ml-2" />
          {isExporting ? 'جاري التصدير...' : 'تصدير البيانات'}
        </Button>

        {/* Info */}
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">ملاحظة:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>سيتم تصدير المشاريع المعتمدة فقط</li>
            <li>صيغة JSONL مناسبة لتدريب النماذج اللغوية</li>
            <li>سيتم تسجيل عمليات التصدير في سجل التدقيق</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
