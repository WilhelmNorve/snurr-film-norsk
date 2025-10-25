import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Settings, Grid, Bookmark, Heart, LogOut, LogIn, AlertTriangle, Ban, UserX } from "lucide-react";
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

        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut} 
            className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logg ut
          </Button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
            <AvatarFallback>BN</AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold mb-1">
            @{user?.user_metadata?.username || "brukernavn"}
          </h1>
          <p className="text-muted-foreground mb-4">
            {user?.email || "Oslo, Norge 🇳🇴"}
          </p>

          <div className="flex gap-8 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold">{userStats.followers.toLocaleString("nb-NO")}</p>
              <p className="text-sm text-muted-foreground">Følgere</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{userStats.following.toLocaleString("nb-NO")}</p>
              <p className="text-sm text-muted-foreground">Følger</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{userStats.likes.toLocaleString("nb-NO")}</p>
              <p className="text-sm text-muted-foreground">Likes</p>
            </div>
          </div>

          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity px-12">
            Rediger profil
          </Button>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="videos" className="gap-2">
              <Grid className="h-4 w-4" />
              Videoer
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-2">
              <Heart className="h-4 w-4" />
              Likte
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Lagret
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[9/16] bg-secondary rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Video {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Dine likte videoer vises her
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Dine lagrede videoer vises her
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
