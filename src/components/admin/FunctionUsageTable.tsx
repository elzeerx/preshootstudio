import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FunctionUsage {
  functionName: string;
  requestCount: number;
  totalTokens: number;
  totalCost: number;
  avgTokensPerRequest: number;
}

export const FunctionUsageTable = ({ data }: { data: FunctionUsage[] }) => {
  const functionLabels: Record<string, string> = {
    'run-research': 'البحث',
    'run-scripts': 'السكريبتات',
    'run-article': 'المقالة',
    'run-prompts': 'البرومبتات',
    'run-broll': 'B-Roll',
    'run-simplify': 'التبسيط',
    'suggest-topics': 'اقتراح المواضيع',
    'run-export': 'التصدير',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>استخدام الـ AI حسب الوظيفة</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الوظيفة</TableHead>
              <TableHead>الطلبات</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>متوسط Tokens</TableHead>
              <TableHead>التكلفة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  لا توجد بيانات استخدام حتى الآن
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.functionName}>
                  <TableCell>
                    {functionLabels[item.functionName] || item.functionName}
                  </TableCell>
                  <TableCell>{item.requestCount.toLocaleString('ar-SA')}</TableCell>
                  <TableCell>{item.totalTokens.toLocaleString('ar-SA')}</TableCell>
                  <TableCell>{Math.round(item.avgTokensPerRequest).toLocaleString('ar-SA')}</TableCell>
                  <TableCell>${item.totalCost.toFixed(4)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
