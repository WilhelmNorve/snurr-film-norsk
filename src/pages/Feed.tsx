import { useState, useEffect } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Mock data - in production this would come from the API
const mockVideos = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    username: "naturelsker",
    avatarUrl: "/avatars/user1.png",
    description: "Vakker morgen i norsk skog 🌲 #norge #natur",
    likes: 12500,
    comments: 342,
    followersCount: 15200,
    userId: undefined,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    username: "nordlysguide",
    avatarUrl: "/avatars/user2.png",
    description: "Nordlys over Tromsø i natt! Utrolig 😍 #nordlys #tromsø",
    likes: 45200,
    comments: 891,
    followersCount: 45200,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    username: "oslovibes",
    avatarUrl: "/avatars/user3.png",
    description: "Fredagskveld i Oslo! 🎉 #oslo #byliv",
    likes: 8900,
    comments: 234,
    followersCount: 8900,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    username: "bergenskok",
    avatarUrl: "/avatars/user4.png",
    description: "Bølgene ved vestlandet 🌊 #hav #natur",
    likes: 15600,
    comments: 423,
    followersCount: 23400,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    username: "fjellvandrer",
    avatarUrl: "/avatars/user5.png",
    description: "Produktiv dag på kontoret 💻 #jobb #tech",
    likes: 7800,
    comments: 156,
    followersCount: 34500,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    username: "partypeople",
    avatarUrl: "/avatars/partypeople.png",
    description: "Beste festen i år! 🎊 #fest #venner",
    likes: 23400,
    comments: 567,
    followersCount: 21500,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    username: "solnedgang",
    avatarUrl: "/avatars/solnedgang.png",
    description: "Magisk solnedgang i kveld 🌅 #sunset #vakkert",
    likes: 34200,
    comments: 789,
    followersCount: 34200,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    username: "skaternorge",
    avatarUrl: "/avatars/skaternorge.png",
    description: "Nye triks i dag! 🛹 #skateboard #sport",
    likes: 19800,
    comments: 445,
    followersCount: 19800,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    username: "kaffeguide",
    avatarUrl: "/avatars/kaffeguide.png",
    description: "Perfekt kaffe om morgenen ☕ #kaffe #morgen",
    likes: 11200,
    comments: 234,
    followersCount: 11200,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    username: "bokelsker",
    avatarUrl: "/avatars/bokelsker.png",
    description: "Lesestund i naturen 📚 #bøker #lesing",
    likes: 9600,
    comments: 178,
    followersCount: 9600,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    username: "byfotograf",
    avatarUrl: "/avatars/byfotograf.png",
    description: "Oslo by night 🌃 #oslo #nattfoto",
    likes: 27300,
    comments: 612,
    followersCount: 27300,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    username: "treningsglede",
    avatarUrl: "/avatars/treningsglede.png",
    description: "Morgenløp ved stranda 🏃‍♂️ #trening #løping",
    likes: 16700,
    comments: 389,
    followersCount: 16700,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    username: "yogalivet",
    avatarUrl: "/avatars/yogalivet.png",
    description: "Fredelig meditasjon 🧘‍♀️ #yoga #meditasjon",
    likes: 21500,
    comments: 456,
    followersCount: 21500,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    username: "matglede",
    avatarUrl: "/avatars/matglede.png",
    description: "Pizza med venner! 🍕 #mat #hygge",
    likes: 18900,
    comments: 523,
    followersCount: 18900,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    username: "fjellvandrer",
    avatarUrl: "/avatars/user5.png",
    description: "Fantastisk utsikt i fjellet! ⛰️ #fjell #tur",
    likes: 42100,
    comments: 934,
    followersCount: 42100,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000016",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    username: "kunstner_no",
    avatarUrl: "/avatars/kunstner_no.png",
    description: "Ny maling i dag 🎨 #kunst #maleri",
    likes: 13400,
    comments: 267,
    followersCount: 13400,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000017",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    username: "gitargutten",
    avatarUrl: "/avatars/gitargutten.png",
    description: "Øver på ny sang 🎸 #musikk #gitar",
    likes: 25600,
    comments: 678,
    followersCount: 25600,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000018",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    username: "regndager",
    avatarUrl: "/avatars/regndager.png",
    description: "Koselig regn i dag ☔ #regn #stemning",
    likes: 8700,
    comments: 145,
    followersCount: 8700,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000019",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    username: "hundeliv",
    avatarUrl: "/avatars/hundeliv.png",
    description: "Tur i parken med Luna 🐕 #hund #tur",
    likes: 31200,
    comments: 812,
    followersCount: 31200,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "00000000-0000-0000-0000-000000000020",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    username: "fyrverkeri",
    avatarUrl: "/avatars/fyrverkeri.png",
    description: "Nyttårsfeiring! 🎆 #nyttår #feiring",
    likes: 56700,
    comments: 1245,
    followersCount: 65000,
    isLiked: false,
    isBookmarked: false,
  },
];

