import { useState } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Navigation } from "@/components/Navigation";

// Mock data - in production this would come from the API
const mockVideos = [
  {
    id: "1",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-person-walking-through-a-pine-forest-3-5808-large.mp4",
    username: "naturelsker",
    description: "Vakker morgen i norsk skog 🌲 #norge #natur",
    likes: 12500,
    comments: 342,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "2",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-northern-lights-in-norway-4036-large.mp4",
    username: "nordlysguide",
    description: "Nordlys over Tromsø i natt! Utrolig 😍 #nordlys #tromsø",
    likes: 45200,
    comments: 891,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "3",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4",
    username: "oslovibes",
    description: "Fredagskveld i Oslo! 🎉 #oslo #byliv",
    likes: 8900,
    comments: 234,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "4",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    username: "kystliv",
    description: "Bølgene ved vestlandet 🌊 #hav #natur",
    likes: 15600,
    comments: 423,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "5",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-on-a-laptop-4119-large.mp4",
    username: "techsara",
    description: "Produktiv dag på kontoret 💻 #jobb #tech",
    likes: 7800,
    comments: 156,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "6",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-friends-dancing-at-a-party-4640-large.mp4",
    username: "partypeople",
    description: "Beste festen i år! 🎊 #fest #venner",
    likes: 23400,
    comments: 567,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "7",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-sea-4118-large.mp4",
    username: "solnedgang",
    description: "Magisk solnedgang i kveld 🌅 #sunset #vakkert",
    likes: 34200,
    comments: 789,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "8",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-skateboarding-in-a-parking-lot-1266-large.mp4",
    username: "skaternorge",
    description: "Nye triks i dag! 🛹 #skateboard #sport",
    likes: 19800,
    comments: 445,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "9",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-on-a-table-4169-large.mp4",
    username: "kaffeguide",
    description: "Perfekt kaffe om morgenen ☕ #kaffe #morgen",
    likes: 11200,
    comments: 234,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "10",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-reading-a-book-in-a-forest-5237-large.mp4",
    username: "bokelsker",
    description: "Lesestund i naturen 📚 #bøker #lesing",
    likes: 9600,
    comments: 178,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "11",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1149-large.mp4",
    username: "byfotograf",
    description: "Oslo by night 🌃 #oslo #nattfoto",
    likes: 27300,
    comments: 612,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "12",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-running-on-a-beach-1261-large.mp4",
    username: "treningsglede",
    description: "Morgenløp ved stranda 🏃‍♂️ #trening #løping",
    likes: 16700,
    comments: 389,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "13",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-meditating-on-the-beach-1166-large.mp4",
    username: "yogalivet",
    description: "Fredelig meditasjon 🧘‍♀️ #yoga #meditasjon",
    likes: 21500,
    comments: 456,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "14",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-friends-eating-pizza-4641-large.mp4",
    username: "matglede",
    description: "Pizza med venner! 🍕 #mat #hygge",
    likes: 18900,
    comments: 523,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "15",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-snowy-mountain-range-3295-large.mp4",
    username: "fjellvandrer",
    description: "Fantastisk utsikt i fjellet! ⛰️ #fjell #tur",
    likes: 42100,
    comments: 934,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "16",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-painting-a-picture-4167-large.mp4",
    username: "kunstner_no",
    description: "Ny maling i dag 🎨 #kunst #maleri",
    likes: 13400,
    comments: 267,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "17",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-playing-guitar-4168-large.mp4",
    username: "gitargutten",
    description: "Øver på ny sang 🎸 #musikk #gitar",
    likes: 25600,
    comments: 678,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "18",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-1189-large.mp4",
    username: "regndager",
    description: "Koselig regn i dag ☔ #regn #stemning",
    likes: 8700,
    comments: 145,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "19",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-walking-dog-in-the-park-4639-large.mp4",
    username: "hundeliv",
    description: "Tur i parken med Luna 🐕 #hund #tur",
    likes: 31200,
    comments: 812,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "20",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fireworks-in-the-sky-4158-large.mp4",
    username: "fyrverkeri",
    description: "Nyttårsfeiring! 🎆 #nyttår #feiring",
    likes: 56700,
    comments: 1245,
    isLiked: false,
    isBookmarked: false,
  },
];

const Feed = () => {
  const [videos, setVideos] = useState(mockVideos);

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
      {videos.map((video) => (
        <VideoPlayer
          key={video.id}
          videoUrl={video.videoUrl}
          username={video.username}
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
      ))}
    </div>
  );
};

export default Feed;
