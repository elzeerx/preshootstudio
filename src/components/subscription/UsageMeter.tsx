import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FolderOpen, Cpu } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export const UsageMeter = () => {
  const { limits } = useSubscription();

  const projectPercentage = (limits.projectsUsed / limits.projectLimit) * 100;
  const tokenPercentage = (limits.tokensUsed / limits.tokenLimit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>الاستخدام الشهري</CardTitle>
        <CardDescription>
          تتبع استخدامك من المشاريع والرموز المميزة
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Projects Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">المشاريع</span>
            </div>
            <span className="text-muted-foreground">
              {limits.projectsUsed} / {limits.projectLimit}
            </span>
          </div>
          <Progress value={projectPercentage} className="h-2" />
          {projectPercentage >= 80 && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              اقتربت من حد المشاريع الشهري
            </p>
          )}
        </div>

        {/* Tokens Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">الرموز المميزة</span>
            </div>
            <span className="text-muted-foreground">
              {(limits.tokensUsed / 1000).toFixed(1)}K / {(limits.tokenLimit / 1000)}K
            </span>
          </div>
          <Progress value={tokenPercentage} className="h-2" />
          {tokenPercentage >= 80 && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              اقتربت من حد الرموز المميزة الشهري
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
