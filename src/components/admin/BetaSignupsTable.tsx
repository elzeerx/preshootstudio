import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Trash2, CheckCircle, XCircle, Send, RefreshCw, Loader2, Eye, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { EmailPreviewDialog } from "./EmailPreviewDialog";

interface BetaSignup {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  preferred_language?: string;
}

interface BetaInvitation {
  email_opened_at?: string | null;
  link_clicked_at?: string | null;
  opened_count?: number;
  clicked_count?: number;
}

interface BetaSignupsTableProps {
  signups: (BetaSignup & { invitation?: BetaInvitation })[];
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onInvitationSent: (id: string) => void;
  onBulkUpdateStatus: (ids: string[], newStatus: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkSendInvitations: (signups: BetaSignup[]) => void;
}

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

export const BetaSignupsTable = ({ 
  signups, 
  onUpdateStatus, 
  onDelete, 
  onInvitationSent,
  onBulkUpdateStatus,
  onBulkDelete,
  onBulkSendInvitations
}: BetaSignupsTableProps) => {
  const { toast } = useToast();
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewSignup, setPreviewSignup] = useState<BetaSignup | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleSendInvitation = async (signup: BetaSignup) => {
    const isResend = signup.status === 'notified';
    setSendingInvite(signup.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          signupId: signup.id,
          name: signup.name,
          email: signup.email,
          language: signup.preferred_language || 'en',
        },
      });

      if (error) throw error;

      toast({
        title: isResend ? "تم إعادة إرسال الدعوة بنجاح" : "تم إرسال الدعوة بنجاح",
        description: `تم ${isResend ? 'إعادة ' : ''}إرسال دعوة إلى ${signup.email}`,
      });

      // Update status locally
      onInvitationSent(signup.id);
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "فشل إرسال الدعوة",
        description: error.message || "حدث خطأ أثناء إرسال الدعوة",
        variant: "destructive",
      });
    } finally {
      setSendingInvite(null);
    }
  };

  const handlePreviewEmail = (signup: BetaSignup) => {
    setPreviewSignup(signup);
    setPreviewDialogOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(signups.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkApprove = async () => {
    const idsToApprove = Array.from(selectedIds).filter(id => 
      signups.find(s => s.id === id)?.status === 'pending'
    );
    if (idsToApprove.length === 0) {
      toast({ title: "لا توجد طلبات قيد الانتظار محددة", variant: "destructive" });
      return;
    }
    setBulkLoading(true);
    await onBulkUpdateStatus(idsToApprove, 'approved');
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const handleBulkSendInvitations = async () => {
    const signupsToInvite = signups.filter(s => 
      selectedIds.has(s.id) && s.status === 'approved'
    );
    if (signupsToInvite.length === 0) {
      toast({ title: "لا توجد طلبات معتمدة محددة", variant: "destructive" });
      return;
    }
    setBulkLoading(true);
    await onBulkSendInvitations(signupsToInvite);
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const handleBulkReset = async () => {
    const idsToReset = Array.from(selectedIds).filter(id => 
      signups.find(s => s.id === id)?.status !== 'pending'
    );
    if (idsToReset.length === 0) {
      toast({ title: "لا توجد طلبات معتمدة محددة", variant: "destructive" });
      return;
    }
    setBulkLoading(true);
    await onBulkUpdateStatus(idsToReset, 'pending');
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} طلب؟`)) return;
    setBulkLoading(true);
    await onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const isAllSelected = signups.length > 0 && selectedIds.size === signups.length;

  return (
    <>
      <Card variant="editorial">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Mail className="w-6 h-6 text-accent" strokeWidth={1.5} />
            طلبات الانضمام للنسخة التجريبية
          </CardTitle>
        </CardHeader>
        <CardContent>
        {/* Bulk Actions Toolbar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 p-4 bg-accent/10 border-2 border-accent rounded-lg flex items-center justify-between gap-4 animate-fadeInUp">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-lg px-3 py-1">
                {selectedIds.size} محدد
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="gap-2 border-accent text-accent hover:bg-accent/10"
              >
                {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                موافقة الكل
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleBulkSendInvitations}
                disabled={bulkLoading}
                className="gap-2 bg-accent hover:bg-accent/90"
              >
                {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                إرسال الدعوات
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkReset}
                disabled={bulkLoading}
                className="gap-2"
              >
                {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                إلغاء
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                حذف
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                disabled={bulkLoading}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                إلغاء التحديد
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border-2 border-foreground overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="تحديد الكل"
                  />
                </TableHead>
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات بعد
                  </TableCell>
                </TableRow>
              ) : (
                signups.map((signup) => (
                  <TableRow key={signup.id} className="hover:bg-muted/20">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(signup.id)}
                        onCheckedChange={(checked) => handleSelectOne(signup.id, checked as boolean)}
                        aria-label={`تحديد ${signup.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{signup.name}</TableCell>
                    <TableCell className="font-mono text-sm">{signup.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(signup.status)}
                        {/* Email tracking indicators */}
                        {signup.invitation && signup.status === 'notified' && (
                          <div className="flex items-center gap-1">
                            {signup.invitation.email_opened_at && (
                              <span 
                                className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-md border border-green-500/20" 
                                title={`تم الفتح ${signup.invitation.opened_count} مرة - آخر فتح: ${format(new Date(signup.invitation.email_opened_at), 'dd/MM/yyyy HH:mm', { locale: ar })}`}
                              >
                                📬 {signup.invitation.opened_count}
                              </span>
                            )}
                            {signup.invitation.link_clicked_at && (
                              <span 
                                className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md border border-blue-500/20"
                                title={`تم النقر ${signup.invitation.clicked_count} مرة - أول نقرة: ${format(new Date(signup.invitation.link_clicked_at), 'dd/MM/yyyy HH:mm', { locale: ar })}`}
                              >
                                🔗 {signup.invitation.clicked_count}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(signup.created_at), 'dd MMMM yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        {/* Preview Button - Available for approved and notified signups */}
                        {(signup.status === 'approved' || signup.status === 'notified') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewEmail(signup)}
                            className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                            title="معاينة البريد الإلكتروني"
                          >
                            <Eye className="w-4 h-4" strokeWidth={1.5} />
                            معاينة
                          </Button>
                        )}
                        
                        {signup.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(signup.id, 'approved')}
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                            موافقة
                          </Button>
                        )}
                        {signup.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSendInvitation(signup)}
                            disabled={sendingInvite === signup.id}
                            className="gap-2 bg-accent hover:bg-accent/90"
                          >
                            {sendingInvite === signup.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                            ) : (
                              <Send className="w-4 h-4" strokeWidth={1.5} />
                            )}
                            إرسال الدعوة
                          </Button>
                        )}
                        {signup.status === 'notified' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendInvitation(signup)}
                            disabled={sendingInvite === signup.id}
                            className="gap-2 border-accent text-accent hover:bg-accent/10"
                          >
                            {sendingInvite === signup.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                            ) : (
                              <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                            )}
                            إعادة إرسال الدعوة
                          </Button>
                        )}
                        {signup.status !== 'pending' && signup.status !== 'notified' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(signup.id, 'pending')}
                            className="gap-2"
                          >
                            <XCircle className="w-4 h-4" strokeWidth={1.5} />
                            إلغاء الموافقة
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(signup.id)}
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

    {/* Email Preview Dialog */}
    {previewSignup && (
      <EmailPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        signupName={previewSignup.name}
        signupEmail={previewSignup.email}
        language={previewSignup.preferred_language || 'ar'}
      />
    )}
    </>
  );
};

