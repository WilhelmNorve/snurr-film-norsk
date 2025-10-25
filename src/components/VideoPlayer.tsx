import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  username: string;
  description: string;
  likes: number;
  comments: number;
  avatarUrl?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
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
  onLike,
  onComment,
  onShare,
  onBookmark,
}: VideoPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
            <h3 className="font-bold text-lg">@{username}</h3>
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
            onClick={onLike}
            className={cn(
              "h-12 w-12 rounded-full hover:scale-110 transition-transform",
              isLiked && "text-primary animate-pulse-glow"
            )}
          >
            <Heart className={cn("h-7 w-7", isLiked && "fill-current")} />
          </Button>
          <span className="text-xs font-semibold">{likes.toLocaleString("nb-NO")}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onComment}
            className="h-12 w-12 rounded-full hover:scale-110 transition-transform"
          >
            <MessageCircle className="h-7 w-7" />
          </Button>
          <span className="text-xs font-semibold">{comments.toLocaleString("nb-NO")}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onBookmark}
          className={cn(
            "h-12 w-12 rounded-full hover:scale-110 transition-transform",
            isBookmarked && "text-primary"
          )}
        >
          <Bookmark className={cn("h-7 w-7", isBookmarked && "fill-current")} />
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
    </div>
  );
};
