import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { forecastTokenUsage, detectTrend } from '@/lib/helpers/usageForecasting';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Users, Search, ArrowUpDown, TrendingDown, Minus } from 'lucide-react';

interface UserAnalytics {
  user_id: string;
  email: string;
  full_name: string | null;
  total_tokens: number;
  total_cost: number;
  request_count: number;
  monthly_limit: number;
  usage_percentage: number;
  projected_monthly_cost: number;
  projected_monthly_tokens: number;
}

interface TokenUsageAnalyticsProps {
  users: Array<{
    user_id: string;
    email: string;
    full_name: string | null;
    monthly_token_limit: number;
    total_tokens: number;
    total_cost: number;
    request_count: number;
  }>;
}

type SortField = 'total_tokens' | 'total_cost' | 'projected_monthly_cost' | 'projected_monthly_tokens' | 'usage_percentage';
type SortOrder = 'asc' | 'desc';

export const TokenUsageAnalytics = ({ users }: TokenUsageAnalyticsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('total_tokens');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [forecastData, setForecastData] = useState<Array<{
    date: string;
    actual: number | null;
    forecast: number;
    lowerBound: number;
    upperBound: number;
  }>>([]);
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    return users.map(user => {
      const usagePercentage = user.monthly_token_limit > 0 
        ? (user.total_tokens / user.monthly_token_limit) * 100 
        : 0;

      // Project monthly usage based on current daily average
      const dailyAverage = user.total_tokens / dayOfMonth;
      const projectedMonthlyTokens = Math.round(dailyAverage * daysInMonth);
      const costPerToken = user.total_tokens > 0 ? user.total_cost / user.total_tokens : 0;
      const projectedMonthlyCost = projectedMonthlyTokens * costPerToken;

      return {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        total_tokens: user.total_tokens,
        total_cost: user.total_cost,
        request_count: user.request_count,
        monthly_limit: user.monthly_token_limit,
        usage_percentage: usagePercentage,
        projected_monthly_tokens: projectedMonthlyTokens,
        projected_monthly_cost: projectedMonthlyCost,
      };
    });
  }, [users]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = analyticsData.filter(user => 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [analyticsData, searchQuery, sortField, sortOrder]);

  // Top 10 consumers data for chart
  const topConsumers = useMemo(() => {
    return [...analyticsData]
      .sort((a, b) => b.total_tokens - a.total_tokens)
      .slice(0, 10)
      .map(user => ({
        name: user.full_name || user.email.split('@')[0],
        tokens: user.total_tokens,
        cost: user.total_cost,
      }));
  }, [analyticsData]);

  // Cost projection data for chart
  const costProjections = useMemo(() => {
    return [...analyticsData]
      .sort((a, b) => b.projected_monthly_cost - a.projected_monthly_cost)
      .slice(0, 10)
      .map(user => ({
        name: user.full_name || user.email.split('@')[0],
        current: user.total_cost,
        projected: user.projected_monthly_cost,
      }));
  }, [analyticsData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `$${num.toFixed(4)}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const totalProjectedCost = analyticsData.reduce((sum, user) => sum + user.projected_monthly_cost, 0);
  const totalCurrentCost = analyticsData.reduce((sum, user) => sum + user.total_cost, 0);

  // Fetch historical data and generate ML forecast
  useEffect(() => {
    const generateForecast = async () => {
      setIsLoadingForecast(true);
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: historicalData, error } = await supabase
          .from('ai_token_usage')
          .select('created_at, total_tokens')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Aggregate by day
        const dailyUsage = new Map<string, number>();
        historicalData?.forEach(record => {
          const date = new Date(record.created_at).toISOString().split('T')[0];
          dailyUsage.set(date, (dailyUsage.get(date) || 0) + record.total_tokens);
        });

        const sortedDates = Array.from(dailyUsage.keys()).sort();
        const usageValues = sortedDates.map(date => dailyUsage.get(date) || 0);

        // Generate 30-day forecast using ML
        const forecasts = forecastTokenUsage(usageValues, 30);

        // Prepare chart data
        const chartData = [];
        
        // Historical data
        sortedDates.forEach((date, index) => {
          chartData.push({
            date,
            actual: usageValues[index],
            forecast: null,
            lowerBound: null,
            upperBound: null,
          });
        });

        // Forecast data
        const lastDate = new Date(sortedDates[sortedDates.length - 1]);
        forecasts.forEach((forecast, index) => {
          const forecastDate = new Date(lastDate);
          forecastDate.setDate(forecastDate.getDate() + index + 1);
          chartData.push({
            date: forecastDate.toISOString().split('T')[0],
            actual: null,
            forecast: Math.round(forecast.predicted),
            lowerBound: Math.round(forecast.confidence.lower),
            upperBound: Math.round(forecast.confidence.upper),
          });
        });

        setForecastData(chartData);
      } catch (error) {
        console.error('Error generating forecast:', error);
      } finally {
        setIsLoadingForecast(false);
      }
    };

    generateForecast();
  }, []);

  // Calculate trend for display
  const usageTrend = useMemo(() => {
    const recentActual = forecastData
      .filter(d => d.actual !== null)
      .slice(-7)
      .map(d => d.actual!);
    return detectTrend(recentActual);
  }, [forecastData]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">إجمالي التكلفة الحالية</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentCost)}</div>
            <p className="text-xs text-muted-foreground">للشهر الحالي حتى الآن</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">التكلفة المتوقعة</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProjectedCost)}</div>
            <p className="text-xs text-muted-foreground">
              {totalProjectedCost > totalCurrentCost ? (
                <span className="text-yellow-600">
                  +{formatCurrency(totalProjectedCost - totalCurrentCost)} متوقعة
                </span>
              ) : (
                <span className="text-green-600">ضمن الحد المتوقع</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.filter(u => u.total_tokens > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              من أصل {analyticsData.length} مستخدم
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ML Forecast Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>توقعات الاستخدام بالذكاء الاصطناعي (30 يوم)</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                تحليل الاتجاهات باستخدام نماذج التعلم الآلي
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                usageTrend === 'increasing' ? 'destructive' :
                usageTrend === 'decreasing' ? 'default' : 'secondary'
              }>
                {usageTrend === 'increasing' && <TrendingUp className="w-3 h-3 mr-1" />}
                {usageTrend === 'decreasing' && <TrendingDown className="w-3 h-3 mr-1" />}
                {usageTrend === 'stable' && <Minus className="w-3 h-3 mr-1" />}
                {usageTrend === 'increasing' ? 'متزايد' : usageTrend === 'decreasing' ? 'متناقص' : 'مستقر'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingForecast ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-muted-foreground">جاري تحليل البيانات...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--foreground))"
                  style={{ fontSize: '10px' }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('ar-SA-u-nu-latn', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  style={{ fontSize: '12px' }}
                  tickFormatter={formatNumber}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('ar-SA-u-nu-latn')}
                  formatter={(value: number) => [formatNumber(value), '']}
                />
                <Legend />
                
                {/* Confidence interval area */}
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                
                {/* Upper confidence bound */}
                <Line
                  type="monotone"
                  dataKey="upperBound"
                  stroke="hsl(var(--primary))"
                  strokeWidth={0}
                  fill="url(#confidenceGradient)"
                  dot={false}
                  name="الحد الأعلى"
                  strokeOpacity={0.3}
                />
                
                {/* Lower confidence bound */}
                <Line
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="hsl(var(--primary))"
                  strokeWidth={0}
                  fill="url(#confidenceGradient)"
                  dot={false}
                  name="الحد الأدنى"
                  strokeOpacity={0.3}
                />
                
                {/* Actual usage */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="الاستخدام الفعلي"
                  dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  connectNulls={false}
                />
                
                {/* Forecast */}
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="التوقع"
                  dot={{ fill: 'hsl(var(--accent))', r: 3 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Consumers Chart */}
        <Card>
          <CardHeader>
            <CardTitle>أعلى 10 مستخدمين استهلاكاً</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topConsumers}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--foreground))"
                  style={{ fontSize: '10px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  style={{ fontSize: '12px' }}
                  tickFormatter={formatNumber}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatNumber(value)}
                />
                <Bar dataKey="tokens" fill="hsl(var(--primary))" name="Tokens" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Projections Chart */}
        <Card>
          <CardHeader>
            <CardTitle>توقعات التكلفة الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costProjections}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--foreground))"
                  style={{ fontSize: '10px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  style={{ fontSize: '12px' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="التكلفة الحالية"
                />
                <Line 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="المتوقعة"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed User Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>تحليل تفصيلي للمستخدمين</CardTitle>
            <div className="relative w-72">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('total_tokens')}
                      className="hover:bg-transparent"
                    >
                      الاستخدام الحالي
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('total_cost')}
                      className="hover:bg-transparent"
                    >
                      التكلفة الحالية
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('projected_monthly_tokens')}
                      className="hover:bg-transparent"
                    >
                      الاستخدام المتوقع
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('projected_monthly_cost')}
                      className="hover:bg-transparent"
                    >
                      التكلفة المتوقعة
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('usage_percentage')}
                      className="hover:bg-transparent"
                    >
                      النسبة
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      لا توجد بيانات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.full_name || 'غير محدد'}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{formatNumber(user.total_tokens)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(user.total_cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {formatNumber(user.projected_monthly_tokens)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={
                          user.projected_monthly_cost > user.total_cost * 1.5
                            ? 'text-yellow-600'
                            : 'text-foreground'
                        }>
                          {formatCurrency(user.projected_monthly_cost)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={
                            user.usage_percentage >= 80 ? 'destructive' :
                            user.usage_percentage >= 50 ? 'secondary' : 'default'
                          }
                        >
                          {user.usage_percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
