import { Activity, DollarSign, BarChart, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenUsageStatsProps {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  successRate: number;
}

export const TokenUsageStats = ({ 
  totalTokens, 
  totalCost, 
  requestCount, 
  successRate 
}: TokenUsageStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الـ Tokens</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalTokens.toLocaleString('en-US')}
          </div>
          <p className="text-xs text-muted-foreground">
            جميع الاستخدامات
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">التكلفة التقديرية</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalCost.toFixed(4)}
          </div>
          <p className="text-xs text-muted-foreground">
            بناءً على أسعار Gemini
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">عدد الطلبات</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {requestCount.toLocaleString('en-US')}
          </div>
          <p className="text-xs text-muted-foreground">
            إجمالي الطلبات
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {successRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            نجح من {requestCount.toLocaleString('en-US')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
