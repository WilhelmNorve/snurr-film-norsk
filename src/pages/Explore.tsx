import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Search, TrendingUp, Play, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface TrendingTopic {
  tag: string;
  views: number;
  displayViews: string;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedVideos, setSuggestedVideos] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [hashtagVideos, setHashtagVideos] = useState<any[]>([]);
  const hashtagVideosSectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\wæøåÆØÅ]+/g;
    return text.match(hashtagRegex) || [];
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M visninger`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K visninger`;
    }
    return `${views} visninger`;
  };

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      setIsLoadingTrending(true);
      const { data: videos } = await supabase
        .from('videos')
        .select('title, description, views_count')
        .eq('is_active', true);

      if (videos) {
        const hashtagStats = new Map<string, number>();

        videos.forEach(video => {
          const hashtags = [
            ...extractHashtags(video.title || ''),
            ...extractHashtags(video.description || '')
          ];

          hashtags.forEach(tag => {
            const normalizedTag = tag.toLowerCase();
            const currentViews = hashtagStats.get(normalizedTag) || 0;
            hashtagStats.set(normalizedTag, currentViews + (video.views_count || 0));
          });
        });

        const trending = Array.from(hashtagStats.entries())
          .map(([tag, views]) => ({
            tag,
            views,
            displayViews: formatViews(views)
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        setTrendingTopics(trending);
      }
      setIsLoadingTrending(false);
    };

    const fetchSuggestedVideos = async () => {
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (videos) {
        setSuggestedVideos(videos);
      }
    };

    fetchTrendingTopics();
    fetchSuggestedVideos();
  }, []);

  const handleHashtagClick = async (hashtag: string) => {
    setSelectedHashtag(hashtag);
    
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${hashtag}%,description.ilike.%${hashtag}%`)
      .order('views_count', { ascending: false })
      .limit(12);

    if (videos) {
      setHashtagVideos(videos);
      
      // Scroll to hashtag videos section
      setTimeout(() => {
        hashtagVideosSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pl-20">
      <Navigation />
      
      <main className="container max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Utforsk</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder="Søk etter videoer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-14 md:h-12 bg-secondary border-none text-base"
            />
          </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg md:text-xl font-semibold">Populært nå</h2>
          </div>
          
          <div className="grid gap-2 md:gap-3">
            {isLoadingTrending ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-5 w-5" />
                  </div>
                </Card>
              ))
            ) : trendingTopics.length > 0 ? (
              trendingTopics.map((topic, index) => (
                <Card
                  key={topic.tag}
                  onClick={() => handleHashtagClick(topic.tag)}
                  className={`p-3 md:p-4 hover:bg-secondary active:scale-[0.98] transition-all cursor-pointer border-border ${
                    selectedHashtag === topic.tag ? 'bg-secondary border-primary' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-base md:text-lg">{topic.tag}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{topic.displayViews}</p>
                    </div>
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4">
                <p className="text-muted-foreground text-center">Ingen trending hashtags ennå</p>
              </Card>
            )}
          </div>
        </section>

        {selectedHashtag && (
          <section ref={hashtagVideosSectionRef} className="mt-6 md:mt-8 scroll-mt-4">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Videoer med {selectedHashtag}</h2>
              <button 
                onClick={() => setSelectedHashtag(null)}
                className="text-sm md:text-base text-muted-foreground hover:text-foreground px-2 py-1 active:scale-95 transition-transform"
              >
                Tilbake
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {hashtagVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => navigate(`/?video=${video.id}`)}
                  className="aspect-[9/16] bg-secondary rounded-lg overflow-hidden cursor-pointer active:scale-95 md:hover:scale-105 transition-transform relative group"
                >
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <video src={video.video_url} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-10 w-10 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 left-2 flex gap-2 text-white text-xs drop-shadow-lg">
                    <span className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded">
                      <Heart className="h-3 w-3" /> {video.likes_count || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 md:mt-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Foreslåtte videoer</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {suggestedVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => navigate(`/?video=${video.id}`)}
                className="aspect-[9/16] bg-secondary rounded-lg overflow-hidden cursor-pointer active:scale-95 md:hover:scale-105 transition-transform relative group"
              >
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <video src={video.video_url} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-10 w-10 md:h-8 md:w-8 text-white" />
                </div>
                <div className="absolute bottom-2 left-2 flex gap-2 text-white text-xs drop-shadow-lg">
                  <span className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded">
                    <Heart className="h-3 w-3" /> {video.likes_count || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Explore;
