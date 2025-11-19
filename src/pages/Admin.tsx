import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCog, Mail, Calendar, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BetaSignup {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [signups, setSignups] = useState<BetaSignup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchSignups();
    }
  }, [isAdmin]);

  const fetchSignups = async () => {
    try {
      const { data, error } = await supabase
        .from('beta_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignups(data || []);
    } catch (error) {
      console.error('Error fetching signups:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('beta_signups')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setSignups(signups.map(signup => 
        signup.id === id ? { ...signup, status: newStatus } : signup
      ));
      toast.success('تم تحديث الحالة بنجاح');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('حدث خطأ في تحديث الحالة');
    }
  };

  const deleteSignup = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      const { error } = await supabase
        .from('beta_signups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSignups(signups.filter(signup => signup.id !== id));
      toast.success('تم حذف الطلب بنجاح');
    } catch (error) {
      console.error('Error deleting signup:', error);
      toast.error('حدث خطأ في حذف الطلب');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">تمت الموافقة</Badge>;
      case 'notified':
        return <Badge className="bg-blue-500 text-white">تم الإشعار</Badge>;
      default:
        return <Badge variant="secondary">قيد الانتظار</Badge>;
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/20" dir="rtl">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <UserCog className="w-8 h-8" />
            <h1 className="text-4xl font-black">لوحة التحكم - Admin</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            إدارة طلبات الوصول المبكر لـ PreShoot Studio
          </p>
        </div>

        <Card variant="editorial" className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              إحصائيات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-2">
                  {signups.length}
                </div>
                <div className="text-muted-foreground">إجمالي الطلبات</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-green-600 mb-2">
                  {signups.filter(s => s.status === 'approved').length}
                </div>
                <div className="text-muted-foreground">تمت الموافقة</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-orange-600 mb-2">
                  {signups.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-muted-foreground">قيد الانتظار</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="editorial">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Mail className="w-6 h-6" />
              طلبات الوصول المبكر
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد طلبات حتى الآن
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right font-bold">الاسم</TableHead>
                      <TableHead className="text-right font-bold">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right font-bold">التاريخ</TableHead>
                      <TableHead className="text-right font-bold">الحالة</TableHead>
                      <TableHead className="text-right font-bold">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signups.map((signup) => (
                      <TableRow key={signup.id}>
                        <TableCell className="font-medium">{signup.name}</TableCell>
                        <TableCell>{signup.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(signup.created_at), 'PPP', { locale: ar })}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(signup.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {signup.status !== 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(signup.id, 'approved')}
                                className="gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                موافقة
                              </Button>
                            )}
                            {signup.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(signup.id, 'notified')}
                                className="gap-2"
                              >
                                <Mail className="w-4 h-4" />
                                تم الإشعار
                              </Button>
                            )}
                            {signup.status !== 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(signup.id, 'pending')}
                                className="gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                إلغاء
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSignup(signup.id)}
                              className="gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                              حذف
                            </Button>
                          </div>
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
    </div>
  );
}
