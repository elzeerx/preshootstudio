import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TokenUsageChartProps {
  data: Array<{
    date: string;
    totalTokens: number;
    requestCount: number;
  }>;
}

export const TokenUsageChart = ({ data }: TokenUsageChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>استخدام الـ Tokens بمرور الوقت</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            لا توجد بيانات لعرضها
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalTokens" 
                stroke="hsl(var(--primary))" 
                name="إجمالي Tokens"
              />
              <Line 
                type="monotone" 
                dataKey="requestCount" 
                stroke="hsl(var(--secondary))" 
                name="عدد الطلبات"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