// Map usernames to their avatar URLs (both from database and local files)
const AVATAR_OVERRIDES: Record<string, string> = {
  // Users in database - use Supabase storage URLs
  naturelsker: "https://olrrzcpccoqqczjcfohh.supabase.co/storage/v1/object/public/avatars/47a36997-56e2-41ab-809f-8280a3453a1a/avatar.png",
  nordlysguide: "https://olrrzcpccoqqczjcfohh.supabase.co/storage/v1/object/public/avatars/f431277e-7996-4b46-8e9a-3cb1368c46c4/avatar.png",
  oslovibes: "https://olrrzcpccoqqczjcfohh.supabase.co/storage/v1/object/public/avatars/7dd03926-94bb-4159-a22d-068d4c925bb8/avatar.png",
  bergenskok: "https://olrrzcpccoqqczjcfohh.supabase.co/storage/v1/object/public/avatars/2d56023b-d217-40ba-8f0a-5a40c9399d87/avatar.png",
  fjellvandrer: "https://olrrzcpccoqqczjcfohh.supabase.co/storage/v1/object/public/avatars/cf22ade8-4f9a-460e-ab01-4a94a3bdc43c/avatar.png",
  kunstneren: "https://olrrzcpccoqqczjcfohh.supabase.co/storage/v1/object/public/avatars/e61973f7-51e3-4290-bd85-fed7efc1cdba/avatar.png",
  skatepro: "https://olrrzcpccoqqczjcfohh.supabase.co/storage/v1/object/public/avatars/b090faa6-5fb1-42f1-8195-d7db6e78258e/avatar.png",
  trondheimstudie: "https://olrrzcpccoqqczjcfohh.supabase.co/storage/v1/object/public/avatars/27a0694b-b961-47aa-a03e-4be4d9c4b152/avatar.png",
  fotballkjempe: "https://olrrzcpccoqqczjcfohh.supabase.co/storage/v1/object/public/avatars/751de1e0-3597-4c47-8f02-d7a63995fccb/avatar.png",
  
  // Fictional users - use local generated images
  partypeople: "/avatars/partypeople.png",
  solnedgang: "/avatars/solnedgang.png",
  skaternorge: "/avatars/skaternorge.png",
  kaffeguide: "/avatars/kaffeguide.png",
  bokelsker: "/avatars/bokelsker.png",
  byfotograf: "/avatars/byfotograf.png",
  treningsglede: "/avatars/treningsglede.png",
  yogalivet: "/avatars/yogalivet.png",
  matglede: "/avatars/matglede.png",
  kunstner_no: "/avatars/kunstner_no.png",
  gitargutten: "/avatars/gitargutten.png",
  regndager: "/avatars/regndager.png",
  hundeliv: "/avatars/hundeliv.png",
  fyrverkeri: "/avatars/fyrverkeri.png",
};

