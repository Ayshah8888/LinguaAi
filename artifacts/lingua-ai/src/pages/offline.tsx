import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Download, Wifi, WifiOff, BookOpen, Trash2, CheckCircle2, Clock, Zap, Search } from "lucide-react";
import { useGetLessons } from "@workspace/api-client-react";
import { getApiUrl } from "@/lib/api";
import { Link } from "wouter";

interface SavedLesson {
  id: number;
  lessonId: number;
  title: string;
  language: string;
  level: string;
  skill: string;
  content: string;
  savedAt: string;
}

const SKILL_COLORS: Record<string, string> = {
  reading: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  listening: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  writing: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  grammar: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  vocabulary: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
};

export default function OfflineLessons() {
  const [saved, setSaved] = useState<SavedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { data: lessons } = useGetLessons();

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    try {
      // Try server first
      const res = await fetch(getApiUrl("/saved-lessons"));
      if (res.ok) {
        const data = await res.json();
        setSaved(data);
        localStorage.setItem("lingua_saved_lessons", JSON.stringify(data));
      }
    } catch {
      // Fallback to localStorage when offline
      const local = localStorage.getItem("lingua_saved_lessons");
      if (local) setSaved(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSaved(); }, []);

  const saveLesson = async (lesson: any) => {
    setSaving(lesson.id);
    try {
      const body = {
        lessonId: lesson.id,
        content: lesson.content,
        title: lesson.title,
        language: lesson.language,
        level: lesson.level,
        skill: lesson.skill,
      };
      const res = await fetch(getApiUrl("/saved-lessons"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const updated = [...saved.filter(s => s.lessonId !== lesson.id), data];
      setSaved(updated);
      localStorage.setItem("lingua_saved_lessons", JSON.stringify(updated));
    } finally {
      setSaving(null);
    }
  };

  const unsaveLesson = async (savedId: number, lessonId: number) => {
    try {
      await fetch(getApiUrl(`/saved-lessons/${savedId}`), { method: "DELETE" });
      const updated = saved.filter(s => s.id !== savedId);
      setSaved(updated);
      localStorage.setItem("lingua_saved_lessons", JSON.stringify(updated));
    } catch {}
  };

  const savedIds = new Set(saved.map(s => s.lessonId));

  const filteredSaved = saved.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.language.includes(search) || s.level.includes(search.toUpperCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center">
              {isOnline ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
            </div>
            Offline Lessons
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Save lessons to access them without internet</p>
        </div>
        <Badge variant="outline" className={cn(
          "gap-1.5 px-3 py-1.5",
          isOnline ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {isOnline ? <><Wifi className="w-3.5 h-3.5" /> Online</> : <><WifiOff className="w-3.5 h-3.5" /> Offline</>}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Saved Lessons", value: saved.length, color: "text-primary" },
          { label: "Available Lessons", value: lessons?.length ?? 0, color: "text-muted-foreground" },
          { label: "Storage Used", value: `${Math.round(JSON.stringify(saved).length / 1024)} KB`, color: "text-blue-400" },
        ].map(s => (
          <Card key={s.label} className="glass-card p-4 text-center">
            <div className={cn("text-2xl font-bold font-display", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Available to save */}
      {isOnline && lessons && lessons.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" /> Save for Offline
          </h2>
          <div className="grid gap-2">
            {lessons.filter(l => !savedIds.has(l.id)).slice(0, 6).map(lesson => (
              <Card key={lesson.id} className="glass-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{lesson.title}</span>
                    <Badge variant="outline" className={cn("text-xs capitalize", SKILL_COLORS[lesson.skill])}>{lesson.skill}</Badge>
                    <span className="text-xs text-muted-foreground">{lesson.language} · {lesson.level}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{lesson.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => saveLesson(lesson)}
                  disabled={saving === lesson.id}
                  className="shrink-0 gap-1.5 text-xs"
                >
                  {saving === lesson.id ? (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 animate-spin" /> Saving...</span>
                  ) : (
                    <><Download className="w-3 h-3" /> Save</>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Saved lessons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Saved Lessons ({saved.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search saved..."
              className="pl-8 pr-3 py-2 rounded-xl bg-secondary/50 border border-border text-xs focus:outline-none focus:border-primary/50 w-36"
            />
          </div>
        </div>

        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl bg-secondary/20 animate-pulse border border-border" />)
        ) : filteredSaved.length === 0 ? (
          <Card className="glass-card p-10 text-center space-y-3">
            <WifiOff className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">{search ? "No matching saved lessons" : "No lessons saved yet"}</p>
            {!search && isOnline && (
              <p className="text-sm text-muted-foreground">Save lessons above to access them offline</p>
            )}
          </Card>
        ) : (
          filteredSaved.map(lesson => (
            <Card key={lesson.id} className="glass-card p-5 flex items-start gap-4 group hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{lesson.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-xs capitalize", SKILL_COLORS[lesson.skill])}>{lesson.skill}</Badge>
                      <span className="text-xs text-muted-foreground capitalize">{lesson.language} · {lesson.level}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{lesson.content.substring(0, 120)}...</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <button
                      onClick={() => unsaveLesson(lesson.id, lesson.lessonId)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
