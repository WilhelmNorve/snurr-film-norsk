import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CalendarIcon, Upload, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Fetch current profile data
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data && !error) {
        setUsername(data.username || "");
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setPhone(data.phone_number || "");
        setLocation(data.location || "");
        setWebsite(data.website || "");
        setGender(data.gender || "");
        setNationality(data.nationality || "");
        setAvatarUrl(data.avatar_url || "");
        if (data.date_of_birth) {
          setDateOfBirth(new Date(data.date_of_birth));
        }
      }
    };

    if (user.email) {
      setEmail(user.email);
    }

    fetchProfile();
  }, [user, navigate]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/avatar.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      toast.success("Profilbilde lastet opp!");
    } catch (error: any) {
      toast.error("Kunne ikke laste opp bilde: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (email !== user?.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) {
        throw error;
      }
      toast.info("Bekreft ny e-post i innboksen din");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Update email if changed
      await handleEmailUpdate();

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          display_name: displayName,
          bio,
          phone_number: phone,
          location,
          website,
          gender,
          nationality,
          date_of_birth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
          avatar_url: avatarUrl,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Profil oppdatert!");
      navigate("/profile");
    } catch (error: any) {
      toast.error("Kunne ikke oppdatere profil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pl-20">
      <Navigation />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Rediger profil</h1>
        </div>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <Upload className="h-4 w-4" />
                <span>{uploading ? "Laster opp..." : "Endre profilbilde"}</span>
              </div>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </Label>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Brukernavn</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="brukernavn"
              />
            </div>

            <div>
              <Label htmlFor="displayName">Visningsnavn</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ditt navn"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Fortell litt om deg selv..."
                rows={4}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Kontaktinformasjon</h2>
            
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.no"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+47 123 45 678"
              />
            </div>

            <div>
              <Label htmlFor="website">Nettside</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://dittnettsted.no"
              />
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Personlig informasjon</h2>

            <div>
              <Label>Fødselsdato</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "PPP", { locale: nb }) : "Velg dato"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="gender">Kjønn</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg kjønn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mann">Mann</SelectItem>
                  <SelectItem value="kvinne">Kvinne</SelectItem>
                  <SelectItem value="ikke-binær">Ikke-binær</SelectItem>
                  <SelectItem value="annet">Annet</SelectItem>
                  <SelectItem value="ønsker-ikke-å-oppgi">Ønsker ikke å oppgi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Sted</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Oslo, Norge"
              />
            </div>

            <div>
              <Label htmlFor="nationality">Nasjonalitet</Label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg nasjonalitet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="norsk">Norsk 🇳🇴</SelectItem>
                  <SelectItem value="svensk">Svensk 🇸🇪</SelectItem>
                  <SelectItem value="dansk">Dansk 🇩🇰</SelectItem>
                  <SelectItem value="finsk">Finsk 🇫🇮</SelectItem>
                  <SelectItem value="islandsk">Islandsk 🇮🇸</SelectItem>
                  <SelectItem value="amerikansk">Amerikansk 🇺🇸</SelectItem>
                  <SelectItem value="britisk">Britisk 🇬🇧</SelectItem>
                  <SelectItem value="tysk">Tysk 🇩🇪</SelectItem>
                  <SelectItem value="fransk">Fransk 🇫🇷</SelectItem>
                  <SelectItem value="spansk">Spansk 🇪🇸</SelectItem>
                  <SelectItem value="italiensk">Italiensk 🇮🇹</SelectItem>
                  <SelectItem value="polsk">Polsk 🇵🇱</SelectItem>
                  <SelectItem value="annet">Annet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {loading ? "Lagrer..." : "Lagre endringer"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
              disabled={loading}
            >
              Avbryt
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;