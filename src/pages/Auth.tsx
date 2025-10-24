import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Ugyldig e-postadresse" }),
  password: z.string().min(6, { message: "Passord må være minst 6 tegn" }),
});

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Ugyldig e-postadresse" }),
  password: z.string().min(6, { message: "Passord må være minst 6 tegn" }),
  username: z.string().trim().min(3, { message: "Brukernavn må være minst 3 tegn" }).max(30, { message: "Brukernavn kan ikke være mer enn 30 tegn" }),
  displayName: z.string().trim().min(2, { message: "Visningsnavn må være minst 2 tegn" }).max(50, { message: "Visningsnavn kan ikke være mer enn 50 tegn" }),
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    username: "",
    displayName: "",
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = loginSchema.parse(loginForm);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Feil e-post eller passord");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Velkommen tilbake!");
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("En feil oppstod ved innlogging");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signupSchema.parse(signupForm);

      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: validated.username,
            display_name: validated.displayName,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("E-posten er allerede registrert");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Konto opprettet! Logger deg inn...");
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("En feil oppstod ved registrering");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-card border-border">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center font-bold text-3xl mx-auto mb-4">
            T
          </div>
          <h1 className="text-2xl font-bold">Velkommen til Tikitok</h1>
          <p className="text-muted-foreground">Norges nye videoplattform</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="login">Logg inn</TabsTrigger>
            <TabsTrigger value="signup">Registrer</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">E-post</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="din@epost.no"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="bg-secondary border-none mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="login-password">Passord</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="bg-secondary border-none mt-1"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Logger inn..." : "Logg inn"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-email">E-post</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="din@epost.no"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  className="bg-secondary border-none mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-username">Brukernavn</Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="brukernavn"
                  value={signupForm.username}
                  onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                  className="bg-secondary border-none mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-displayname">Visningsnavn</Label>
                <Input
                  id="signup-displayname"
                  type="text"
                  placeholder="Ditt navn"
                  value={signupForm.displayName}
                  onChange={(e) => setSignupForm({ ...signupForm, displayName: e.target.value })}
                  className="bg-secondary border-none mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-password">Passord</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="bg-secondary border-none mt-1"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Oppretter konto..." : "Opprett konto"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>For testing: Bruk en av testbrukerne</p>
          <p className="text-xs mt-1">naturelsker@tikitok.no / Test123!</p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
