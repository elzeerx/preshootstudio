import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, Mail, UserCheck } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalBetaSignups: number;
  pendingSignups: number;
  approvedSignups: number;
  activeProjects: number;
}

interface AdminStatsProps {
  stats: Stats;
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
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
  );
};

