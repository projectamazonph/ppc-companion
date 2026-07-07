"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bell,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BookOpen,
  Star,
  CheckCheck,
  Trash2,
  Loader2,
  AlertCircle,
  Archive,
  Inbox,
} from "lucide-react";

// =============================================================
// Types
// =============================================================

type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "ASSIGNMENT" | "GRADE";

type Notification = {
  id: string;
  studentId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  readAt: string | null;
  createdAt: string;
};

type NotificationsResponse = {
  count: number;
  unreadCount: number;
  notifications: Notification[];
};

// =============================================================
// Helpers
// =============================================================

const NOTIF_ICONS: Record<NotificationType, React.ElementType> = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  ERROR: XCircle,
  ASSIGNMENT: BookOpen,
  GRADE: Star,
};

const NOTIF_COLORS: Record<NotificationType, string> = {
  INFO: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  SUCCESS:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  WARNING:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  ERROR: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  ASSIGNMENT:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
  GRADE: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// =============================================================
// Notification Item Component
// =============================================================

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = NOTIF_ICONS[notification.type] ?? Info;
  const colorClass = NOTIF_COLORS[notification.type] ?? NOTIF_COLORS.INFO;
  const isUnread = !notification.readAt;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(notification.id);
    setDeleting(false);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 border-b last:border-b-0 transition-colors",
        isUnread && "bg-primary/5"
      )}
    >
      {/* Type icon */}
      <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className={cn(
                "text-sm",
                isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"
              )}
            >
              {notification.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {notification.message}
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap pt-0.5">
            {formatTime(notification.createdAt)}
          </span>
        </div>

        {/* Footer metadata */}
        <div className="flex items-center gap-3 mt-3">
          <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">
            {notification.type.toLowerCase()}
          </Badge>

          {notification.link && (
            <a
              href={notification.link}
              className="text-[11px] text-primary hover:underline"
            >
              View details
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 pt-1">
        {isUnread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={() => onMarkRead(notification.id)}
            title="Mark as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

// =============================================================
// Notification Center Section
// =============================================================

export function NotificationCenterSection() {
  const user = useAppStore((s) => s.user);

  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        studentId: user.id,
      });
      if (filter === "unread") params.set("unreadOnly", "true");

      const res = await fetch(`/api/notifications?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json: NotificationsResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  // Initial fetch + refetch on filter change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Mark single notification as read
  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        // Optimistic update
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            unreadCount: Math.max(0, prev.unreadCount - 1),
            notifications: prev.notifications.map((n) =>
              n.id === id ? { ...n, readAt: new Date().toISOString() } : n
            ),
          };
        });
      }
    } catch {
      // fallback: refetch
      fetchNotifications();
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      setMarkingAll(true);
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id, markAllRead: true }),
      });
      if (res.ok) {
        // Optimistic update
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            unreadCount: 0,
            notifications: prev.notifications.map((n) => ({
              ...n,
              readAt: n.readAt ?? new Date().toISOString(),
            })),
          };
        });
      }
    } catch {
      fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  // Delete single notification
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            count: prev.count - 1,
            notifications: prev.notifications.filter((n) => n.id !== id),
          };
        });
      }
    } catch {
      fetchNotifications();
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Bell className="h-10 w-10" />
          <p className="text-sm">Sign in to view notifications</p>
        </div>
      </div>
    );
  }

  const hasUnread = (data?.unreadCount ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {data
              ? `${data.count} notification${data.count !== 1 ? "s" : ""}${
                  data.unreadCount > 0
                    ? ` (${data.unreadCount} unread)`
                    : ""
                }`
              : "Activity alerts & updates"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filter === "unread"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread
              {hasUnread && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-1">
                  {data?.unreadCount}
                </span>
              )}
            </button>
          </div>

          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              {markingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              )}
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        </div>
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm font-medium">Failed to load</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchNotifications}>
              Retry
            </Button>
          </div>
        </Card>
      ) : data && data.notifications.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {data.notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            {filter === "unread" ? (
              <>
                <CheckCheck className="h-10 w-10" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs">No unread notifications</p>
              </>
            ) : (
              <>
                <Inbox className="h-10 w-10" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs">
                  You'll see alerts here when instructors grade your work or
                  assignments are due
                </p>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
