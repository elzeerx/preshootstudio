import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  description?: string;
}

export const UpgradeModal = ({ 
  open, 
  onOpenChange, 
  feature = 'هذه الميزة', 
  description 
}: UpgradeModalProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-primary" />
            <DialogTitle>قم بالترقية للاستمرار</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {description || `${feature} متاحة فقط في الخطط المدفوعة. قم بالترقية للاستمتاع بإمكانيات غير محدودة.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">مزايا الترقية:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• المزيد من المشاريع الشهرية</li>
              <li>• إعادة توليد غير محدودة</li>
              <li>• تصدير جميع الملفات</li>
              <li>• دعم فني ذو أولوية</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpgrade} className="flex-1">
              عرض الخطط
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
