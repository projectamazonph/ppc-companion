"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, Info, AlertCircle, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "ASSIGNMENT" | "GRADE";
  title: string;
  message: string;
  link?: string | null;
  readAt: string | null;
  createdAt: string;
};

const typeIcons = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  ERROR: AlertCircle,
  ASSIGNMENT: ExternalLink,
  GRADE: CheckCircle2,
};

const typeColors = {
  INFO: "text-blue-500 bg-blue-500/10",
  SUCCESS: "text-emerald-500 bg-emerald-500/10",
  WARNING: "text-amber-500 bg-amber-500/10",
  ERROR: "text-rose-500 bg-rose-500/10",
  ASSIGNMENT: "text-violet-500 bg-violet-500/10",
  GRADE: "text-emerald-500 bg-emerald-500/10",
};

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const user = useAppStore((s) => s.user);

  /* eslint-disable react-compiler/preset */
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?studentId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id, markAllRead: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 relative text-muted-foreground"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-xl border border-border/60 bg-popover shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                <p className="text-[11px] text-muted-foreground/60">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-blue-500 hover:text-blue-600"
                  onClick={markAllRead}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-blue-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50">
                  <Bell className="h-8 w-8 mb-2" />
                  <p className="text-xs">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = typeIcons[n.type] || Info;
                  const colorClass = typeColors[n.type] || typeColors.INFO;
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.readAt) markAsRead(n.id);
                        if (n.link) {
                          useAppStore.getState().setSection(n.link.replace("/", "") as any);
                          setOpen(false);
                        }
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-accent/50 border-b border-border/20 last:border-0",
                        !n.readAt && "bg-blue-500/[0.03]"
                      )}
                    >
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5", colorClass)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13px] font-medium text-foreground leading-tight truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-[12px] text-muted-foreground/80 leading-relaxed mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      {!n.readAt && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
