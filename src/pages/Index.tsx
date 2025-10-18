import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, FileCheck, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center" 
                 style={{ boxShadow: "var(--shadow-glow)" }}>
              <Shield className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-white">Security File Locker</span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="secondary">
            Get Started
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent mb-6" 
                 style={{ boxShadow: "var(--shadow-glow)" }}>
              <Shield className="w-12 h-12 text-accent-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Your Files, Encrypted & Secure
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Protect your sensitive files with military-grade AES-256 encryption. 
              Only you hold the key to unlock your data.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Lock className="w-5 h-5 mr-2" />
                Start Protecting Files
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AES-256 Encryption</h3>
              <p className="text-white/80">
                Military-grade encryption keeps your files secure from unauthorized access
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Password Protected</h3>
              <p className="text-white/80">
                Only you know the password to decrypt your files - even we can't access them
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Client-Side Security</h3>
              <p className="text-white/80">
                Files are encrypted on your device before upload for maximum privacy
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
