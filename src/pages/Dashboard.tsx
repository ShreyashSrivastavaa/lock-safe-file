import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Upload, LogOut, Lock, Unlock, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";
import { Session } from "@supabase/supabase-js";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session && event === "SIGNED_OUT") {
          navigate("/auth");
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    }
  };

  const handleFileUploaded = () => {
    // Trigger refresh of file list
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your secure vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Security File Locker</h1>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload & Encrypt File
              </CardTitle>
              <CardDescription>
                Upload a file and encrypt it with a password of your choice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileUploaded={handleFileUploaded} userId={session?.user?.id || ""} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Information
              </CardTitle>
              <CardDescription>
                How your files are protected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">AES-256 Encryption</h4>
                  <p className="text-xs text-muted-foreground">
                    Military-grade encryption secures your files
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Password Protected</h4>
                  <p className="text-xs text-muted-foreground">
                    Only you know the password to decrypt
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Unlock className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Client-Side Encryption</h4>
                  <p className="text-xs text-muted-foreground">
                    Files are encrypted on your device before upload
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Encrypted Files</CardTitle>
            <CardDescription>
              Manage and decrypt your secure files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileList key={refreshKey} userId={session?.user?.id || ""} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
