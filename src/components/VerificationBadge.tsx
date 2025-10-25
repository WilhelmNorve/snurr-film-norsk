import { Star } from "lucide-react";
import { getBadgeLevel, getBadgeInfo } from "@/lib/badges";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  followersCount: number;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export const VerificationBadge = ({ 
  followersCount, 
  size = "md",
  showTooltip = true 
}: VerificationBadgeProps) => {
  const level = getBadgeLevel(followersCount);
  
  if (!level) return null;

  const badgeInfo = getBadgeInfo(level);
  if (!badgeInfo) return null;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const badge = (
    <div 
      className="inline-flex items-center justify-center rounded-full p-0.5 animate-pulse-subtle"
      style={{ background: badgeInfo.gradient }}
    >
      <Star 
        className={`${sizeClasses[size]} fill-current text-white drop-shadow-lg`}
        strokeWidth={2}
      />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{badgeInfo.name}</p>
            <p className="text-xs text-muted-foreground">
              {followersCount.toLocaleString('nb-NO')} følgere
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
