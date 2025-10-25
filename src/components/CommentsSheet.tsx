import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommentsSheetProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  commentsCount: number;
}

export const CommentsSheet = ({ videoId, isOpen, onClose, commentsCount }: CommentsSheetProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && videoId) {
      fetchComments();
    }
  }, [isOpen, videoId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        const commentsWithProfiles = data.map(comment => ({
          ...comment,
          profiles: profilesMap.get(comment.user_id) || { username: 'unknown', avatar_url: null }
        }));

        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error("Kunne ikke laste kommentarer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Du må være logget inn for å kommentere");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Kommentaren kan ikke være tom");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          video_id: videoId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      toast.success("Kommentar lagt til!");
      await fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error("Kunne ikke legge til kommentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Kommentarer</SheetTitle>
          <SheetDescription>
            {commentsCount} {commentsCount === 1 ? 'kommentar' : 'kommentarer'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-80px)] mt-4">
          <ScrollArea className="flex-1 pr-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Laster kommentarer...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Ingen kommentarer ennå. Vær den første!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex-shrink-0 overflow-hidden">
                      {comment.profiles?.avatar_url ? (
                        <img
                          src={comment.profiles.avatar_url}
                          alt={comment.profiles.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs font-semibold">
                          {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          @{comment.profiles?.username || 'unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: nb,
                          })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Legg til en kommentar..."
              className="min-h-[60px]"
              maxLength={500}
              disabled={isSubmitting}
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !newComment.trim()}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
