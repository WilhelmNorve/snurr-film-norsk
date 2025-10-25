import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Ban, UserX, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserAction {
  id: string;
  username: string;
  action_type: string;
  reason: string;
  duration_days: number | null;
  created_at: string;
  is_active: boolean;
}

interface User {
  id: string;
  username: string;
}

export const UserActions = () => {
  const [actions, setActions] = useState<UserAction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [actionType, setActionType] = useState("warn");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [actionsRes, usersRes] = await Promise.all([
        supabase
          .from('user_actions')
          .select(`
            id,
            action_type,
            reason,
            duration_days,
            created_at,
            is_active,
            profiles:user_id (username)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, username')
          .order('username')
      ]);

      if (actionsRes.error) throw actionsRes.error;
      if (usersRes.error) throw usersRes.error;

      const formattedActions = actionsRes.data?.map((action: any) => ({
        id: action.id,
        username: action.profiles?.username || 'Ukjent',
        action_type: action.action_type,
        reason: action.reason,
        duration_days: action.duration_days,
        created_at: action.created_at,
        is_active: action.is_active,
      })) || [];

      setActions(formattedActions);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke laste data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUserAction = async () => {
    if (!selectedUserId || !reason) {
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Vennligst fyll ut alle påkrevde felt",
      });
      return;
    }

    try {
      const { data: adminData } = await supabase.auth.getUser();
      if (!adminData.user) throw new Error("Ikke autentisert");

      const durationDays = duration ? parseInt(duration) : null;
      const expiresAt = durationDays 
        ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('user_actions')
        .insert({
          user_id: selectedUserId,
          action_type: actionType,
          reason: reason,
          duration_days: durationDays,
          expires_at: expiresAt,
          admin_id: adminData.user.id,
        });

      if (error) throw error;

      toast({
        title: "Handling registrert",
        description: `Brukerhandling (${actionType}) har blitt registrert`,
      });

      setDialogOpen(false);
      setSelectedUserId("");
      setReason("");
      setDuration("");
      fetchData();
    } catch (error) {
      console.error('Error creating user action:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke registrere handling",
      });
    }
  };

  const toggleActionStatus = async (actionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_actions')
        .update({ is_active: !currentStatus })
        .eq('id', actionId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Handling avsluttet" : "Handling aktivert",
        description: currentStatus 
          ? "Brukerhandlingen er nå avsluttet" 
          : "Brukerhandlingen er nå aktivert igjen",
      });

      fetchData();
    } catch (error) {
      console.error('Error toggling action status:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke endre status",
      });
    }
  };

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

  const getActionBadge = (type: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      ban: "destructive",
      suspend: "destructive",
      warn: "secondary",
      unsuspend: "default",
      unban: "default",
    };

    return (
      <Badge variant={variants[type] || "secondary"} className="flex items-center gap-1">
        {getActionIcon(type)}
        {type}
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
    <>
      <div className="mb-4">
        <Button onClick={() => setDialogOpen(true)}>
          Ny brukerhandling
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bruker</TableHead>
              <TableHead>Handling</TableHead>
              <TableHead>Grunn</TableHead>
              <TableHead>Varighet</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Ingen handlinger funnet
                </TableCell>
              </TableRow>
            ) : (
              actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="font-medium">@{action.username}</TableCell>
                  <TableCell>{getActionBadge(action.action_type)}</TableCell>
                  <TableCell className="max-w-xs truncate">{action.reason}</TableCell>
                  <TableCell>
                    {action.duration_days ? `${action.duration_days} dager` : 'Permanent'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={action.is_active ? "destructive" : "default"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => toggleActionStatus(action.id, action.is_active)}
                    >
                      {action.is_active ? "Aktivt" : "Avsluttet"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(action.created_at).toLocaleDateString('nb-NO')}
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
            <DialogTitle>Registrer ny brukerhandling</DialogTitle>
            <DialogDescription>
              Utfør moderatorhandling mot en bruker
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Velg bruker:</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg en bruker" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      @{user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Handlingstype:</label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warn">Advarsel</SelectItem>
                  <SelectItem value="suspend">Suspender</SelectItem>
                  <SelectItem value="ban">Utesteng (ban)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Grunn:</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Beskriv grunnen for handlingen..."
              />
            </div>
            {(actionType === 'suspend' || actionType === 'ban') && (
              <div>
                <label className="text-sm font-medium mb-2 block">Varighet (dager):</label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="La stå tom for permanent"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={createUserAction}>
              Registrer handling
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
