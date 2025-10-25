import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Flag, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { VerificationBadge } from "@/components/VerificationBadge";
import { CommentsSheet } from "@/components/CommentsSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoPlayerProps {
  videoUrl: string;
  username: string;
  description: string;
  likes: number;
  comments: number;
  avatarUrl?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  followersCount?: number;
  videoId?: string;
  userId?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  disableBookmark?: boolean;
  hasUserCommented?: boolean;
}

export const VideoPlayer = ({
  videoUrl,
  username,
  description,
  likes,
  comments,
  avatarUrl,
  isLiked = false,
  isBookmarked = false,
  followersCount = 0,
  videoId,
  userId,
  onLike,
  onComment,
  onShare,
  onBookmark,
  disableBookmark = false,
  hasUserCommented = false,
}: VideoPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'video' | 'user'>('video');
  const [reportReason, setReportReason] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(comments);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);
  const [localHasUserCommented, setLocalHasUserCommented] = useState(hasUserCommented);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  // Update local state when props change
  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLocalIsBookmarked(isBookmarked);
  }, [isBookmarked]);

  useEffect(() => {
    setLocalHasUserCommented(hasUserCommented);
  }, [hasUserCommented]);

  // Check if user has commented when component mounts or user changes
  useEffect(() => {
    const checkUserComment = async () => {
      if (videoId && user) {
        const { data } = await supabase
          .from('comments')
          .select('id')
          .eq('video_id', videoId)
          .eq('user_id', user.id)
          .limit(1);
        
        setLocalHasUserCommented((data && data.length > 0) || false);
      } else {
        setLocalHasUserCommented(false);
      }
    };

    checkUserComment();
  }, [videoId, user]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play();
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      setShowUnmuteHint(false);
    }
  };

  const handleReport = async () => {
    if (!user) {
      toast.error("Du må være logget inn for å rapportere");
      return;
    }

    if (!reportReason.trim()) {
      toast.error("Vennligst fyll ut en grunn for rapporten");
      return;
    }

    try {
      if (reportType === 'video' && videoId) {
        const { error } = await supabase
          .from('video_reports')
          .insert({
            video_id: videoId,
            reporter_id: user.id,
            reason: reportReason.trim(),
          });

        if (error) throw error;
        toast.success("Video rapportert");
      } else if (reportType === 'user' && userId) {
        const { error } = await supabase
          .from('user_reports')
          .insert({
            reported_user_id: userId,
            reporter_id: user.id,
            reason: reportReason.trim(),
          });

        if (error) throw error;
        toast.success("Bruker rapportert");
      }

      setReportDialogOpen(false);
      setReportReason("");
    } catch (error: any) {
      console.error('Report error:', error);
      if (error.code === '23505') {
        toast.error("Du har allerede rapportert dette");
      } else {
        toast.error("Kunne ikke sende rapport");
      }
    }
  };

  return (
    <div className="relative h-screen snap-start snap-always bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        className="h-full w-full object-cover"
      />

      {/* Mute Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 transition-all z-10"
      >
        {isMuted ? <VolumeX className="h-6 w-6 text-red-400" /> : <Volume2 className="h-6 w-6 text-green-400" />}
      </Button>

      {/* More Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 bg-black/50 hover:bg-black/70 transition-all z-10"
          >
            <MoreVertical className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background">
          <DropdownMenuItem 
            onClick={() => {
              setReportType('video');
              setReportDialogOpen(true);
            }}
            className="gap-2 cursor-pointer"
          >
            <Flag className="h-4 w-4" />
            Rapporter video
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              setReportType('user');
              setReportDialogOpen(true);
            }}
            className="gap-2 cursor-pointer"
          >
            <Flag className="h-4 w-4" />
            Rapporter bruker
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Unmute Hint */}
      {isMuted && showUnmuteHint && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/80 text-white px-6 py-3 rounded-lg flex items-center gap-2 animate-pulse">
            <VolumeX className="h-5 w-5" />
            <span className="text-sm">Trykk for å skru på lyd</span>
          </div>
        </div>
      )}

      {/* Video Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-12 w-12 rounded-full border-2 border-white overflow-hidden">
              <img 
                src={avatarUrl}
                alt={username}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              @{username}
              <VerificationBadge followersCount={followersCount} size="sm" />
            </h3>
          </div>
          <p className="text-sm text-foreground/90">{description}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setLocalIsLiked(!localIsLiked);
              onLike?.();
            }}
            className={cn(
              "h-12 w-12 rounded-full hover:scale-110 transition-transform",
              localIsLiked && "text-primary animate-pulse-glow"
            )}
          >
            <Heart className={cn("h-7 w-7", localIsLiked && "fill-current")} />
          </Button>
          <span className="text-xs font-semibold">{likes.toLocaleString("nb-NO")}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (videoId) {
                setCommentsOpen(true);
              } else {
                onComment?.();
              }
            }}
            className={cn(
              "h-12 w-12 rounded-full hover:scale-110 transition-transform",
              localHasUserCommented && "text-primary"
            )}
          >
            <MessageCircle className={cn("h-7 w-7", localHasUserCommented && "fill-current")} />
          </Button>
          <span className="text-xs font-semibold">{localCommentCount.toLocaleString("nb-NO")}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setLocalIsBookmarked(!localIsBookmarked);
            onBookmark?.();
          }}
          className={cn(
            "h-12 w-12 rounded-full hover:scale-110 transition-transform",
            localIsBookmarked && "text-primary"
          )}
        >
          <Bookmark className={cn("h-7 w-7", localIsBookmarked && "fill-current")} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onShare}
          className="h-12 w-12 rounded-full hover:scale-110 transition-transform"
        >
          <Share2 className="h-7 w-7" />
        </Button>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>
              Rapporter {reportType === 'video' ? 'video' : 'bruker'}
            </DialogTitle>
            <DialogDescription>
              {reportType === 'video' 
                ? 'Beskriv hvorfor denne videoen bryter retningslinjene'
                : `Beskriv hvorfor @${username} bryter retningslinjene`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Skriv grunnen for rapporten..."
              className="min-h-[120px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Rapporten blir sendt til administratorer for gjennomgang.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={handleReport} variant="destructive">
              <Flag className="h-4 w-4 mr-2" />
              Send rapport
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Sheet */}
      {videoId && (
        <CommentsSheet
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
          videoId={videoId}
          onCommentAdded={() => setLocalCommentCount(prev => prev + 1)}
          onUserCommentStatusChange={(hasCommented) => setLocalHasUserCommented(hasCommented)}
        />
      )}
    </div>
  );
};
