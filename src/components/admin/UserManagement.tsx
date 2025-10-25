import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserData {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  likes_count: number;
  videos_count: number;
  created_at: string;
  roles: string[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map roles to users
      const rolesMap = new Map<string, string[]>();
      rolesData?.forEach(({ user_id, role }) => {
        if (!rolesMap.has(user_id)) {
          rolesMap.set(user_id, []);
        }
        rolesMap.get(user_id)?.push(role);
      });

      const formattedUsers: UserData[] = profilesData?.map((profile) => ({
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name || 'Ukjent',
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        followers_count: profile.followers_count || 0,
        following_count: profile.following_count || 0,
        likes_count: profile.likes_count || 0,
        videos_count: profile.videos_count || 0,
        created_at: profile.created_at,
        roles: rolesMap.get(profile.id) || ['user'],
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke laste brukere",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('admin')) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    }
    if (roles.includes('moderator')) {
      return (
        <Badge variant="default" className="flex items-center gap-1 w-fit">
          <Shield className="h-3 w-3" />
          Moderator
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
        <User className="h-3 w-3" />
        Bruker
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Registrerte brukere</h3>
          <p className="text-sm text-muted-foreground">
            Totalt {users.length} brukere
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bruker</TableHead>
              <TableHead>Brukernavn</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Følgere</TableHead>
              <TableHead>Følger</TableHead>
              <TableHead>Videoer</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Registrert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Ingen brukere funnet
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.display_name}</div>
                        {user.bio && (
                          <div className="text-xs text-muted-foreground max-w-xs truncate">
                            {user.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">@{user.username}</TableCell>
                  <TableCell>{getRoleBadge(user.roles)}</TableCell>
                  <TableCell>{user.followers_count.toLocaleString('nb-NO')}</TableCell>
                  <TableCell>{user.following_count.toLocaleString('nb-NO')}</TableCell>
                  <TableCell>{user.videos_count.toLocaleString('nb-NO')}</TableCell>
                  <TableCell>{user.likes_count.toLocaleString('nb-NO')}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('nb-NO')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
