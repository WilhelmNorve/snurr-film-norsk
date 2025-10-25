import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Video, Flag, Settings, UserCog, Users } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { AdminStats } from "@/components/admin/AdminStats";
import { VideoModeration } from "@/components/admin/VideoModeration";
import { ReportManagement } from "@/components/admin/ReportManagement";
import { UserActions } from "@/components/admin/UserActions";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import { UserManagement } from "@/components/admin/UserManagement";
import { UserReportManagement } from "@/components/admin/UserReportManagement";

interface StatsData {
  totalUsers: number;
  totalVideos: number;
  pendingReports: number;
  todayViews: number;
}

const Admin = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalVideos: 0,
    pendingReports: 0,
    todayViews: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [usersRes, videosRes, reportsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id, views_count', { count: 'exact' }),
        supabase.from('video_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const todayViews = videosRes.data?.reduce((sum, video) => sum + (video.views_count || 0), 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalVideos: videosRes.count || 0,
        pendingReports: reportsRes.count || 0,
        todayViews,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke laste statistikk",
      });
    }
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pl-20">
      <Navigation />
      
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
            </div>
            <CardDescription>
              Komplett administrasjonspanel for plattformen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminStats stats={stats} />
            
            <Tabs defaultValue="videos" className="mt-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videoer
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Brukere
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Rapporter
                </TabsTrigger>
                <TabsTrigger value="actions" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Brukerhandlinger
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Innstillinger
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="mt-6">
                <VideoModeration />
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <UserManagement />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <div className="space-y-6">
                  <UserReportManagement />
                  <ReportManagement />
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-6">
                <UserActions />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <PlatformSettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
