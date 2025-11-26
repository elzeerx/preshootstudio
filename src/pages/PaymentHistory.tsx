import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Receipt, Download, Search, Calendar, DollarSign, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PaymentRecord {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  billing_period: string | null;
  plan_name: string | null;
  plan_slug: string | null;
  paypal_event_type: string | null;
  paypal_transaction_id: string;
}

const statusColors: Record<string, string> = {
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const eventTypeLabels: Record<string, string> = {
  'PAYMENT.SALE.COMPLETED': 'دفعة ناجحة',
  'BILLING.SUBSCRIPTION.ACTIVATED': 'تفعيل اشتراك',
  'BILLING.SUBSCRIPTION.CANCELLED': 'إلغاء اشتراك',
  'SUBSCRIPTION.PLAN_CHANGED': 'تغيير خطة',
  'BILLING.SUBSCRIPTION.SUSPENDED': 'تعليق اشتراك',
  'BILLING.SUBSCRIPTION.EXPIRED': 'انتهاء اشتراك',
};

export default function PaymentHistory() {
  const { user, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [payments, searchQuery, statusFilter, dateFilter]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data || []) as PaymentRecord[]);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error('فشل في تحميل سجل المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (payment) =>
          payment.paypal_transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.plan_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.plan_slug?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (dateFilter !== 'all') {
        filtered = filtered.filter((payment) => new Date(payment.created_at) >= filterDate);
      }
    }

    setFilteredPayments(filtered);
  };

  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    const headers = ['التاريخ', 'المبلغ', 'العملة', 'الحالة', 'الخطة', 'فترة الفوترة', 'معرف المعاملة', 'نوع الحدث'];
    const rows = filteredPayments.map((payment) => [
      format(new Date(payment.created_at), 'yyyy-MM-dd HH:mm:ss'),
      payment.amount,
      payment.currency,
      payment.status,
      payment.plan_name || '-',
      payment.billing_period || '-',
      payment.paypal_transaction_id,
      payment.paypal_event_type || '-',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `payment_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('تم تصدير البيانات بنجاح');
  };

  const exportToJSON = () => {
    if (filteredPayments.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    const jsonContent = JSON.stringify(filteredPayments, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `payment_history_${format(new Date(), 'yyyy-MM-dd')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('تم تصدير البيانات بنجاح');
  };

  const getTotalAmount = () => {
    return filteredPayments
      .filter((p) => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Breadcrumbs />
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Receipt className="w-8 h-8" />
                سجل المدفوعات
              </h1>
              <p className="text-muted-foreground">عرض جميع المعاملات والاشتراكات</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="backdrop-blur-sm bg-card/95 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المعاملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{filteredPayments.length}</div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/95 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">المعاملات الناجحة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {filteredPayments.filter((p) => p.status === 'completed').length}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/95 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  الإجمالي المدفوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" dir="ltr">
                  ${getTotalAmount().toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="backdrop-blur-sm bg-card/95 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    تصفية وبحث
                  </CardTitle>
                  <CardDescription>قم بتصفية المعاملات حسب الحالة والتاريخ</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                    <Download className="w-4 h-4" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToJSON} className="gap-2">
                    <Download className="w-4 h-4" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث بالمعرف أو اسم الخطة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="failed">فاشلة</SelectItem>
                    <SelectItem value="refunded">مستردة</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="تصفية حسب التاريخ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأوقات</SelectItem>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">آخر أسبوع</SelectItem>
                    <SelectItem value="month">آخر شهر</SelectItem>
                    <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                    <SelectItem value="year">آخر سنة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card className="backdrop-blur-sm bg-card/95 border-border/50">
            <CardHeader>
              <CardTitle>المعاملات</CardTitle>
              <CardDescription>
                {filteredPayments.length === 0
                  ? 'لا توجد معاملات'
                  : `عرض ${filteredPayments.length} معاملة`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد معاملات مطابقة للتصفية المحددة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>الخطة</TableHead>
                        <TableHead>نوع الحدث</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>فترة الفوترة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>معرف المعاملة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(new Date(payment.created_at), 'PPP', { locale: ar })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{payment.plan_name || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {eventTypeLabels[payment.paypal_event_type || ''] || payment.paypal_event_type || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold" dir="ltr">
                              ${payment.amount.toFixed(2)} {payment.currency}
                            </span>
                          </TableCell>
                          <TableCell>
                            {payment.billing_period ? (
                              <Badge variant="outline">
                                {payment.billing_period === 'yearly' ? 'سنوي' : 'شهري'}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[payment.status] || 'bg-gray-500/20 text-gray-400'}>
                              {payment.status === 'completed'
                                ? 'مكتمل'
                                : payment.status === 'pending'
                                ? 'قيد الانتظار'
                                : payment.status === 'failed'
                                ? 'فاشل'
                                : payment.status === 'refunded'
                                ? 'مسترد'
                                : payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs text-muted-foreground">
                              {payment.paypal_transaction_id.substring(0, 16)}...
                            </code>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
