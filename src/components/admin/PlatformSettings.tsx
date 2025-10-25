import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const PlatformSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [maxDuration, setMaxDuration] = useState("");
  const [maxFileSize, setMaxFileSize] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['max_video_duration_seconds', 'max_file_size_mb']);

      if (error) throw error;

      data?.forEach((setting) => {
        if (setting.setting_key === 'max_video_duration_seconds') {
          setMaxDuration(setting.setting_value as string);
        } else if (setting.setting_key === 'max_file_size_mb') {
          setMaxFileSize(setting.setting_value as string);
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke laste innstillinger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const updates = [
        {
          setting_key: 'max_video_duration_seconds',
          setting_value: maxDuration,
        },
        {
          setting_key: 'max_file_size_mb',
          setting_value: maxFileSize,
        },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('platform_settings')
          .update({ setting_value: update.setting_value })
          .eq('setting_key', update.setting_key);

        if (error) throw error;
      }

      toast({
        title: "Innstillinger lagret",
        description: "Plattforminnstillingene har blitt oppdatert",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke lagre innstillinger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video-innstillinger</CardTitle>
          <CardDescription>
            Konfigurer begrensninger for videoinnsendelser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Maksimal videolengde (sekunder):
            </label>
            <Input
              type="number"
              value={maxDuration}
              onChange={(e) => setMaxDuration(e.target.value)}
              placeholder="180"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Standard: 180 sekunder (3 minutter)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Maksimal filstørrelse (MB):
            </label>
            <Input
              type="number"
              value={maxFileSize}
              onChange={(e) => setMaxFileSize(e.target.value)}
              placeholder="100"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Standard: 100 MB
            </p>
          </div>

          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lagre innstillinger
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
