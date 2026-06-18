import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  BookOpen, Trophy, BookA, PenTool, LayoutDashboard, Flag,
  Bot, Brain, Mic, Users, Bell, WifiOff, Zap, Menu, X,
  Home, ChevronRight, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@workspace/replit-auth-web";

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
      { name: "Offline", href: "/offline", icon: WifiOff },
      { name: "Notifications", href: "/notifications", icon: Bell, badge: "notif" },
    ],
  },
];

// Bottom nav items for mobile (most important only)
const BOTTOM_NAV = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Learn", href: "/learn", icon: BookOpen },
  { name: "AI Tutor", href: "/tutor", icon: Bot },
  { name: "Progress", href: "/progress", icon: Trophy },
  { name: "More", href: null, icon: Menu }, // opens drawer
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location]);

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

  const NavItem = ({ item, collapsed = false }: { item: any; collapsed?: boolean }) => {
    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
    const notifCount = item.badge === "notif" ? unreadNotifs : 0;
    return (
      <Link href={item.href} className="block">
        <div className={cn(
          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer relative",
          collapsed ? "justify-center px-2" : "",
          isActive
            ? "bg-primary/10 text-primary font-medium shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]"
            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        )}>
          <item.icon className={cn(
            "shrink-0 transition-transform group-hover:scale-110",
            collapsed ? "w-5 h-5" : "w-4 h-4",
            isActive ? "text-primary" : ""
          )} />
          {!collapsed && (
            <>
              <span className="text-sm truncate flex-1">{item.name}</span>
              {item.badge === "AI" && (
                <span className="text-[9px] font-bold bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-md shrink-0">AI</span>
              )}
              {notifCount > 0 && (
                <span className="w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shrink-0">{notifCount}</span>
              )}
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
            </>
          )}
          {collapsed && notifCount > 0 && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">{notifCount}</span>
          )}
          {collapsed && isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
          )}
        </div>
      </Link>
    );
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 border-b border-border/50",
        collapsed ? "p-4 justify-center" : "p-5"
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)] shrink-0">
          <BookOpen className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-display font-bold text-lg tracking-tight">LinguaAI</span>}
      </div>

      {/* XP bar (hidden when collapsed) */}
      {!collapsed && (
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
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/40 px-2 mb-1.5">
                {group.label}
              </p>
            )}
            {collapsed && <div className="border-t border-border/30 mb-2 mx-1" />}
            <div className="space-y-0.5">
              {group.items.map(item => <NavItem key={item.name} item={item} collapsed={collapsed} />)}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="p-3 border-t border-border/50 space-y-1">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="avatar" className="w-8 h-8 rounded-lg object-cover border border-primary/20 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {user?.firstName?.[0] ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName ?? "Learner"} {user?.lastName ?? ""}</p>
              <p className="text-xs text-muted-foreground truncate">Pro Learner</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>
      )}
      {collapsed && (
        <div className="p-3 border-t border-border/50 flex flex-col items-center gap-2">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="avatar" className="w-8 h-8 rounded-lg object-cover border border-primary/20" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {user?.firstName?.[0] ?? "?"}
            </div>
          )}
          <button onClick={logout} title="Log out"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── DESKTOP SIDEBAR (lg+) ─────────────────────────── */}
      <aside className="hidden lg:flex w-60 border-r border-border bg-card/30 backdrop-blur-sm flex-col shrink-0">
        <SidebarContent collapsed={false} />
      </aside>

      {/* ── TABLET SIDEBAR icon-only (md only) ───────────── */}
      <aside className="hidden md:flex lg:hidden w-16 border-r border-border bg-card/30 backdrop-blur-sm flex-col shrink-0">
        <SidebarContent collapsed={true} />
      </aside>

      {/* ── MOBILE: top header + slide drawer ────────────── */}
      {/* Header bar */}
      <div className="flex md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-card/95 backdrop-blur-md border-b border-border items-center px-4 gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 rounded-xl bg-secondary/60 border border-border flex items-center justify-center"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.4)]">
            <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-base">LinguaAI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-yellow-500">{totalXp.toLocaleString()}</span>
        </div>
        <Link href="/notifications">
          <div className="relative w-9 h-9 rounded-xl bg-secondary/60 border border-border flex items-center justify-center">
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unreadNotifs}</span>
            )}
          </div>
        </Link>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        "md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300",
        drawerOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">LinguaAI</span>
          </div>
          <button onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg bg-secondary/60 border border-border flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* XP in drawer */}
        <div className="px-4 py-3 border-b border-border/30">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Total XP</span>
            <span className="text-yellow-500 font-bold flex items-center gap-0.5">
              <Zap className="w-3 h-3 fill-yellow-500" />{totalXp.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalXp % 1000) / 10)}%` }} />
          </div>
        </div>

        {/* Full nav in drawer */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/40 px-2 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => <NavItem key={item.name} item={item} collapsed={false} />)}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50 space-y-1">
          <div className="flex items-center gap-2.5 px-2 py-2">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="avatar" className="w-8 h-8 rounded-lg object-cover border border-primary/20 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {user?.firstName?.[0] ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName ?? "Learner"} {user?.lastName ?? ""}</p>
              <p className="text-xs text-muted-foreground truncate">Pro Learner</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-background/50">
        {/* Spacer for mobile top header */}
        <div className="md:hidden h-14" />

        <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-7 lg:p-8">
          {children}
        </div>

        {/* Mobile bottom nav spacer */}
        <div className="md:hidden h-20" />
      </main>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-2 py-2 flex items-center justify-around">
        {[
          { name: "Home", href: "/", icon: LayoutDashboard },
          { name: "Learn", href: "/learn", icon: BookOpen },
          { name: "Tutor", href: "/tutor", icon: Bot },
          { name: "Progress", href: "/progress", icon: Trophy },
        ].map(item => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} className="flex-1">
              <div className={cn(
                "flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                  isActive ? "bg-primary/15 shadow-[0_0_10px_rgba(139,92,246,0.25)]" : ""
                )}>
                  <item.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
        {/* More button */}
        <button className="flex-1" onClick={() => setDrawerOpen(true)}>
          <div className="flex flex-col items-center gap-1 py-1.5 rounded-xl text-muted-foreground">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
              <Menu className="w-[18px] h-[18px]" />
            </div>
            <span className="text-[10px] font-medium">More</span>
          </div>
        </button>
      </nav>

    </div>
  );
}
