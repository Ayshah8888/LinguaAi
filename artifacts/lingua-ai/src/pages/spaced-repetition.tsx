import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Brain, CheckCircle2, XCircle, Clock, Star, RotateCcw, ChevronRight, Zap, BookOpen, TrendingUp } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface SRWord {
  id: number;
  word: string;
  translation: string;
  language: string;
  level: string;
  phonetic: string;
  exampleSentence: string;
  exampleTranslation: string;
  category: string;
  reading?: string;
  sr?: { interval: number; repetitions: number; easeFactor: number; dueDate: string };
}

interface SRStats {
  due: number;
  mastered: number;
  learning: number;
  total: number;
  new: number;
}

const QUALITY_LABELS = [
  { q: 0, label: "Blackout", color: "bg-red-600 hover:bg-red-500", desc: "Complete blank" },
  { q: 2, label: "Hard", color: "bg-orange-600 hover:bg-orange-500", desc: "Wrong but remembered" },
  { q: 3, label: "Okay", color: "bg-yellow-600 hover:bg-yellow-500", desc: "Correct with effort" },
  { q: 4, label: "Good", color: "bg-emerald-600 hover:bg-emerald-500", desc: "Correct with pause" },
  { q: 5, label: "Easy", color: "bg-primary hover:bg-primary/90", desc: "Perfect recall" },
];

export default function SpacedRepetition() {
  const [language, setLanguage] = useState("english");
  const [cards, setCards] = useState<SRWord[]>([]);
  const [stats, setStats] = useState<SRStats | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);

  const loadCards = async (lang: string) => {
    setLoading(true);
    try {
      const [cardsRes, statsRes] = await Promise.all([
        fetch(getApiUrl(`/spaced-repetition/due?language=${lang}`)),
        fetch(getApiUrl(`/spaced-repetition/stats?language=${lang}`)),
      ]);
      const cardsData = await cardsRes.json();
      const statsData = await statsRes.json();
      setCards(cardsData);
      setStats(statsData);
      setCurrentIdx(0);
      setFlipped(false);
      setSessionDone(cardsData.length === 0);
      setReviewed(0);
      setCorrect(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCards(language); }, [language]);

  const handleQuality = async (quality: number) => {
    const card = cards[currentIdx];
    if (!card) return;

    await fetch(getApiUrl("/spaced-repetition/review"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: card.id, language, quality }),
    });

    setReviewed(r => r + 1);
    if (quality >= 3) setCorrect(c => c + 1);

    if (currentIdx + 1 >= cards.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx(i => i + 1);
      setFlipped(false);
    }
  };

  const card = cards[currentIdx];
  const progress = cards.length > 0 ? (currentIdx / cards.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Brain className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading your review session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            Spaced Repetition
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Smart review — words appear when you're about to forget them</p>
        </div>
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 border border-border">
          {[{ v: "english", l: "EN" }, { v: "japanese", l: "JA" }].map(opt => (
            <button key={opt.v} onClick={() => setLanguage(opt.v)}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                language === opt.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}>{opt.l} {opt.v === "english" ? "English" : "Japanese"}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Due Now", value: stats.due, color: "text-red-400", icon: Clock },
            { label: "Learning", value: stats.learning, color: "text-yellow-500", icon: BookOpen },
            { label: "Mastered", value: stats.mastered, color: "text-emerald-400", icon: Star },
            { label: "Total", value: stats.total, color: "text-primary", icon: TrendingUp },
          ].map(s => (
            <Card key={s.label} className="glass-card p-4 text-center">
              <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.color)} />
              <div className={cn("text-2xl font-bold font-display", s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {sessionDone ? (
        <Card className="glass-card p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Session Complete!</h2>
            <p className="text-muted-foreground mt-2">
              {reviewed > 0
                ? `You reviewed ${reviewed} cards — ${correct} correct (${Math.round((correct / reviewed) * 100)}% accuracy)`
                : "No cards due for review right now. Come back later!"}
            </p>
          </div>
          {reviewed > 0 && (
            <div className="flex justify-center gap-4">
              <Card className="glass-card px-6 py-4 text-center">
                <div className="text-3xl font-bold font-display text-primary">{reviewed}</div>
                <div className="text-xs text-muted-foreground">Reviewed</div>
              </Card>
              <Card className="glass-card px-6 py-4 text-center">
                <div className="text-3xl font-bold font-display text-emerald-400">{correct}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </Card>
            </div>
          )}
          <Button onClick={() => loadCards(language)} className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <RotateCcw className="w-4 h-4 mr-2" /> Refresh Session
          </Button>
        </Card>
      ) : card ? (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-mono">{currentIdx + 1}/{cards.length}</span>
            <Progress value={progress} className="flex-1 h-2" />
          </div>

          {/* Flashcard */}
          <div
            onClick={() => !flipped && setFlipped(true)}
            className={cn(
              "relative w-full cursor-pointer",
              !flipped && "hover:scale-[1.01] transition-transform"
            )}
            style={{ perspective: "1200px" }}
          >
            <div className={cn(
              "relative w-full transition-transform duration-500",
              "transform-gpu",
            )} style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              {/* Front */}
              <Card className={cn(
                "glass-card p-10 text-center space-y-4 min-h-64 flex flex-col items-center justify-center border-primary/20",
                "shadow-[0_0_30px_rgba(139,92,246,0.1)]",
              )} style={{ backfaceVisibility: "hidden" }}>
                <Badge variant="outline" className="text-xs mb-2">{card.level} · {card.category}</Badge>
                <h2 className={cn(
                  "text-5xl font-bold font-display",
                  card.language === "japanese" ? "text-6xl" : ""
                )}>
                  {card.word}
                </h2>
                {card.reading && (
                  <p className="text-lg text-muted-foreground font-medium">{card.reading}</p>
                )}
                <p className="text-primary/60 font-mono text-sm">{card.phonetic}</p>
                <p className="text-muted-foreground text-sm mt-4">Tap to reveal translation</p>
              </Card>

              {/* Back */}
              <Card className={cn(
                "glass-card p-10 text-center space-y-4 min-h-64 flex flex-col items-center justify-center border-emerald-500/20",
                "shadow-[0_0_30px_rgba(34,197,94,0.1)]",
                "absolute inset-0"
              )} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs mb-2">Translation</Badge>
                <h2 className="text-4xl font-bold font-display text-emerald-400">{card.translation}</h2>
                {card.exampleSentence && (
                  <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border text-left w-full max-w-sm">
                    <p className="text-sm font-medium mb-1">{card.exampleSentence}</p>
                    <p className="text-xs text-muted-foreground">{card.exampleTranslation}</p>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Quality buttons */}
          {flipped && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <p className="text-center text-sm text-muted-foreground font-medium">How well did you remember it?</p>
              <div className="grid grid-cols-5 gap-2">
                {QUALITY_LABELS.map(({ q, label, color, desc }) => (
                  <button
                    key={q}
                    onClick={() => handleQuality(q)}
                    className={cn(
                      "py-3 px-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95",
                      color
                    )}
                  >
                    <div>{label}</div>
                    <div className="text-xs opacity-70 mt-0.5 hidden md:block">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!flipped && (
            <div className="text-center">
              <Button onClick={() => setFlipped(true)} variant="outline" className="gap-2">
                Show Answer <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
