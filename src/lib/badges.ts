export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'diamond' | null;

export interface BadgeInfo {
  level: BadgeLevel;
  name: string;
  minFollowers: number;
  color: string;
  gradient: string;
}

export const getBadgeLevel = (followersCount: number): BadgeLevel => {
  if (followersCount >= 60000) return 'diamond';
  if (followersCount >= 40000) return 'gold';
  if (followersCount >= 20000) return 'silver';
  if (followersCount >= 10000) return 'bronze';
  return null;
};

export const getBadgeInfo = (level: BadgeLevel): BadgeInfo | null => {
  const badges: Record<Exclude<BadgeLevel, null>, BadgeInfo> = {
    bronze: {
      level: 'bronze',
      name: 'Bronse Stjerne',
      minFollowers: 10000,
      color: 'hsl(25, 75%, 47%)',
      gradient: 'linear-gradient(135deg, hsl(25, 75%, 47%) 0%, hsl(30, 70%, 60%) 100%)',
    },
    silver: {
      level: 'silver',
      name: 'Sølv Stjerne',
      minFollowers: 20000,
      color: 'hsl(210, 15%, 65%)',
      gradient: 'linear-gradient(135deg, hsl(210, 15%, 65%) 0%, hsl(210, 20%, 85%) 100%)',
    },
    gold: {
      level: 'gold',
      name: 'Gull Stjerne',
      minFollowers: 40000,
      color: 'hsl(45, 90%, 55%)',
      gradient: 'linear-gradient(135deg, hsl(45, 90%, 55%) 0%, hsl(48, 95%, 70%) 100%)',
    },
    diamond: {
      level: 'diamond',
      name: 'Diamant Stjerne',
      minFollowers: 60000,
      color: 'hsl(200, 85%, 60%)',
      gradient: 'linear-gradient(135deg, hsl(200, 85%, 60%) 0%, hsl(280, 85%, 70%) 100%)',
    },
  };

  return level ? badges[level] : null;
};
