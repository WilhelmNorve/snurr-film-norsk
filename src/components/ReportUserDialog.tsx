import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ReportUserDialogProps {
  reportedUserId: string;
  reportedUsername: string;
}

export const ReportUserDialog = ({ reportedUserId, reportedUsername }: ReportUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonType, setReasonType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Du må være innlogget for å rapportere");
      return;
    }

    if (!reasonType || !reason.trim()) {
      toast.error("Vennligst velg en kategori og beskriv grunnen");
      return;
    }

    setIsSubmitting(true);

    try {
      const fullReason = `[${reasonType}] ${reason.trim()}`;
      
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reported_user_id: reportedUserId,
          reporter_id: user.id,
          reason: fullReason,
        });

      if (error) throw error;

      toast.success("Rapport sendt! Vi vil gjennomgå den så snart som mulig.");
      setOpen(false);
      setReason("");
      setReasonType("");
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("Kunne ikke sende rapport. Prøv igjen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Flag className="h-4 w-4" />
          Rapporter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rapporter bruker</DialogTitle>
          <DialogDescription>
            Rapporter @{reportedUsername} for upassende oppførsel
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Kategori:</label>
            <Select value={reasonType} onValueChange={setReasonType}>
              <SelectTrigger>
                <SelectValue placeholder="Velg en kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spam">Spam eller reklame</SelectItem>
                <SelectItem value="Trakassering">Trakassering eller mobbing</SelectItem>
                <SelectItem value="Hatefullt innhold">Hatefullt innhold</SelectItem>
                <SelectItem value="Vold">Vold eller farlig innhold</SelectItem>
                <SelectItem value="Seksuelt innhold">Upassende seksuelt innhold</SelectItem>
                <SelectItem value="Falsk informasjon">Falsk informasjon</SelectItem>
                <SelectItem value="Annet">Annet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Beskriv problemet:</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Forklar hvorfor du rapporterer denne brukeren..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reason.length}/500 tegn
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sender..." : "Send rapport"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