const Feed = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState(mockVideos);
  const [profiles, setProfiles] = useState<Record<string, { avatar_url: string | null, followers_count: number }>>({});
  const [realVideos, setRealVideos] = useState<any[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userBookmarks, setUserBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      // Fetch profiles with followers count
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('username, avatar_url, followers_count');
      
      if (profilesData && !profilesError) {
        const profileMap = profilesData.reduce((acc, profile) => {
          acc[profile.username] = { 
            avatar_url: profile.avatar_url,
            followers_count: profile.followers_count || 0
          };
          return acc;
        }, {} as Record<string, { avatar_url: string | null, followers_count: number }>);
        setProfiles(profileMap);
      }

      // Fetch real videos from database, sorted by newest first
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          description,
          video_url,
          thumbnail_url,
          likes_count,
          comments_count,
          views_count,
          created_at,
          user_id,
          profiles:user_id (username, avatar_url, followers_count, id)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (videosData && !videosError) {
        setRealVideos(videosData);
      }

      // Fetch user's likes if logged in
      if (user) {
        const { data: likesData } = await supabase
          .from('video_likes')
          .select('video_id')
          .eq('user_id', user.id);
        
        if (likesData) {
          setUserLikes(new Set(likesData.map(like => like.video_id)));
        }

        // Fetch user's bookmarks
        const { data: bookmarksData } = await supabase
          .from('bookmarks')
          .select('video_id')
          .eq('user_id', user.id);
        
        if (bookmarksData) {
          setUserBookmarks(new Set(bookmarksData.map(b => b.video_id)));
        }
      }
    };

    fetchData();
  }, [user]);

  const handleLike = async (videoId: string) => {
    if (!user) {
      toast.error("Du må være logget inn for å like");
      return;
    }

    const isLiked = userLikes.has(videoId);

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);
        
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
      } else {
        // Like
        await supabase
          .from('video_likes')
          .insert({ video_id: videoId, user_id: user.id });
        
        setUserLikes(prev => new Set(prev).add(videoId));
      }

      // Update local state for immediate feedback
      setRealVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, likes_count: v.likes_count + (isLiked ? -1 : 1) }
          : v
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Kunne ikke oppdatere like");
    }
  };

  const handleBookmark = async (videoId: string) => {
    if (!user) {
      toast.error("Du må være logget inn for å lagre");
      return;
    }

    const isBookmarked = userBookmarks.has(videoId);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);
        if (error) throw error;
        
        setUserBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
        toast.success("Fjernet fra lagrede");
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({ video_id: videoId, user_id: user.id });
        if (error) throw error;
        
        setUserBookmarks(prev => new Set(prev).add(videoId));
        toast.success("Lagret!");
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error("Kunne ikke oppdatere lagring");
    }
  };

  const handleShare = async (videoId: string, username: string) => {
    const shareUrl = `${window.location.origin}/?video=${videoId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Video fra @${username}`,
          url: shareUrl
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link kopiert!");
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error("Kunne ikke kopiere link");
      }
    }
  };

  // Combine real videos with mock videos, real videos first
  const allVideos = [
    ...realVideos.map((video: any) => ({
      id: video.id,
      videoUrl: video.video_url,
      username: video.profiles?.username || 'unknown',
      avatarUrl: video.profiles?.avatar_url || '',
      description: video.description || video.title,
      likes: video.likes_count || 0,
      comments: video.comments_count || 0,
      followersCount: video.profiles?.followers_count || 0,
      userId: video.profiles?.id || video.user_id,
      isLiked: userLikes.has(video.id),
      isBookmarked: userBookmarks.has(video.id),
    })),
    ...videos.map(v => ({ ...v, userId: undefined as string | undefined }))
  ];

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide pb-16 md:pb-0 md:pl-20">
      <Navigation />
      {allVideos.map((video) => {
        const profile = profiles[video.username];
        const override = AVATAR_OVERRIDES[video.username];
        const avatarUrl = override || profile?.avatar_url || video.avatarUrl;
        const followersCount = profile?.followers_count || video.followersCount || 0;
        
        return (
          <VideoPlayer
            key={video.id}
            videoUrl={video.videoUrl}
            username={video.username}
            avatarUrl={avatarUrl}
            description={video.description}
            likes={video.likes}
            comments={video.comments}
            followersCount={followersCount}
            videoId={video.id}
            userId={video.userId}
            isLiked={video.isLiked}
            isBookmarked={video.isBookmarked}
            onLike={() => handleLike(video.id)}
            onBookmark={() => handleBookmark(video.id)}
            onComment={() => console.log("Comment on", video.id)}
            onShare={() => handleShare(video.id, video.username)}
          />
        );
      })}
    </div>
  );
};

export default Feed;
