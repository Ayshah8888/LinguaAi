import { useAuth } from "@workspace/replit-auth-web";
import { BookOpen, Languages, Brain, Mic, Trophy, Zap, Globe, Star } from "lucide-react";

const FEATURES = [
  { icon: Languages, label: "English A1–C2", desc: "Complete CEFR curriculum" },
  { icon: Brain, label: "AI Tutor", desc: "Real-time streaming chat" },
  { icon: Mic, label: "Voice Practice", desc: "Pronunciation feedback" },
  { icon: Trophy, label: "Leaderboard", desc: "Compete worldwide" },
  { icon: Zap, label: "Spaced Repetition", desc: "SM-2 smart flashcards" },
  { icon: Globe, label: "Japanese Hub", desc: "Hiragana to advanced kanji" },
];

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left — Branding */}
        <div className="space-y-8 text-center md:text-left">
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-3xl tracking-tight">LinguaAI</span>
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-tight">
              Learn languages<br />
              <span className="text-primary">with AI power</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-sm">
              Master English or Japanese from A1 to C2 with your personal AI tutor, voice practice, and spaced repetition.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto md:mx-0">
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/30 border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-2 justify-center md:justify-start">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            ))}
            <span className="text-sm text-muted-foreground ml-1">Trusted by learners worldwide</span>
          </div>
        </div>

        {/* Right — Login card */}
        <div className="flex justify-center md:justify-end">
          <div className="w-full max-w-sm">
            <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.3)]">
              {/* Card header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold">Welcome back</h2>
                <p className="text-muted-foreground text-sm mt-1">Sign in to continue your learning journey</p>
              </div>

              {/* Login button */}
              <button
                onClick={login}
                className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all duration-200 shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <BookOpen className="w-5 h-5" />
                Continue with LinguaAI
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">secure login</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Features summary */}
              <div className="space-y-3">
                {[
                  "Your own private progress & streak",
                  "Personal leaderboard ranking",
                  "AI Tutor conversation history",
                  "Sync across all your devices",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground/60 mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
