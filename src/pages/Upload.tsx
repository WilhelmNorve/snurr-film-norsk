import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Upload as UploadIcon, Video, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Upload = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      toast.success("Video valgt!");
    } else {
      toast.error("Vennligst velg en videofil");
    }
  };

  const handleUpload = () => {
    if (!videoFile) {
      toast.error("Vennligst velg en video først");
      return;
    }

    // In production, this would upload to the API
    toast.success("Video lastes opp...");
    console.log("Uploading:", { videoFile, caption, hashtags });
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pl-20">
      <Navigation />
      
      <main className="container max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Last opp video</h1>

        <div className="grid gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="mb-6">
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {videoFile ? (
                    <>
                      <Video className="w-12 h-12 mb-3 text-primary" />
                      <p className="mb-2 text-sm font-semibold">{videoFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-12 h-12 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm font-semibold">
                        Klikk for å velge video
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, MOV eller WEBM (maks 500MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="video-upload"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Beskrivelse
                </label>
                <Textarea
                  placeholder="Fortell noe om videoen din..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="min-h-[100px] bg-secondary border-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Hashtags
                </label>
                <Input
                  placeholder="#norge #oslo #travel"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="bg-secondary border-none"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setVideoFile(null);
                setCaption("");
                setHashtags("");
              }}
            >
              Avbryt
            </Button>
            <Button
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
              onClick={handleUpload}
              disabled={!videoFile}
            >
              Publiser
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
