import React from "react";
import { useApp } from "@/lib/store";
import { AppShell, TopBar } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { mockNotifications } from "@/lib/mock-data";
import { notificationsApi } from "@/lib/api";
import {
  CalendarCheck, Vote, CreditCard, FileText, Megaphone, Bell, CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotifType = typeof mockNotifications[0]["type"];

const notifIcons: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  meeting: { icon: CalendarCheck, color: "text-royal", bg: "bg-royal/10" },
  election: { icon: Vote, color: "text-gold", bg: "bg-gold/10" },
  finance: { icon: CreditCard, color: "text-success", bg: "bg-success/10" },
  document: { icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  announcement: { icon: Megaphone, color: "text-chart-5", bg: "bg-chart-5/10" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}

export function NotificationsScreen() {
  const { dispatch } = useApp();
  const [loading, setLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState(mockNotifications);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    dispatch({ type: "SET_UNREAD", count: 0 });
  };

  const markRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    dispatch({ type: "SET_UNREAD", count: notifications.filter((n) => !n.read && n.id !== id).length });
  };

  const unread = notifications.filter((n) => !n.read).length;
  const visible = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  if (loading) {
    return (
      <AppShell>
        <TopBar title="Notifications" showBack onBack={() => dispatch({ type: "NAVIGATE", screen: "dashboard" })} />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar
        title="Notifications"
        showBack
        onBack={() => dispatch({ type: "NAVIGATE", screen: "dashboard" })}
        rightAction={
          unread > 0 ? (
            <button
              onClick={markAllRead}
              className="text-xs text-primary font-semibold flex items-center gap-1"
            >
              <CheckCheck className="size-3.5" />Mark all read
            </button>
          ) : null
        }
      />
      <div className="p-4 lg:p-8 space-y-4 pb-8">

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold border transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              {f === "all" ? "All" : `Unread (${unread})`}
            </button>
          ))}
        </div>

        {unread > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
            <Bell className="size-4 text-primary" />
            <p className="text-sm text-primary font-medium">{unread} unread notification{unread > 1 ? "s" : ""}</p>
          </div>
        )}

        {/* Notifications grid — 1 col mobile, 2 col desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {visible.map((notif) => {
            const { icon: Icon, color, bg } = notifIcons[notif.type] || notifIcons.announcement;
            return (
              <button
                key={notif.id}
                className={cn(
                  "w-full text-left rounded-2xl border p-4 transition-all",
                  notif.read
                    ? "bg-card border-border hover:bg-accent/30"
                    : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                )}
                onClick={() => markRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                    <Icon className={cn("size-5", color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn("text-sm font-semibold leading-tight", !notif.read && "text-foreground")}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                        <span className="text-[10px] text-muted-foreground">{timeAgo(notif.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {visible.length === 0 && (
          <div className="text-center py-20">
            <Bell className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-base text-muted-foreground font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
