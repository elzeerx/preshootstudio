import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AdminStats } from '@/components/admin/AdminStats';
import { BetaSignupsTable } from '@/components/admin/BetaSignupsTable';
import { TokenUsageStats } from '@/components/admin/TokenUsageStats';
import { FunctionUsageTable } from '@/components/admin/FunctionUsageTable';
import { TokenUsageChart } from '@/components/admin/TokenUsageChart';
import { AppHeader } from '@/components/common/AppHeader';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { AppFooter } from '@/components/common/AppFooter';
import { 
  Loader2, 
  Users, 
  Mail, 
  Trash2, 
  CheckCircle, 
  XCircle,
  FolderOpen,
  Activity,
  UserCheck,
  Shield,
  Lock,
  ArrowRight
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

interface TokenUsage {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  successRate: number;
  byFunction: Array<{
    functionName: string;
    requestCount: number;
    totalTokens: number;
    totalCost: number;
    avgTokensPerRequest: number;
  }>;
  overTime: Array<{
    date: string;
    totalTokens: number;
    requestCount: number;
  }>;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
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
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({
    totalTokens: 0,
    totalCost: 0,
    requestCount: 0,
    successRate: 0,
    byFunction: [],
    overTime: [],
  });
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (user && !roleLoading && isAdmin) {
      fetchAllData();
    } else if (!roleLoading && user && !isAdmin) {
      toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
      navigate('/');
    }
  }, [user, isAdmin, roleLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoginLoading(true);

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        toast.error('خطأ في تسجيل الدخول. تحقق من بياناتك.');
        setLoginLoading(false);
        return;
      }

      // Wait for auth state to update and check admin role
      setTimeout(async () => {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .maybeSingle();
        
        if (roleData?.role === 'admin') {
          toast.success('مرحباً بك في لوحة التحكم');
        } else {
          toast.error('ليس لديك صلاحيات الوصول إلى لوحة التحكم');
          setLoginLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول');
      setLoginLoading(false);
    }
  };

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

      // Fetch token usage data
      const { data: usageData } = await supabase
        .from('ai_token_usage')
        .select('*')
        .order('created_at', { ascending: false });

      if (usageData && usageData.length > 0) {
        // Calculate aggregated stats
        const totalTokens = usageData.reduce((sum, u) => sum + u.total_tokens, 0);
        const totalCost = usageData.reduce((sum, u) => sum + (u.estimated_cost_usd || 0), 0);
        const successCount = usageData.filter(u => u.request_status === 'success').length;
        
        // Group by function
        const functionMap: Record<string, any> = {};
        usageData.forEach(u => {
          if (!functionMap[u.function_name]) {
            functionMap[u.function_name] = {
              functionName: u.function_name,
              requestCount: 0,
              totalTokens: 0,
              totalCost: 0,
            };
          }
          functionMap[u.function_name].requestCount++;
          functionMap[u.function_name].totalTokens += u.total_tokens;
          functionMap[u.function_name].totalCost += u.estimated_cost_usd || 0;
        });

        const byFunction = Object.values(functionMap).map((item: any) => ({
          ...item,
          avgTokensPerRequest: item.totalTokens / item.requestCount,
        }));

        // Group by date for chart
        const dateMap: Record<string, any> = {};
        usageData.forEach(u => {
          const date = format(new Date(u.created_at), 'yyyy-MM-dd');
          if (!dateMap[date]) {
            dateMap[date] = { date, totalTokens: 0, requestCount: 0 };
          }
          dateMap[date].totalTokens += u.total_tokens;
          dateMap[date].requestCount++;
        });

        const overTime = Object.values(dateMap).sort((a: any, b: any) => 
          a.date.localeCompare(b.date)
        );

        setTokenUsage({
          totalTokens,
          totalCost,
          requestCount: usageData.length,
          successRate: usageData.length > 0 ? (successCount / usageData.length) * 100 : 0,
          byFunction,
          overTime,
        });
      }

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

  // Show loading state
  if (roleLoading || (user && isAdmin && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  // Show login form if not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8 animate-fadeInUp">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-lg mb-4 shadow-editorial">
              <Shield className="w-12 h-12 text-accent-foreground" />
            </div>
            <h1 className="text-4xl font-black mb-2">
              لوحة التحكم
            </h1>
            <p className="text-muted-foreground text-lg">
              PreShoot Studio - Admin Access
            </p>
          </div>

          {/* Login Card */}
          <Card variant="editorial" className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <Lock className="w-6 h-6" />
                تسجيل دخول المسؤول
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-bold">
                    البريد الإلكتروني
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@preshoot.studio"
                      className="pr-10 h-12 text-lg border-2 border-foreground/20 focus:border-foreground transition-colors"
                      disabled={loginLoading}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-bold">
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10 h-12 text-lg border-2 border-foreground/20 focus:border-foreground transition-colors"
                      disabled={loginLoading}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-bold gap-2"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      دخول لوحة التحكم
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 border-muted">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-bold text-foreground mb-1">
                      تنبيه أمني
                    </p>
                    <p>
                      هذه الصفحة مخصصة للمسؤولين فقط. سيتم تسجيل جميع محاولات الدخول غير المصرح بها.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home Link */}
          <div className="text-center mt-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              العودة إلى الصفحة الرئيسية
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <p>© 2025 PreShoot Studio. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <AppHeader />
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs />
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
        <AdminStats stats={stats} />

        {/* Token Usage Section */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">استخدام الـ AI و Tokens</h2>
          </div>
          
          <TokenUsageStats 
            totalTokens={tokenUsage.totalTokens}
            totalCost={tokenUsage.totalCost}
            requestCount={tokenUsage.requestCount}
            successRate={tokenUsage.successRate}
          />
          
          <div className="grid gap-6 md:grid-cols-2">
            <FunctionUsageTable data={tokenUsage.byFunction} />
            <TokenUsageChart data={tokenUsage.overTime} />
          </div>
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
        <BetaSignupsTable
          signups={signups}
          onUpdateStatus={updateStatus}
          onDelete={deleteSignup}
        />

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
      </main>
      <AppFooter />
    </div>
  );
}
