import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string;
    account_status: string;
    monthly_token_limit: number;
    alert_threshold_percentage: number;
    limit_notifications_enabled: boolean;
    role?: string;
  };
  onSuccess: () => void;
}

export const EditUserDialog = ({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) => {
  const [fullName, setFullName] = useState('');
  const [accountStatus, setAccountStatus] = useState('active');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [role, setRole] = useState('user');
  const [tokenLimit, setTokenLimit] = useState('100000');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && open) {
      setFullName(user.full_name || '');
      setAccountStatus(user.account_status || 'active');
      setRole(user.role || 'user');
      setTokenLimit(user.monthly_token_limit?.toString() || '100000');
      setAlertThreshold(user.alert_threshold_percentage?.toString() || '80');
      setNotificationsEnabled(user.limit_notifications_enabled ?? true);
      setSuspensionReason('');
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: any = {
        full_name: fullName,
        account_status: accountStatus,
        monthly_token_limit: parseInt(tokenLimit),
        alert_threshold_percentage: parseInt(alertThreshold),
        limit_notifications_enabled: notificationsEnabled,
      };

      if (accountStatus !== 'active' && suspensionReason) {
        updates.suspension_reason = suspensionReason;
        updates.suspended_at = new Date().toISOString();
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role if changed
      if (role !== user.role) {
        // Delete existing role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);

        // Insert new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ user_id: user.id, role: role as 'admin' | 'moderator' | 'user' }]);

        if (roleError) throw roleError;
      }

      // Get current user for audit log
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Log audit entry
      if (currentUser) {
        await supabase.from('admin_audit_log').insert([{
          admin_id: currentUser.id,
          action_type: 'update_user',
          target_user_id: user.id,
          new_values: updates,
          notes: `Updated user profile and settings`,
        }]);
      }

      toast({
        title: 'User Updated',
        description: `Successfully updated ${user.email}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user.email}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="status">Status & Role</TabsTrigger>
              <TabsTrigger value="limits">Token Limits</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email (read-only)</Label>
                <Input value={user.email} disabled />
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="accountStatus">Account Status</Label>
                <Select value={accountStatus} onValueChange={setAccountStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {accountStatus !== 'active' && (
                <div className="space-y-2">
                  <Label htmlFor="suspensionReason">Reason</Label>
                  <Textarea
                    id="suspensionReason"
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Enter reason for suspension/ban"
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="tokenLimit">Monthly Token Limit</Label>
                <Input
                  id="tokenLimit"
                  type="number"
                  value={tokenLimit}
                  onChange={(e) => setTokenLimit(e.target.value)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notificationsEnabled"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="notificationsEnabled">Enable limit notifications</Label>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
