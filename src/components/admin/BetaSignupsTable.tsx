import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Trash2, CheckCircle, XCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BetaSignup {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

interface BetaSignupsTableProps {
  signups: BetaSignup[];
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
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

export const BetaSignupsTable = ({ signups, onUpdateStatus, onDelete }: BetaSignupsTableProps) => {
  const { toast } = useToast();

  const handleSendInvitation = async (signup: BetaSignup) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          signupId: signup.id,
          name: signup.name,
          email: signup.email,
        },
      });

      if (error) throw error;

      toast({
        title: "تم إرسال الدعوة بنجاح",
        description: `تم إرسال دعوة إلى ${signup.email}`,
      });

      // Trigger a refresh or update the status locally
      window.location.reload();
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "فشل إرسال الدعوة",
        description: error.message || "حدث خطأ أثناء إرسال الدعوة",
        variant: "destructive",
      });
    }
  };

  return (
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
                            className="gap-2 bg-accent hover:bg-accent/90"
                          >
                            <Send className="w-4 h-4" strokeWidth={1.5} />
                            إرسال الدعوة
                          </Button>
                        )}
                        {signup.status === 'notified' && (
                          <Badge className="bg-secondary text-secondary-foreground">
                            تم الإرسال
                          </Badge>
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
  );
};

