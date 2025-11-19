import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Users, 
  Mail, 
  Trash2, 
  CheckCircle, 
  XCircle,
  FolderOpen,
  Activity,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

interface BetaSignup {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface Project {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  user_id: string;
}

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalBetaSignups: number;
  pendingSignups: number;
  approvedSignups: number;
  activeProjects: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [signups, setSignups] = useState<BetaSignup[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProjects: 0,
    totalBetaSignups: 0,
    pendingSignups: 0,
    approvedSignups: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch beta signups
      const { data: signupsData, error: signupsError } = await supabase
        .from('beta_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (signupsError) throw signupsError;
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      setSignups(signupsData || []);
      setUsers(usersData || []);
      setProjects(projectsData || []);

      // Calculate stats
      const pendingCount = signupsData?.filter(s => s.status === 'pending').length || 0;
      const approvedCount = signupsData?.filter(s => s.status === 'approved').length || 0;
      const activeProjectsCount = projectsData?.filter(p => p.status !== 'completed').length || 0;

      setStats({
        totalUsers: usersData?.length || 0,
        totalProjects: projectsData?.length || 0,
        totalBetaSignups: signupsData?.length || 0,
        pendingSignups: pendingCount,
        approvedSignups: approvedCount,
        activeProjects: activeProjectsCount
      });

    } catch (error) {
      console.error('Error fetching data:', error);
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
      
      // Update stats
      const pendingCount = signups.filter(s => 
        s.id === id ? newStatus === 'pending' : s.status === 'pending'
      ).length;
      const approvedCount = signups.filter(s => 
        s.id === id ? newStatus === 'approved' : s.status === 'approved'
      ).length;
      
      setStats(prev => ({
        ...prev,
        pendingSignups: pendingCount,
        approvedSignups: approvedCount
      }));

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
      setStats(prev => ({
        ...prev,
        totalBetaSignups: prev.totalBetaSignups - 1
      }));
      toast.success('تم حذف الطلب بنجاح');
    } catch (error) {
      console.error('Error deleting signup:', error);
      toast.error('حدث خطأ في حذف الطلب');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-accent text-accent-foreground">تمت الموافقة</Badge>;
      case 'notified':
        return <Badge className="bg-secondary text-secondary-foreground">تم الإشعار</Badge>;
      default:
        return <Badge variant="outline">قيد الانتظار</Badge>;
    }
  };

  // Chart data
  const signupStatusData = [
    { name: 'قيد الانتظار', value: stats.pendingSignups, color: 'hsl(var(--muted))' },
    { name: 'تمت الموافقة', value: stats.approvedSignups, color: 'hsl(var(--accent))' },
  ];

  const projectStatusData = projects.reduce((acc, project) => {
    const existing = acc.find(item => item.status === project.status);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ status: project.status, count: 1 });
    }
    return acc;
  }, [] as { status: string; count: number }[]);

  // User growth data (last 7 days)
  const userGrowthData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const count = users.filter(u => u.created_at.split('T')[0] === dateStr).length;
    return {
      date: format(date, 'dd MMM', { locale: ar }),
      users: count
    };
  });

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-accent" strokeWidth={1.5} />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              لوحة التحكم
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            إحصائيات وبيانات شاملة عن المنصة
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">
                إجمالي المستخدمين
              </CardTitle>
              <Users className="w-5 h-5 text-button-primary" strokeWidth={2} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground text-right">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                مستخدم مسجل
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">
                المشاريع
              </CardTitle>
              <FolderOpen className="w-5 h-5 text-button-primary" strokeWidth={2} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground text-right">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {stats.activeProjects} نشط
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">
                طلبات Beta
              </CardTitle>
              <Mail className="w-5 h-5 text-button-primary" strokeWidth={2} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground text-right">{stats.totalBetaSignups}</div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {stats.pendingSignups} قيد المراجعة
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">
                الموافقات
              </CardTitle>
              <UserCheck className="w-5 h-5 text-button-primary" strokeWidth={2} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground text-right">{stats.approvedSignups}</div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                طلب تمت الموافقة عليه
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Signup Status Chart */}
          <Card variant="subtle">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                حالة طلبات Beta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={signupStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="hsl(var(--accent))"
                    dataKey="value"
                  >
                    {signupStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth Chart */}
          <Card variant="subtle">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                نمو المستخدمين (آخر 7 أيام)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '2px solid hsl(var(--foreground))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="مستخدمين جدد"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Project Status Chart */}
        {projectStatusData.length > 0 && (
          <Card variant="subtle" className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                توزيع المشاريع حسب الحالة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="status" 
                    stroke="hsl(var(--foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '2px solid hsl(var(--foreground))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--secondary))" name="عدد المشاريع" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Beta Signups Table */}
        <Card variant="editorial">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Mail className="w-6 h-6 text-accent" strokeWidth={1.5} />
              طلبات الانضمام للنسخة التجريبية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-foreground overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-right font-bold">الاسم</TableHead>
                    <TableHead className="text-right font-bold">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right font-bold">الحالة</TableHead>
                    <TableHead className="text-right font-bold">تاريخ التسجيل</TableHead>
                    <TableHead className="text-right font-bold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا توجد طلبات بعد
                      </TableCell>
                    </TableRow>
                  ) : (
                    signups.map((signup) => (
                      <TableRow key={signup.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium">{signup.name}</TableCell>
                        <TableCell className="font-mono text-sm">{signup.email}</TableCell>
                        <TableCell>{getStatusBadge(signup.status)}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(signup.created_at), 'dd MMMM yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            {signup.status !== 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(signup.id, 'approved')}
                                className="gap-2"
                              >
                                <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                                موافقة
                              </Button>
                            )}
                            {signup.status !== 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(signup.id, 'pending')}
                                className="gap-2"
                              >
                                <XCircle className="w-4 h-4" strokeWidth={1.5} />
                                إلغاء
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteSignup(signup.id)}
                              className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                              حذف
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users Table */}
        <Card variant="editorial" className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-6 h-6 text-accent" strokeWidth={1.5} />
              المستخدمون الجدد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-foreground overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-right font-bold">الاسم الكامل</TableHead>
                    <TableHead className="text-right font-bold">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right font-bold">تاريخ التسجيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        لا يوجد مستخدمون بعد
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.slice(0, 10).map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium">
                          {user.full_name || 'غير محدد'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{user.email}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(user.created_at), 'dd MMMM yyyy', { locale: ar })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects Table */}
        <Card variant="editorial" className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-secondary" strokeWidth={1.5} />
              المشاريع الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-foreground overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-right font-bold">الموضوع</TableHead>
                    <TableHead className="text-right font-bold">الحالة</TableHead>
                    <TableHead className="text-right font-bold">تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        لا توجد مشاريع بعد
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.slice(0, 10).map((project) => (
                      <TableRow key={project.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium">{project.topic}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{project.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(project.created_at), 'dd MMMM yyyy', { locale: ar })}
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
    </div>
  );
}
