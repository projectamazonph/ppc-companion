"use client";

import { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { Bell, Checks as CheckCheck, Info, WarningCircle as AlertCircle, Warning as AlertTriangle, CheckCircle as CheckCircle2, ArrowSquareOut as ExternalLink } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import styles from "./notifications.module.css";

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

const typeIconStyles: Record<string, string> = {
  INFO: styles.iconInfo,
  SUCCESS: styles.iconSuccess,
  WARNING: styles.iconWarning,
  ERROR: styles.iconError,
  ASSIGNMENT: styles.iconInfo,
  GRADE: styles.iconSuccess,
};

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const user = useAppStore((s) => s.user);

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
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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
    <div className={styles.trigger}>
      <button className={styles.bellBtn} aria-label="Notifications" onClick={() => setOpen(!open)}>
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Notifications</h3>
                <p className={styles.panelSubtitle}>
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button className={styles.markAllBtn} onClick={markAllRead}>
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className={styles.list}>
              {loading && notifications.length === 0 ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner} />
                </div>
              ) : notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell className={clsx("h-8 w-8", styles.emptyIcon)} />
                  <p className={styles.emptyText}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = typeIcons[n.type] || Info;
                  const iconStyle = typeIconStyles[n.type] || styles.iconInfo;
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
                      className={clsx(styles.item, !n.readAt && styles.itemUnread)}
                    >
                      <span className={clsx(styles.iconCircle, iconStyle)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className={styles.itemBody}>
                        <div className={styles.itemHeader}>
                          <p className={styles.itemTitle}>{n.title}</p>
                          <span className={styles.itemTime}>{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className={styles.itemMessage}>{n.message}</p>
                      </div>
                      {!n.readAt && <span className={styles.unreadDot} />}
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
