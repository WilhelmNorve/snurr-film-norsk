import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, UserX } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserReport {
  id: string;
  reported_username: string;
  reporter_username: string;
  reason: string;
  status: string;
  created_at: string;
  reported_user_id: string;
}

export const UserReportManagement = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          id,
          reason,
          status,
          created_at,
          reported_user_id,
          reported_user:reported_user_id (username),
          reporter:reporter_id (username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports = data?.map((report: any) => ({
        id: report.id,
        reported_username: report.reported_user?.username || 'Ukjent',
        reporter_username: report.reporter?.username || 'Ukjent',
        reason: report.reason,
        status: report.status,
        created_at: report.created_at,
        reported_user_id: report.reported_user_id,
      })) || [];

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching user reports:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke laste brukerrapporter",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { data: adminData } = await supabase.auth.getUser();
      if (!adminData.user) throw new Error("Ikke autentisert");

      const { error } = await supabase
        .from('user_reports')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminData.user.id,
          admin_notes: adminNotes || null,
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Rapport oppdatert",
        description: `Rapporten er markert som ${newStatus}`,
      });

      setDialogOpen(false);
      setAdminNotes("");
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke oppdatere rapport",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "destructive",
      reviewed: "secondary",
      resolved: "default",
      dismissed: "secondary",
    };

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <UserX className="h-5 w-5" />
          Brukerrapporter
        </h3>
        <p className="text-sm text-muted-foreground">
          {reports.filter(r => r.status === 'pending').length} ventende rapporter
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rapportert bruker</TableHead>
              <TableHead>Rapportert av</TableHead>
              <TableHead>Grunn</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead className="text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Ingen brukerrapporter funnet
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">@{report.reported_username}</TableCell>
                  <TableCell>@{report.reporter_username}</TableCell>
                  <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString('nb-NO')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReport(report);
                        setDialogOpen(true);
                      }}
                    >
                      Behandle
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Behandle brukerrapport</DialogTitle>
            <DialogDescription>
              Rapportert bruker: @{selectedReport?.reported_username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Rapportert grunn:</p>
              <p className="text-sm text-muted-foreground">{selectedReport?.reason}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Rapportert av:</p>
              <p className="text-sm">@{selectedReport?.reporter_username}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Admin notater:</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Legg til notater om denne rapporten..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'dismissed')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Avvis
            </Button>
            <Button
              variant="default"
              onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'resolved')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Løs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
