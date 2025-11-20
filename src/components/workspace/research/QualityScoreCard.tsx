import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { getQualityLabel, getQualityVariant } from "@/lib/helpers/researchQuality";

interface QualityScoreCardProps {
  score?: number | null;
  metrics?: {
    sourceCount: number;
    sourceDiversity: number;
    recencyScore: number;
    overallScore: number;
  } | null;
}

export const QualityScoreCard = ({ score, metrics }: QualityScoreCardProps) => {
  if (!score || !metrics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            جودة البحث
          </div>
          <Badge variant={getQualityVariant(score)}>
            {getQualityLabel(score)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">{score}</div>
          <div className="text-sm text-muted-foreground">من 100</div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{metrics.sourceCount}</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                عدد المصادر
              </span>
            </div>
            <Progress value={(metrics.sourceCount / 40) * 100} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{metrics.sourceDiversity}</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                تنوع المصادر
              </span>
            </div>
            <Progress value={(metrics.sourceDiversity / 30) * 100} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{metrics.recencyScore}</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                حداثة المعلومات
              </span>
            </div>
            <Progress value={(metrics.recencyScore / 30) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
