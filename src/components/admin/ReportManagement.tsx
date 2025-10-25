import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Video as VideoIcon, User as UserIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoReport {
  id: string;
  video_title: string;
  reporter_username: string;
  reason: string;
  status: string;
  created_at: string;
  video_id: string;
}

interface UserReport {
  id: string;
  reported_username: string;
  reporter_username: string;
  reason: string;
  status: string;
  created_at: string;
  reported_user_id: string;
}

export const ReportManagement = () => {
  const [videoReports, setVideoReports] = useState<VideoReport[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideoReport, setSelectedVideoReport] = useState<VideoReport | null>(null);
  const [selectedUserReport, setSelectedUserReport] = useState<UserReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'video' | 'user'>('video');
  const { toast } = useToast();

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    await Promise.all([fetchVideoReports(), fetchUserReports()]);
  };

  const fetchVideoReports = async () => {
    try {
      const { data, error } = await supabase
        .from('video_reports')
        .select(`
          id,
          reason,
          status,
          created_at,
          video_id,
          videos:video_id (title),
          profiles:reporter_id (username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports = data?.map((report: any) => ({
        id: report.id,
        video_title: report.videos?.title || 'Ukjent video',
        reporter_username: report.profiles?.username || 'Ukjent',
        reason: report.reason,
        status: report.status,
        created_at: report.created_at,
        video_id: report.video_id,
      })) || [];

      setVideoReports(formattedReports);
    } catch (error) {
      console.error('Error fetching video reports:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke laste videorapporter",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReports = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          id,
          reason,
          status,
          created_at,
          reported_user_id,
          reported:reported_user_id (username),
          reporter:reporter_id (username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports = data?.map((report: any) => ({
        id: report.id,
        reported_username: report.reported?.username || 'Ukjent',
        reporter_username: report.reporter?.username || 'Ukjent',
        reason: report.reason,
        status: report.status,
        created_at: report.created_at,
        reported_user_id: report.reported_user_id,
      })) || [];

      setUserReports(formattedReports);
    } catch (error) {
      console.error('Error fetching user reports:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke laste brukerrapporter",
      });
    }
  };

  const updateVideoReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('video_reports')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Rapport oppdatert",
        description: `Videorapporten er markert som ${newStatus}`,
      });

      setDialogOpen(false);
      setAdminNotes("");
      fetchVideoReports();
    } catch (error) {
      console.error('Error updating video report:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke oppdatere rapport",
      });
    }
  };

  const updateUserReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Rapport oppdatert",
        description: `Brukerrapporten er markert som ${newStatus}`,
      });

      setDialogOpen(false);
      setAdminNotes("");
      fetchUserReports();
    } catch (error) {
      console.error('Error updating user report:', error);
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
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="videos" className="gap-2">
            <VideoIcon className="h-4 w-4" />
            Videorapporter
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <UserIcon className="h-4 w-4" />
            Brukerrapporter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Rapportert av</TableHead>
                  <TableHead>Grunn</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dato</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videoReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Ingen videorapporter funnet
                    </TableCell>
                  </TableRow>
                ) : (
                  videoReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.video_title}</TableCell>
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
                            setSelectedVideoReport(report);
                            setDialogType('video');
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
        </TabsContent>

        <TabsContent value="users">
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
                {userReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Ingen brukerrapporter funnet
                    </TableCell>
                  </TableRow>
                ) : (
                  userReports.map((report) => (
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
                            setSelectedUserReport(report);
                            setDialogType('user');
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
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Behandle rapport</DialogTitle>
            <DialogDescription>
              {dialogType === 'video' 
                ? `Video: ${selectedVideoReport?.video_title}`
                : `Bruker: @${selectedUserReport?.reported_username}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Rapportert grunn:</p>
              <p className="text-sm text-muted-foreground">
                {dialogType === 'video' ? selectedVideoReport?.reason : selectedUserReport?.reason}
              </p>
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
              onClick={() => {
                if (dialogType === 'video' && selectedVideoReport) {
                  updateVideoReportStatus(selectedVideoReport.id, 'dismissed');
                } else if (selectedUserReport) {
                  updateUserReportStatus(selectedUserReport.id, 'dismissed');
                }
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Avvis
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (dialogType === 'video' && selectedVideoReport) {
                  updateVideoReportStatus(selectedVideoReport.id, 'resolved');
                } else if (selectedUserReport) {
                  updateUserReportStatus(selectedUserReport.id, 'resolved');
                }
              }}
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
