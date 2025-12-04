import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Edit, AlertCircle, CheckCircle, Gift, Sparkles } from 'lucide-react';
import { EditUserTokenLimitDialog } from './EditUserTokenLimitDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserTokenData {
  user_id: string;
  email: string;
  full_name: string | null;
  monthly_token_limit: number;
  alert_threshold_percentage: number;
  limit_notifications_enabled: boolean;
  total_tokens: number;
  total_cost: number;
  request_count: number;
  bonus_tokens: number;
  plan_name: string;
  plan_token_limit: number;
}

interface UserTokenManagementProps {
  users: UserTokenData[];
  onUpdate: () => void;
}

export const UserTokenManagement = ({ users, onUpdate }: UserTokenManagementProps) => {
  const [selectedUser, setSelectedUser] = useState<UserTokenData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getEffectiveLimit = (user: UserTokenData) => {
    return user.plan_token_limit + (user.bonus_tokens || 0);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-destructive';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBadgeVariant = (percentage: number): "default" | "destructive" | "secondary" => {
    if (percentage >= 80) return 'destructive';
    if (percentage >= 50) return 'secondary';
    return 'default';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const handleEdit = (user: UserTokenData) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSave = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    onUpdate();
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">إدارة حدود الاستخدام</h2>
            <p className="text-sm text-muted-foreground mt-1">
              إدارة حدود استخدام الـ Tokens الشهرية للمستخدمين
            </p>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">الخطة</TableHead>
                <TableHead className="text-right">حد الخطة</TableHead>
                <TableHead className="text-right">إضافي</TableHead>
                <TableHead className="text-right">الحد الفعلي</TableHead>
                <TableHead className="text-right">الاستخدام</TableHead>
                <TableHead className="text-right">النسبة</TableHead>
                <TableHead className="text-right">التنبيهات</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    لا يوجد مستخدمين
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const effectiveLimit = getEffectiveLimit(user);
                  const usagePercentage = getUsagePercentage(user.total_tokens, effectiveLimit);
                  const usageColor = getUsageColor(usagePercentage);
                  const hasBonus = (user.bonus_tokens || 0) > 0;

                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.full_name || 'غير محدد'}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{user.plan_name}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-muted-foreground">
                          {formatNumber(user.plan_token_limit)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {hasBonus ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            <Gift className="h-3 w-3 ml-1" />
                            +{formatNumber(user.bonus_tokens)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Badge variant="secondary">
                            {formatNumber(effectiveLimit)}
                          </Badge>
                          {hasBonus && (
                            <Sparkles className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col gap-2">
                          <span className={`font-medium ${usageColor}`}>
                            {formatNumber(user.total_tokens)}
                          </span>
                          <Progress value={usagePercentage} className="h-2 w-24" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getUsageBadgeVariant(usagePercentage)}>
                          {usagePercentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {user.limit_notifications_enabled ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {user.alert_threshold_percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedUser && (
        <EditUserTokenLimitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={selectedUser}
          onSave={handleSave}
        />
      )}
    </>
  );
};
