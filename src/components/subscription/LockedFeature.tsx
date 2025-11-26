import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LockedFeatureProps {
  title: string;
  description: string;
  onUpgrade: () => void;
}

export const LockedFeature = ({ title, description, onUpgrade }: LockedFeatureProps) => {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="text-center">
        <Button onClick={onUpgrade} size="lg" className="gap-2">
          <Zap className="w-4 h-4" />
          قم بالترقية للاستخدام
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          ابدأ من $19/شهر فقط
        </p>
      </CardContent>
    </Card>
  );
};
