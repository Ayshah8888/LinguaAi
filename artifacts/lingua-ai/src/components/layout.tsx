import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  BookOpen, Trophy, BookA, PenTool, LayoutDashboard, Flag,
  Bot, Brain, Mic, Users, Bell, WifiOff, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

const NAV_GROUPS = [
  {
    label: "Learn",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Lessons", href: "/learn", icon: BookOpen },
      { name: "Japanese", href: "/japanese", icon: Flag },
    ],
  },
  {
    label: "Practice",
    items: [
      { name: "AI Tutor", href: "/tutor", icon: Bot, badge: "AI" },
      { name: "Vocabulary", href: "/vocabulary", icon: BookA },
      { name: "Spaced Repetition", href: "/spaced-repetition", icon: Brain },
      { name: "Voice Practice", href: "/voice", icon: Mic },
      { name: "Writing", href: "/practice", icon: PenTool },
    ],
  },
  {
    label: "Community",
    items: [
      { name: "Leaderboard", href: "/leaderboard", icon: Users },
      { name: "Progress", href: "/progress", icon: Trophy },
    ],
  },
  {
    label: "More",
    items: [
      { name: "Offline Lessons", href: "/offline", icon: WifiOff },
      { name: "Notifications", href: "/notifications", icon: Bell, badge: "notif" },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    const notifs = localStorage.getItem("lingua_notifs");
    if (notifs) {
      try {
        const parsed = JSON.parse(notifs);
        setUnreadNotifs(parsed.filter((n: any) => !n.read).length);
      } catch {}
    }

    fetch(getApiUrl("/progress?language=english"))
      .then(r => r.json())
      .then(d => setTotalXp(d.totalXp ?? 0))
      .catch(() => {});
  }, [location]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">LinguaAI</span>
        </div>

        {/* XP bar */}
        <div className="px-4 py-3 border-b border-border/30">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Total XP</span>
            <span className="text-yellow-500 font-bold flex items-center gap-0.5">
              <Zap className="w-3 h-3 fill-yellow-500" />{totalXp.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalXp % 1000) / 10)}%` }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50 px-2 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                  const notifCount = item.badge === "notif" ? unreadNotifs : 0;
                  return (
                    <Link key={item.name} href={item.href} className="block">
                      <div className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary font-medium shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}>
                        <item.icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "")} />
                        <span className="text-sm truncate flex-1">{item.name}</span>
                        {item.badge === "AI" && (
                          <span className="text-[9px] font-bold bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-md shrink-0">AI</span>
                        )}
                        {notifCount > 0 && (
                          <span className="w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shrink-0">
                            {notifCount}
                          </span>
                        )}
                        {isActive && <div className="w-1 h-1 rounded-full bg-primary shrink-0" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Pro Learner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-background/50">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
