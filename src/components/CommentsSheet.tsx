import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, Trash2 } from "lucide-react";
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
  onCommentAdded?: () => void;
}

export const CommentsSheet = ({ open, onOpenChange, videoId, onCommentAdded }: CommentsSheetProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && videoId) {
      fetchComments();
    }
  }, [open, videoId]);

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
        .order('created_at', { ascending: false});

      if (error) throw error;

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        const profilesMap = new Map(
          profilesData?.map(p => [p.id, p]) || []
        );

        const enrichedComments = data.map(comment => ({
          ...comment,
          profiles: profilesMap.get(comment.user_id) || { username: 'unknown', avatar_url: null }
        }));

        setComments(enrichedComments as Comment[]);
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

      toast.success("Kommentar lagt til!");
      setNewComment("");
      fetchComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Kunne ikke legge til kommentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success("Kommentar slettet");
      fetchComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Kunne ikke slette kommentar");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Kommentarer ({comments.length})</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-60px)] mt-4 gap-4">
          <ScrollArea className="flex-1 pr-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                Laster kommentarer...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Ingen kommentarer ennå. Vær den første til å kommentere!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
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
                        {user?.id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(comment.id)}
                            className="ml-auto h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm mt-1 break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {user ? (
            <div className="flex gap-2 pb-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Skriv en kommentar..."
                className="min-h-[60px] resize-none"
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !newComment.trim()}
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground pb-4">
              Logg inn for å kommentere
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
