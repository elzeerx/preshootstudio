import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  onSuccess: () => void;
}

export const DeleteUserDialog = ({ open, onOpenChange, user, onSuccess }: DeleteUserDialogProps) => {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (confirmEmail !== user.email) {
      toast({
        title: 'Confirmation Failed',
        description: 'Email does not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Call edge function to handle user deletion
      const { error } = await supabase.functions.invoke('admin-manage-user', {
        body: {
          action: 'delete',
          user_id: user.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'User Deleted',
        description: `Successfully deleted user account for ${user.email}`,
      });

      onSuccess();
      onOpenChange(false);
      setConfirmEmail('');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User Account
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Warning:</strong> This action cannot be undone. This will permanently delete the user account and all associated data.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="font-semibold">The following will be deleted:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>User profile and authentication</li>
                <li>All projects created by this user</li>
                <li>Token usage history</li>
                <li>Research history</li>
                <li>Any other associated data</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmEmail">
                Type <strong>{user.email}</strong> to confirm:
              </Label>
              <Input
                id="confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={user.email}
                disabled={loading}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p><strong>User:</strong> {user.full_name || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setConfirmEmail('');
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || confirmEmail !== user.email}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete User
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
