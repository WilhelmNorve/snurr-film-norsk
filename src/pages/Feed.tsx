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
