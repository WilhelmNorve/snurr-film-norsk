import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const trendingTopics = [
  { id: "1", tag: "#norge", views: "2.5M visninger" },
  { id: "2", tag: "#oslo", views: "1.8M visninger" },
  { id: "3", tag: "#bergen", views: "1.2M visninger" },
  { id: "4", tag: "#nordlys", views: "980K visninger" },
  { id: "5", tag: "#matblogg", views: "750K visninger" },
  { id: "6", tag: "#fotball", views: "650K visninger" },
];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pl-20">
      <Navigation />
      
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Utforsk</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder="Søk etter videoer, brukere eller hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-secondary border-none"
            />
          </div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Populært nå</h2>
          </div>
          
          <div className="grid gap-3">
            {trendingTopics.map((topic) => (
              <Card
                key={topic.id}
                className="p-4 bg-card hover:bg-secondary transition-colors cursor-pointer border-border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{topic.tag}</p>
                    <p className="text-sm text-muted-foreground">{topic.views}</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Foreslåtte videoer</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="aspect-[9/16] bg-secondary rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Video {item}
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
