import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, Zap, Flame, BookOpen, Crown, Medal, Star, TrendingUp, RefreshCw } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useGetProgress } from "@workspace/api-client-react";

interface LeaderRow {
  id: number;
  rank: number;
  username: string;
  totalXp: number;
  weeklyXp: number;
  currentStreak: number;
  lessonsCompleted: number;
  level: string;
  language: string;
  country: string;
}

const TABS = [
  { id: "total", label: "All Time", icon: Trophy },
  { id: "weekly", label: "This Week", icon: Zap },
  { id: "streak", label: "Streak", icon: Flame },
];

const LEVEL_COLORS: Record<string, string> = {
  A1: "text-amber-600", A2: "text-slate-400", B1: "text-yellow-500",
  B2: "text-blue-400", C1: "text-indigo-400", C2: "text-purple-400",
};

const MOCK_USERS = [
  { username: "Sara_English", totalXp: 8420, weeklyXp: 680, currentStreak: 42, lessonsCompleted: 89, level: "C1", language: "english", country: "SA" },
  { username: "Ahmed_N2", totalXp: 7210, weeklyXp: 520, currentStreak: 31, lessonsCompleted: 74, level: "B2", language: "japanese", country: "EG" },
  { username: "Yuki_Learn", totalXp: 6900, weeklyXp: 910, currentStreak: 28, lessonsCompleted: 68, level: "B2", language: "english", country: "JP" },
  { username: "Ali_Master", totalXp: 5800, weeklyXp: 420, currentStreak: 19, lessonsCompleted: 55, level: "B1", language: "english", country: "AE" },
  { username: "Maria_JP", totalXp: 5100, weeklyXp: 380, currentStreak: 15, lessonsCompleted: 51, level: "A2", language: "japanese", country: "ES" },
  { username: "Omar_Fluent", totalXp: 4200, weeklyXp: 290, currentStreak: 12, lessonsCompleted: 43, level: "B1", language: "english", country: "JO" },
  { username: "Lin_Sensei", totalXp: 3900, weeklyXp: 610, currentStreak: 22, lessonsCompleted: 38, level: "C2", language: "japanese", country: "CN" },
  { username: "Fatima_Pro", totalXp: 3100, weeklyXp: 180, currentStreak: 8, lessonsCompleted: 31, level: "A2", language: "english", country: "MA" },
];

export default function Leaderboard() {
  const [tab, setTab] = useState("total");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<LeaderRow | null>(null);

  const { data: progress } = useGetProgress({ language: "english" });

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Sync current user first
      if (progress) {
        await fetch(getApiUrl("/leaderboard/sync"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "You",
            totalXp: progress.totalXp,
            weeklyXp: 80,
            currentStreak: progress.currentStreak,
            lessonsCompleted: progress.lessonsCompleted,
            level: progress.level,
            language: "english",
            country: "",
          }),
        });

        // Seed mock users if board is empty
        for (const u of MOCK_USERS) {
          await fetch(getApiUrl("/leaderboard/sync"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(u),
          });
        }
      }

      const res = await fetch(getApiUrl(`/leaderboard?type=${tab}`));
      const data: LeaderRow[] = await res.json();
      setRows(data);
      const me = data.find(r => r.username === "You");
      setMyRank(me ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (progress) loadLeaderboard(); }, [tab, progress]);

  const getValue = (row: LeaderRow) => {
    if (tab === "weekly") return row.weeklyXp;
    if (tab === "streak") return row.currentStreak;
    return row.totalXp;
  };
  const getUnit = () => tab === "streak" ? "days" : "XP";

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
  };

  const maxVal = Math.max(...rows.map(getValue), 1);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Compete with learners worldwide</p>
      </div>

      {/* My Rank */}
      {myRank && (
        <Card className="glass-card p-5 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
                #{myRank.rank}
              </div>
              <div>
                <p className="font-semibold">Your Ranking</p>
                <p className="text-xs text-muted-foreground">Keep pushing — you're on the board!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-display text-primary">{getValue(myRank).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{getUnit()}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 border border-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
              tab === t.id ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(139,92,246,0.3)]" : "text-muted-foreground hover:text-foreground"
            )}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {!loading && rows.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[rows[1], rows[0], rows[2]].map((row, i) => {
            const podiumPos = [2, 1, 3][i];
            const heights = ["h-24", "h-32", "h-20"];
            const glows = ["shadow-[0_0_15px_rgba(168,169,173,0.3)]", "shadow-[0_0_25px_rgba(255,215,0,0.4)]", "shadow-[0_0_15px_rgba(205,127,50,0.3)]"];
            return (
              <Card key={row.id} className={cn(
                "glass-card p-4 flex flex-col items-center justify-end text-center",
                heights[i], glows[i],
                podiumPos === 1 ? "border-yellow-500/30 bg-yellow-500/5" : ""
              )}>
                {podiumPos === 1 && <Crown className="w-5 h-5 text-yellow-400 mb-1" />}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mb-2",
                  podiumPos === 1 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                    podiumPos === 2 ? "bg-slate-500/20 text-slate-400 border border-slate-500/30" :
                      "bg-amber-600/20 text-amber-600 border border-amber-600/30"
                )}>#{row.rank}</div>
                <p className="text-xs font-semibold truncate w-full">{row.username}</p>
                <p className="text-xs text-muted-foreground">{getValue(row).toLocaleString()} {getUnit()}</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="space-y-2">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/20 animate-pulse border border-border" />
          ))
        ) : rows.map(row => {
          const isMe = row.username === "You";
          const barWidth = Math.max(6, (getValue(row) / maxVal) * 100);
          return (
            <Card key={row.id} className={cn(
              "glass-card px-5 py-4 flex items-center gap-4 relative overflow-hidden transition-all",
              isMe ? "border-primary/40 bg-primary/5" : "hover:border-border/60"
            )}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-full bg-primary/3 transition-all" style={{ width: `${barWidth}%` }} />
              </div>
              <div className="flex items-center gap-1 w-8 shrink-0 relative z-10">{getRankIcon(row.rank)}</div>
              <div className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 relative z-10"
                style={{ background: isMe ? "rgba(139,92,246,0.15)" : undefined, borderColor: isMe ? "rgba(139,92,246,0.4)" : undefined }}>
                {row.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("font-semibold text-sm", isMe ? "text-primary" : "")}>{row.username}</span>
                  {isMe && <Badge className="text-xs py-0 px-1.5 bg-primary/20 text-primary border-primary/30">You</Badge>}
                  <span className={cn("text-xs font-bold", LEVEL_COLORS[row.level])}>{row.level}</span>
                  {row.country && <span className="text-xs text-muted-foreground">{row.country}</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" />{row.currentStreak}d</span>
                  <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" />{row.lessonsCompleted}</span>
                </div>
              </div>
              <div className="text-right shrink-0 relative z-10">
                <p className={cn("text-lg font-bold font-display", isMe ? "text-primary" : "text-foreground")}>
                  {getValue(row).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{getUnit()}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
