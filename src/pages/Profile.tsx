import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Settings, Grid, Bookmark, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Du er nå logget ut");
    navigate("/auth");
  };

  const userStats = {
    followers: 15200,
    following: 432,
    likes: 125000,
    videos: 87,
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pl-20">
      <Navigation />
      
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between mb-6">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          {user && (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logg ut
            </Button>
          )}
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
