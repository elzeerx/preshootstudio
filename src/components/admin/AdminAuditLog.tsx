import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Clock } from 'lucide-react';

interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string;
  old_values: any;
  new_values: any;
  notes: string;
  created_at: string;
  admin?: {
    email: string;
    full_name: string;
  };
  target_user?: {
    email: string;
    full_name: string;
  };
}

export const AdminAuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Fetch admin and user details separately
      const logsWithDetails = await Promise.all((data || []).map(async (log) => {
        const [adminData, userData] = await Promise.all([
          log.admin_id ? supabase.from('profiles').select('email, full_name').eq('id', log.admin_id).maybeSingle() : null,
          log.target_user_id ? supabase.from('profiles').select('email, full_name').eq('id', log.target_user_id).maybeSingle() : null,
        ]);
        
        return {
          ...log,
          admin: adminData?.data || undefined,
          target_user: userData?.data || undefined,
        };
      }));
      
      setLogs(logsWithDetails);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.admin?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (actionType: string) => {
    const colors: Record<string, string> = {
      create_user: 'bg-green-500/20 text-green-400 border-green-500/30',
      update_user: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      delete_user: 'bg-red-500/20 text-red-400 border-red-500/30',
      assign_role: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      suspend_user: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    
    return (
      <Badge variant="outline" className={colors[actionType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
        {actionType.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create_user">Create User</SelectItem>
            <SelectItem value="update_user">Update User</SelectItem>
            <SelectItem value="delete_user">Delete User</SelectItem>
            <SelectItem value="assign_role">Assign Role</SelectItem>
            <SelectItem value="suspend_user">Suspend User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading audit logs...
              </CardContent>
            </Card>
          ) : filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No audit logs found
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getActionBadge(log.action_type)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        By: <strong>{log.admin?.email || 'Unknown'}</strong>
                        {log.target_user && (
                          <> | Target: <strong>{log.target_user.email}</strong></>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                {(log.notes || log.new_values) && (
                  <CardContent className="space-y-2">
                    {log.notes && (
                      <p className="text-sm text-muted-foreground">{log.notes}</p>
                    )}
                    {log.new_values && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Changes
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
