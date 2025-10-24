import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Users, CheckCircle2, XCircle } from "lucide-react";

const DevTools = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const createTestUsers = async () => {
    setIsCreating(true);
    setResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-test-users', {
        body: {}
      });

      if (error) {
        console.error('Error calling function:', error);
        toast.error(`Feil ved oppretting av brukere: ${error.message}`);
        return;
      }

      console.log('Function response:', data);
      setResults(data.results || []);
      
      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      const failCount = data.results?.filter((r: any) => !r.success).length || 0;
      
      if (successCount > 0) {
        toast.success(`${successCount} testbrukere opprettet!`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} brukere feilet`);
      }
    } catch (err) {
      console.error('Exception:', err);
      toast.error('En feil oppstod');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Developer Tools</h1>
        
        <Card className="p-6 mb-6 bg-card border-border">
          <div className="flex items-start gap-4">
            <Users className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Opprett testbrukere</h2>
              <p className="text-muted-foreground mb-4">
                Oppretter 10 testbrukere med profiler og statistikk. Alle brukere har passordet: <code className="bg-secondary px-2 py-1 rounded">Test123!</code>
              </p>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Testbrukere som opprettes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>naturelsker@tikitok.no - Naturelsker</li>
                  <li>nordlysguide@tikitok.no - Nordlys Guide</li>
                  <li>oslovibes@tikitok.no - Oslo Vibes</li>
                  <li>bergenskok@tikitok.no - Bergens Kokk</li>
                  <li>fjellvandrer@tikitok.no - Fjellvandreren</li>
                  <li>trondheimstudie@tikitok.no - Trondheim Student</li>
                  <li>skatepro@tikitok.no - Skate Pro</li>
                  <li>musikklærer@tikitok.no - Musikkpedagog</li>
                  <li>fotballkjempe@tikitok.no - Fotball Fan</li>
                  <li>kunstneren@tikitok.no - Digital Artist</li>
                </ul>
              </div>

              <Button
                onClick={createTestUsers}
                disabled={isCreating}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isCreating ? "Oppretter brukere..." : "Opprett 10 testbrukere"}
              </Button>
            </div>
          </div>
        </Card>

        {results.length > 0 && (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">Resultater</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary"
                >
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">@{result.username}</p>
                    {!result.success && result.error && (
                      <p className="text-sm text-muted-foreground">{result.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DevTools;
