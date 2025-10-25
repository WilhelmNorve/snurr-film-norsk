import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Video {
  id: string;
  title: string;
  username: string;
  views_count: number;
  likes_count: number;
  is_active: boolean;
  is_flagged: boolean;
  created_at: string;
}

export const VideoModeration = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          views_count,
          likes_count,
          is_active,
          is_flagged,
          created_at,
          profiles:user_id (username)
        `)
        .order('is_active', { ascending: false })
        .order('likes_count', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedVideos = data?.map((video: any) => ({
        id: video.id,
        title: video.title,
        username: video.profiles?.username || 'Ukjent',
        views_count: video.views_count,
        likes_count: video.likes_count,
        is_active: video.is_active,
        is_flagged: video.is_flagged,
        created_at: video.created_at,
      })) || [];

      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke laste videoer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVideoStatus = async (videoId: string, currentStatus: boolean) => {
    try {
      const { data, error } = await (supabase.rpc as any)('toggle_video_status', {
        _video_id: videoId
      });

      if (error) throw error;

      fetchVideos();
    } catch (error) {
      console.error('Error toggling video status:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke endre videostatus",
      });
    }
  };

  const deleteVideo = async () => {
    if (!selectedVideoId) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', selectedVideoId);

      if (error) throw error;

      toast({
        title: "Video slettet",
        description: "Videoen har blitt permanent fjernet",
      });

      setDeleteDialogOpen(false);
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke slette video",
      });
    }
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tittel</TableHead>
              <TableHead>Bruker</TableHead>
              <TableHead>Visninger</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Opprettet</TableHead>
              <TableHead className="text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Ingen videoer funnet
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>@{video.username}</TableCell>
                  <TableCell>{video.views_count.toLocaleString()}</TableCell>
                  <TableCell>{video.likes_count.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {video.is_flagged && (
                        <Badge variant="destructive">Flagget</Badge>
                      )}
                      <Badge 
                        variant={video.is_active ? "default" : "destructive"}
                        className={`cursor-pointer transition-colors ${
                          video.is_active 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                        onClick={() => toggleVideoStatus(video.id, video.is_active)}
                      >
                        {video.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(video.created_at).toLocaleDateString('nb-NO')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleVideoStatus(video.id, video.is_active)}
                      >
                        {video.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedVideoId(video.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denne handlingen kan ikke angres. Videoen vil bli permanent slettet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={deleteVideo}>Slett video</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
