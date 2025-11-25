import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Calendar, Activity, FileText, Coins } from 'lucide-react';

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string;
    account_status: string;
    created_at: string;
    monthly_token_limit: number;
    role?: string;
  };
  onRefresh: () => void;
}

export const UserDetailDialog = ({ open, onOpenChange, user, onRefresh }: UserDetailDialogProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [tokenUsage, setTokenUsage] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchUserDetails();
    }
  }, [open, user]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      // Fetch user projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch token usage
      const { data: tokenData } = await supabase
        .from('ai_token_usage')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch audit logs related to this user
      const { data: auditData } = await supabase
        .from('admin_audit_log')
        .select('*, admin:admin_id(email, full_name)')
        .eq('target_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setProjects(projectsData || []);
      setTokenUsage(tokenData || []);
      setAuditLogs(auditData || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalTokensUsed = tokenUsage.reduce((sum, usage) => sum + (usage.total_tokens || 0), 0);
  const totalCost = tokenUsage.reduce((sum, usage) => sum + (usage.estimated_cost_usd || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* User Info Header */}
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.full_name || 'N/A'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.account_status === 'active' ? 'default' : 'destructive'}>
                    {user.account_status || 'active'}
                  </Badge>
                  <Badge variant="outline">{user.role || 'user'}</Badge>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    Tokens Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTokensUsed.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Limit: {user.monthly_token_limit?.toLocaleString() || 'N/A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Total Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for detailed info */}
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="usage">Token Usage</TabsTrigger>
                <TabsTrigger value="audit">Audit Log</TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="space-y-4">
                {projects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No projects found</p>
                ) : (
                  projects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="text-sm">{project.topic}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Status: {project.status}</span>
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="usage" className="space-y-4">
                {tokenUsage.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No token usage found</p>
                ) : (
                  tokenUsage.map((usage) => (
                    <Card key={usage.id}>
                      <CardHeader>
                        <CardTitle className="text-sm">{usage.function_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-muted-foreground">Tokens:</span>
                          <span className="font-medium">{usage.total_tokens?.toLocaleString()}</span>
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">${usage.estimated_cost_usd?.toFixed(4)}</span>
                          <span className="text-muted-foreground">Model:</span>
                          <span className="font-medium">{usage.model_used}</span>
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{new Date(usage.created_at).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="audit" className="space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No audit logs found</p>
                ) : (
                  auditLogs.map((log) => (
                    <Card key={log.id}>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>{log.action_type.replace(/_/g, ' ').toUpperCase()}</span>
                          <Badge variant="outline">{new Date(log.created_at).toLocaleString()}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>By: {log.admin?.email || 'Unknown'}</p>
                        {log.notes && <p className="mt-2">{log.notes}</p>}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
