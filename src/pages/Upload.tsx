import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Upload as UploadIcon, Video, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Upload = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      toast.success("Video valgt!");
    } else {
      toast.error("Vennligst velg en videofil");
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !user) {
      toast.error("Vennligst velg en video først");
      return;
    }

    if (!title.trim()) {
      toast.error("Vennligst legg til en tittel");
      return;
    }

    setIsUploading(true);

    try {
      // Upload video to storage
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('videos')
        .upload(fileName, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Create video record in database
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          video_url: publicUrl,
          duration: 0, // You can add video duration detection later
        });

      if (dbError) throw dbError;

      toast.success("Video publisert!");
      setVideoFile(null);
      setTitle("");
      setDescription("");
      navigate("/profile");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Kunne ikke laste opp video. Prøv igjen.");
    } finally {
      setIsUploading(false);
    }
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
                  Tittel *
                </label>
                <Input
                  placeholder="Gi videoen en tittel..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-secondary border-none"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Beskrivelse
                </label>
                <Textarea
                  placeholder="Fortell noe om videoen din... Bruk #hashtags"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] bg-secondary border-none"
                  maxLength={500}
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
                setTitle("");
                setDescription("");
              }}
              disabled={isUploading}
            >
              Avbryt
            </Button>
            <Button
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
              onClick={handleUpload}
              disabled={!videoFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Laster opp...
                </>
              ) : (
                "Publiser"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
