import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, User, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/VerificationBadge";

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
  is_active: boolean;
}

type SortField = 'display_name' | 'username' | 'followers_count' | 'following_count' | 'videos_count' | 'likes_count' | 'created_at';
type SortDirection = 'asc' | 'desc';

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('followers_count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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
        is_active: profile.is_active !== false,
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

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { data, error } = await (supabase.rpc as any)('toggle_user_status', {
        _user_id: userId
      });

      if (error) throw error;

      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke endre brukerstatus",
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const sortedUsers = [...users].sort((a, b) => {
    // First sort by is_active (active users first)
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }

    // Then sort by the selected field
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
    }
    if (typeof bValue === 'string') {
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

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
              <TableHead>Status</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('display_name')}
                >
                  Bruker
                  {getSortIcon('display_name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('username')}
                >
                  Brukernavn
                  {getSortIcon('username')}
                </Button>
              </TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('followers_count')}
                >
                  Følgere
                  {getSortIcon('followers_count')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('following_count')}
                >
                  Følger
                  {getSortIcon('following_count')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('videos_count')}
                >
                  Videoer
                  {getSortIcon('videos_count')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('likes_count')}
                >
                  Likes
                  {getSortIcon('likes_count')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                  onClick={() => handleSort('created_at')}
                >
                  Registrert
                  {getSortIcon('created_at')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Ingen brukere funnet
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Badge 
                      variant={user.is_active ? "default" : "secondary"}
                      className={`cursor-pointer transition-colors ${
                        user.is_active 
                          ? "bg-green-600 hover:bg-green-700 text-white" 
                          : "bg-gray-500 hover:bg-gray-600 text-white"
                      }`}
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                    >
                      {user.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.display_name}
                          <VerificationBadge followersCount={user.followers_count} size="sm" />
                        </div>
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
