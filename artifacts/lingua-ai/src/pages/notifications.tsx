import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bell, BellOff, BellRing, Clock, Flame, BookOpen, Brain, Trophy, CheckCircle2, Zap, Settings, Trash2 } from "lucide-react";

interface NotifSetting {
  id: string;
  label: string;
  desc: string;
  icon: any;
  enabled: boolean;
  time?: string;
  color: string;
}

interface InboxNotif {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
}

const DEFAULT_SETTINGS: NotifSetting[] = [
  { id: "daily_reminder", label: "Daily Study Reminder", desc: "Remind me to study at a specific time", icon: Clock, enabled: true, time: "09:00", color: "text-blue-400" },
  { id: "streak_alert", label: "Streak Protection", desc: "Alert when streak is at risk of breaking", icon: Flame, enabled: true, time: "20:00", color: "text-orange-400" },
  { id: "vocab_review", label: "Vocabulary Review", desc: "Remind when words are due for spaced repetition", icon: Brain, enabled: true, time: "18:00", color: "text-purple-400" },
  { id: "lesson_goal", label: "Daily Lesson Goal", desc: "Push notification when daily goal is not met", icon: BookOpen, enabled: false, time: "21:00", color: "text-emerald-400" },
  { id: "achievement", label: "Achievements", desc: "Notify when you earn badges or complete levels", icon: Trophy, enabled: true, color: "text-yellow-500" },
  { id: "weekly_report", label: "Weekly Progress Report", desc: "Summary of your progress every week", icon: Zap, enabled: false, color: "text-primary" },
];

const INITIAL_NOTIFS: InboxNotif[] = [
  { id: "1", type: "streak", title: "Streak in danger!", body: "You haven't studied today. Complete a lesson to keep your 5-day streak alive.", time: "2 hours ago", read: false, icon: Flame, color: "text-orange-400" },
  { id: "2", type: "vocab", title: "15 words due for review", body: "Your spaced repetition session is ready. Review now to maximize retention.", time: "3 hours ago", read: false, icon: Brain, color: "text-purple-400" },
  { id: "3", type: "achievement", title: "Level A1 Completed!", body: "Congratulations! You've mastered the Beginner English level. Start A2 today.", time: "Yesterday", read: true, icon: Trophy, color: "text-yellow-500" },
  { id: "4", type: "reminder", title: "Daily study time", body: "It's 9:00 AM — time for your daily English practice. 10 minutes is all you need!", time: "Yesterday", read: true, icon: Clock, color: "text-blue-400" },
  { id: "5", type: "milestone", title: "420 XP Earned this week", body: "You're in the top 20% of learners this week. Keep the momentum going!", time: "2 days ago", read: true, icon: Zap, color: "text-primary" },
];

export default function Notifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [settings, setSettings] = useState<NotifSetting[]>(() => {
    const stored = localStorage.getItem("lingua_notif_settings");
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });
  const [notifs, setNotifs] = useState<InboxNotif[]>(() => {
    const stored = localStorage.getItem("lingua_notifs");
    return stored ? JSON.parse(stored) : INITIAL_NOTIFS;
  });
  const [activeTab, setActiveTab] = useState<"inbox" | "settings">("inbox");

  const unread = notifs.filter(n => !n.read).length;

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      new Notification("LinguaAI", {
        body: "Notifications enabled! You'll now receive study reminders.",
        icon: "/favicon.ico",
      });
    }
  };

  const toggleSetting = (id: string) => {
    const updated = settings.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSettings(updated);
    localStorage.setItem("lingua_notif_settings", JSON.stringify(updated));
  };

  const updateTime = (id: string, time: string) => {
    const updated = settings.map(s => s.id === id ? { ...s, time } : s);
    setSettings(updated);
    localStorage.setItem("lingua_notif_settings", JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifs.map(n => ({ ...n, read: true }));
    setNotifs(updated);
    localStorage.setItem("lingua_notifs", JSON.stringify(updated));
  };

  const markRead = (id: string) => {
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifs(updated);
    localStorage.setItem("lingua_notifs", JSON.stringify(updated));
  };

  const deleteNotif = (id: string) => {
    const updated = notifs.filter(n => n.id !== id);
    setNotifs(updated);
    localStorage.setItem("lingua_notifs", JSON.stringify(updated));
  };

  const sendTestNotif = () => {
    if (permission === "granted") {
      new Notification("LinguaAI Reminder", {
        body: "Time for your daily English practice! 🎯",
        icon: "/favicon.ico",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-yellow-500" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </div>
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your study reminders and alerts</p>
        </div>

        {/* Permission banner */}
        {permission !== "granted" && (
          <Button onClick={requestPermission} size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <BellRing className="w-4 h-4" /> Enable Notifications
          </Button>
        )}
        {permission === "granted" && (
          <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Notifications Active
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 border border-border">
        <button
          onClick={() => setActiveTab("inbox")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all relative",
            activeTab === "inbox" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
          <Bell className="w-4 h-4" /> Inbox
          {unread > 0 && (
            <span className="absolute top-1.5 right-6 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === "settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
          <Settings className="w-4 h-4" /> Settings
        </button>
      </div>

      {activeTab === "inbox" ? (
        <div className="space-y-3">
          {unread > 0 && (
            <div className="flex justify-end">
              <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Mark all as read
              </button>
            </div>
          )}
          {notifs.length === 0 ? (
            <Card className="glass-card p-10 text-center space-y-3">
              <BellOff className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground">No notifications yet</p>
            </Card>
          ) : notifs.map(notif => (
            <Card
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={cn(
                "glass-card p-5 flex items-start gap-4 cursor-pointer transition-all",
                !notif.read ? "border-primary/20 bg-primary/3" : "opacity-70",
                "hover:border-primary/30 hover:opacity-100"
              )}
            >
              <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                !notif.read ? "bg-primary/10 border-primary/20" : "bg-secondary/50 border-border"
              )}>
                <notif.icon className={cn("w-4 h-4", notif.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn("font-semibold text-sm", !notif.read ? "text-foreground" : "text-muted-foreground")}>{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1.5">{notif.time}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                      className="p-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {permission === "granted" && (
            <Card className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Test Notification</p>
                <p className="text-xs text-muted-foreground">Send a test reminder to verify setup</p>
              </div>
              <Button size="sm" variant="outline" onClick={sendTestNotif} className="gap-1.5">
                <BellRing className="w-3.5 h-3.5" /> Test
              </Button>
            </Card>
          )}

          {settings.map(setting => (
            <Card key={setting.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                    setting.enabled ? "bg-primary/10 border-primary/20" : "bg-secondary/50 border-border"
                  )}>
                    <setting.icon className={cn("w-4 h-4", setting.enabled ? setting.color : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{setting.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                    {setting.time && setting.enabled && (
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <input
                          type="time"
                          value={setting.time}
                          onChange={e => updateTime(setting.id, e.target.value)}
                          className="text-xs bg-secondary/50 border border-border rounded-lg px-2 py-1 focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id)}
                  className={cn(
                    "relative w-11 h-6 rounded-full border transition-all shrink-0 mt-0.5",
                    setting.enabled
                      ? "bg-primary border-primary/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                      : "bg-secondary border-border"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200",
                    setting.enabled ? "left-5" : "left-0.5"
                  )} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
