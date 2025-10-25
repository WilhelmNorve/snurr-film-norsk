import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Grid, Bookmark, Heart, LogOut, LogIn, AlertTriangle, Ban, UserX, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserAction {
  id: string;
  action_type: string;
  reason: string;
  duration_days: number | null;
  created_at: string;
  is_active: boolean;
}

const Profile = () => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [userVideos, setUserVideos] = useState<any[]>([]);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchUserActions = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setUserActions(data);
      }
    };

    fetchUserActions();
  }, [user]);

  useEffect(() => {
    const fetchUserContent = async () => {
      if (!user) return;

      // Fetch bookmarked videos
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('video_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookmarks && bookmarks.length > 0) {
        const videoIds = bookmarks.map(b => b.video_id);
        const { data: videos } = await supabase
          .from('videos')
          .select('*')
          .in('id', videoIds)
          .eq('is_active', true);

        if (videos) {
          setBookmarkedVideos(videos);
        }
      }

      // Fetch liked videos
      const { data: likes, error: likesError } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (likes && likes.length > 0) {
        const videoIds = likes.map(l => l.video_id);
        const { data: videos } = await supabase
          .from('videos')
          .select('*')
          .in('id', videoIds)
          .eq('is_active', true);

        if (videos) {
          setLikedVideos(videos);
        }
      }

      // Fetch user's own videos
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (videos) {
        setUserVideos(videos);
      }
    };

    fetchUserContent();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Du er nå logget ut");
      navigate("/auth");
    } catch (error) {
      toast.error("Kunne ikke logge ut");
    }
  };

  const userStats = {
    followers: 15200,
    following: 432,
    likes: 125000,
    videos: 87,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center font-bold text-3xl mx-auto mb-4 animate-pulse">
            T
          </div>
          <p className="text-muted-foreground">Laster profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ban':
        return <Ban className="h-4 w-4" />;
      case 'suspend':
        return <UserX className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getActionVariant = (type: string): "default" | "destructive" => {
    if (type === 'ban' || type === 'suspend') return "destructive";
    return "default";
  };

  const getActionTitle = (type: string) => {
    switch (type) {
      case 'ban':
        return 'Utestengt';
      case 'suspend':
        return 'Suspendert';
      case 'warn':
        return 'Advarsel';
      default:
        return 'Handling';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pl-20">
      <Navigation />
      
      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* User Actions Alerts */}
        {userActions.length > 0 && (
          <div className="mb-6 space-y-3">
            {userActions.map((action) => (
              <Alert key={action.id} variant={getActionVariant(action.action_type)}>
                <div className="flex items-start gap-3">
                  {getActionIcon(action.action_type)}
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {getActionTitle(action.action_type)}
                      {action.duration_days && (
                        <Badge variant="outline" className="text-xs">
                          {action.duration_days} dager
                        </Badge>
                      )}
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      {action.reason}
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(action.created_at).toLocaleDateString('nb-NO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}


        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-primary flex-shrink-0">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
            <AvatarFallback>BN</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">
              @{user?.user_metadata?.username || "brukernavn"}
            </h1>
            <p className="text-sm text-muted-foreground truncate mb-3">
              {user?.email || "Oslo, Norge 🇳🇴"}
            </p>

            <div className="flex gap-4 text-sm mb-3">
              <div>
                <span className="font-bold">{userStats.followers.toLocaleString("nb-NO")}</span>
                <span className="text-muted-foreground ml-1">følgere</span>
              </div>
              <div>
                <span className="font-bold">{userStats.following.toLocaleString("nb-NO")}</span>
                <span className="text-muted-foreground ml-1">følger</span>
              </div>
              <div>
                <span className="font-bold">{userStats.likes.toLocaleString("nb-NO")}</span>
                <span className="text-muted-foreground ml-1">likes</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                Rediger profil
              </Button>
              <Button 
                variant="outline" 
                size="default"
                onClick={handleSignOut} 
                className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4" />
                Logg ut
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="videos" className="gap-2">
              <Grid className="h-4 w-4" />
              Videoer ({userVideos.length})
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-2">
              <Heart className="h-4 w-4" />
              Likte ({likedVideos.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Lagret ({bookmarkedVideos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            {userVideos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Du har ingen videoer ennå
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {userVideos.map((video) => (
                  <div
                    key={video.id}
                    className="aspect-[9/16] bg-secondary rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform relative group"
                  >
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <video src={video.video_url} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-2 left-2 flex gap-2 text-white text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {video.likes_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            {likedVideos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Dine likte videoer vises her
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {likedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="aspect-[9/16] bg-secondary rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform relative group"
                  >
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <video src={video.video_url} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-2 left-2 flex gap-2 text-white text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-current" /> {video.likes_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {bookmarkedVideos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Dine lagrede videoer vises her
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {bookmarkedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="aspect-[9/16] bg-secondary rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform relative group"
                  >
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <video src={video.video_url} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-2 left-2 flex gap-2 text-white text-xs">
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3 fill-current" />
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {video.likes_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
