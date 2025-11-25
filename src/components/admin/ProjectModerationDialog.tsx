import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ProjectContentViewer } from './ProjectContentViewer';
import { analyzeProjectContent, CONTENT_FLAG_LABELS } from '@/lib/helpers/contentAnalysis';
import { Star } from 'lucide-react';
import type { ProjectDetail } from '@/hooks/useProjectDetail';

interface ProjectModerationDialogProps {
  project: ProjectDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModerationComplete: () => void;
}

const MODERATION_STATUSES = [
  { value: 'pending', label: 'قيد المراجعة', variant: 'secondary' as const },
  { value: 'approved', label: 'موافق عليه', variant: 'default' as const },
  { value: 'flagged', label: 'محدد', variant: 'destructive' as const },
  { value: 'rejected', label: 'مرفوض', variant: 'outline' as const },
];

const TRAINING_TAGS = [
  'research', 'scripts', 'creative_writing', 'technical', 'educational',
  'entertainment', 'business', 'science', 'technology', 'health'
];

export function ProjectModerationDialog({
  project,
  open,
  onOpenChange,
  onModerationComplete,
}: ProjectModerationDialogProps) {
  const [moderationStatus, setModerationStatus] = useState<string>('pending');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [qualityRating, setQualityRating] = useState<number>(3);
  const [trainingEligible, setTrainingEligible] = useState(false);
  const [selectedTrainingTags, setSelectedTrainingTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFlagToggle = (flag: string) => {
    setSelectedFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  const handleTrainingTagToggle = (tag: string) => {
    setSelectedTrainingTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if moderation record exists
      const { data: existing } = await supabase
        .from('project_moderation')
        .select('id')
        .eq('project_id', project.id)
        .maybeSingle();

      const moderationData = {
        project_id: project.id,
        moderated_by: user.id,
        moderation_status: moderationStatus,
        content_flags: selectedFlags,
        quality_rating: qualityRating,
        training_eligible: trainingEligible,
        training_tags: selectedTrainingTags,
        notes,
        moderated_at: new Date().toISOString(),
      };

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('project_moderation')
          .update(moderationData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('project_moderation')
          .insert(moderationData);

        if (error) throw error;
      }

      toast.success('تم حفظ المراجعة بنجاح');
      onModerationComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving moderation:', error);
      toast.error('فشل حفظ المراجعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoAnalyze = () => {
    if (!project) return;
    
    const analysis = analyzeProjectContent(project);
    setSelectedFlags(analysis.potentialFlags);
    setQualityRating(analysis.qualityScore);
    
    toast.info(`تم الكشف عن ${analysis.potentialFlags.length} علامات محتملة`);
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>مراجعة المشروع: {project.topic}</DialogTitle>
          <DialogDescription>
            معرف المشروع: {project.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Viewer */}
          <div>
            <Label className="mb-2 block">محتوى المشروع</Label>
            <ProjectContentViewer project={project} />
          </div>

          {/* Auto-analyze button */}
          <Button onClick={handleAutoAnalyze} variant="outline" className="w-full">
            تحليل تلقائي للمحتوى
          </Button>

          {/* Moderation Status */}
          <div>
            <Label className="mb-2 block">حالة المراجعة</Label>
            <div className="flex gap-2">
              {MODERATION_STATUSES.map((status) => (
                <Badge
                  key={status.value}
                  variant={moderationStatus === status.value ? status.variant : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setModerationStatus(status.value)}
                >
                  {status.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Flags */}
          <div>
            <Label className="mb-2 block">علامات المحتوى</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CONTENT_FLAG_LABELS).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={key}
                    checked={selectedFlags.includes(key)}
                    onCheckedChange={() => handleFlagToggle(key)}
                  />
                  <label htmlFor={key} className="text-sm cursor-pointer">
                    {value.ar}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Rating */}
          <div>
            <Label className="mb-2 block">تقييم الجودة</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setQualityRating(rating)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 ${
                      rating <= qualityRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Training Eligible */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="training-eligible"
              checked={trainingEligible}
              onCheckedChange={(checked) => setTrainingEligible(checked as boolean)}
            />
            <label htmlFor="training-eligible" className="text-sm cursor-pointer">
              مؤهل لبيانات التدريب
            </label>
          </div>

          {/* Training Tags */}
          {trainingEligible && (
            <div>
              <Label className="mb-2 block">علامات التدريب</Label>
              <div className="flex flex-wrap gap-2">
                {TRAINING_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTrainingTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTrainingTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="mb-2 block">ملاحظات المراجعة</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف ملاحظاتك هنا..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ المراجعة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
