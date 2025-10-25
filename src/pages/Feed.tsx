import { useState, useEffect } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

// Mock data - in production this would come from the API
const mockVideos = [
  {
    id: "1",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    username: "naturelsker",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=nature",
    description: "Vakker morgen i norsk skog 🌲 #norge #natur",
    likes: 12500,
    comments: 342,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "2",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    username: "nordlysguide",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=aurora",
    description: "Nordlys over Tromsø i natt! Utrolig 😍 #nordlys #tromsø",
    likes: 45200,
    comments: 891,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "3",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    username: "oslovibes",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=oslo",
    description: "Fredagskveld i Oslo! 🎉 #oslo #byliv",
    likes: 8900,
    comments: 234,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "4",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    username: "kystliv",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=coast",
    description: "Bølgene ved vestlandet 🌊 #hav #natur",
    likes: 15600,
    comments: 423,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "5",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    username: "techsara",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech",
    description: "Produktiv dag på kontoret 💻 #jobb #tech",
    likes: 7800,
    comments: 156,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "6",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    username: "partypeople",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=party",
    description: "Beste festen i år! 🎊 #fest #venner",
    likes: 23400,
    comments: 567,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "7",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    username: "solnedgang",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sunset",
    description: "Magisk solnedgang i kveld 🌅 #sunset #vakkert",
    likes: 34200,
    comments: 789,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "8",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    username: "skaternorge",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=skate",
    description: "Nye triks i dag! 🛹 #skateboard #sport",
    likes: 19800,
    comments: 445,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "9",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    username: "kaffeguide",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=coffee",
    description: "Perfekt kaffe om morgenen ☕ #kaffe #morgen",
    likes: 11200,
    comments: 234,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "10",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    username: "bokelsker",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=book",
    description: "Lesestund i naturen 📚 #bøker #lesing",
    likes: 9600,
    comments: 178,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "11",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    username: "byfotograf",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=photo",
    description: "Oslo by night 🌃 #oslo #nattfoto",
    likes: 27300,
    comments: 612,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "12",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    username: "treningsglede",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=fitness",
    description: "Morgenløp ved stranda 🏃‍♂️ #trening #løping",
    likes: 16700,
    comments: 389,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "13",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    username: "yogalivet",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=yoga",
    description: "Fredelig meditasjon 🧘‍♀️ #yoga #meditasjon",
    likes: 21500,
    comments: 456,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "14",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    username: "matglede",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=food",
    description: "Pizza med venner! 🍕 #mat #hygge",
    likes: 18900,
    comments: 523,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "15",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    username: "fjellvandrer",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=hiker",
    description: "Fantastisk utsikt i fjellet! ⛰️ #fjell #tur",
    likes: 42100,
    comments: 934,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "16",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    username: "kunstner_no",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=artist",
    description: "Ny maling i dag 🎨 #kunst #maleri",
    likes: 13400,
    comments: 267,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "17",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    username: "gitargutten",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=music",
    description: "Øver på ny sang 🎸 #musikk #gitar",
    likes: 25600,
    comments: 678,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "18",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    username: "regndager",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=rain",
    description: "Koselig regn i dag ☔ #regn #stemning",
    likes: 8700,
    comments: 145,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "19",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    username: "hundeliv",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dog",
    description: "Tur i parken med Luna 🐕 #hund #tur",
    likes: 31200,
    comments: 812,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "20",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    username: "fyrverkeri",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=fireworks",
    description: "Nyttårsfeiring! 🎆 #nyttår #feiring",
    likes: 56700,
    comments: 1245,
    isLiked: false,
    isBookmarked: false,
  },
];

const Feed = () => {
  const [videos, setVideos] = useState(mockVideos);
  const [profiles, setProfiles] = useState<Record<string, { avatar_url: string | null }>>({});

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url');
      
      if (data && !error) {
        const profileMap = data.reduce((acc, profile) => {
          acc[profile.username] = { avatar_url: profile.avatar_url };
          return acc;
        }, {} as Record<string, { avatar_url: string | null }>);
        setProfiles(profileMap);
      }
    };

    fetchProfiles();
  }, []);

  const handleLike = (videoId: string) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isLiked: !video.isLiked,
              likes: video.isLiked ? video.likes - 1 : video.likes + 1,
            }
          : video
      )
    );
  };

  const handleBookmark = (videoId: string) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id === videoId ? { ...video, isBookmarked: !video.isBookmarked } : video
      )
    );
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide pb-16 md:pb-0 md:pl-20">
      <Navigation />
      {videos.map((video) => {
        const profile = profiles[video.username];
        const avatarUrl = profile?.avatar_url || video.avatarUrl;
        
        return (
          <VideoPlayer
            key={video.id}
            videoUrl={video.videoUrl}
            username={video.username}
            avatarUrl={avatarUrl}
            description={video.description}
            likes={video.likes}
            comments={video.comments}
            isLiked={video.isLiked}
            isBookmarked={video.isBookmarked}
            onLike={() => handleLike(video.id)}
            onBookmark={() => handleBookmark(video.id)}
            onComment={() => console.log("Comment on", video.id)}
            onShare={() => console.log("Share", video.id)}
          />
        );
      })}
    </div>
  );
};

export default Feed;
