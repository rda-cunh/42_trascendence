import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Bell } from "lucide-react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/app/core/lib/notificationsApi";
import type { Notification } from "@/app/core/types";
import { UserAvatar } from "./UserAvatar";

function getNotificationTitle(n: Notification): string {
  const actor = n.actor_name ?? "Someone";
  const product = n.product_name ?? n.payload?.product_name ?? "a listing";
  switch (n.type) {
    case "new_listing":
      return `${actor} posted ${product}`;
    case "listing_updated":
      return `${actor} updated ${product}`;
    case "listing_deleted":
      return `${actor} removed ${product}`;
    default:
      return `${actor} sent you a notification`;
  }
}

function getNotificationSubtitle(n: Notification): string | null {
  switch (n.type) {
    case "new_listing":
    case "listing_updated": {
      const price = n.product_price ?? n.payload?.product_price;
      return price ? `$${price}` : null;
    }
    case "listing_deleted":
      return "Listing removed";
    default:
      return null;
  }
}

function getNotificationLink(n: Notification): string | null {
  switch (n.type) {
    case "new_listing":
    case "listing_updated":
      return n.product_id !== null ? `/product/${n.product_id}` : null;
    case "listing_deleted":
      return null;
    default:
      return null;
  }
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const seconds = diffMs / 1000;
  if (Math.abs(seconds) < 60) return rtf.format(Math.round(seconds), "second");
  const minutes = seconds / 60;
  if (Math.abs(minutes) < 60) return rtf.format(Math.round(minutes), "minute");
  const hours = minutes / 60;
  if (Math.abs(hours) < 24) return rtf.format(Math.round(hours), "hour");
  const days = hours / 24;
  if (Math.abs(days) < 7) return rtf.format(Math.round(days), "day");

  return date.toLocaleDateString();
}

const POLL_INTERVAL_MS = 45_000;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedAt = useRef<number>(0);

  const loadNotifications = useCallback(async (opts?: { listOnly?: boolean }) => {
    try {
      if (opts?.listOnly) {
        const list = await fetchNotifications({ limit: 20 });
        setNotifications(list);
        setError(null);
        return;
      }

      const [list, count] = await Promise.all([
        fetchNotifications({ limit: 20 }),
        fetchUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(count);
      setError(null);
      lastFetchedAt.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchUnreadCount()
        .then(setUnreadCount)
        .catch(() => undefined);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const handleToggle = () => {
    const willOpen = !open;
    setOpen(willOpen);

    if (willOpen) {
      const stale = Date.now() - lastFetchedAt.current > 10_000;
      if (stale) {
        setLoading(true);
        void loadNotifications();
      }

      const unreadIds = notifications.filter((n) => n.read_at === null).map((n) => n.id);
      if (unreadIds.length === 0) return;

      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read_at: now } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - unreadIds.length));

      markNotificationsRead(unreadIds).catch(() => {
        setNotifications((prev) =>
          prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read_at: null } : n))
        );
        setUnreadCount((prev) => prev + unreadIds.length);
      });
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => n.read_at === null).map((n) => n.id);
    if (unreadIds.length === 0 && unreadCount === 0) return;

    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
      lastFetchedAt.current = Date.now();
    } catch {
      void loadNotifications();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {(unreadCount > 0 || notifications.some((n) => n.read_at === null)) && (
                <button
                  type="button"
                  onClick={() => void handleMarkAllRead()}
                  className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading…
                </div>
              ) : error ? (
                <div className="p-4 text-center text-sm text-red-500">{error}</div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => {
                  const isUnread = n.read_at === null;
                  const title = getNotificationTitle(n);
                  const subtitle = getNotificationSubtitle(n);
                  const link = getNotificationLink(n);
                  const when = formatRelativeTime(n.created_at);

                  const body = (
                    <div
                      className={`flex items-start gap-3 border-b border-gray-100 p-3 last:border-0 dark:border-gray-800 ${
                        isUnread ? "bg-purple-50 dark:bg-purple-900/10" : ""
                      } ${link ? "hover:bg-gray-50 dark:hover:bg-gray-800" : ""}`}
                    >
                      <UserAvatar
                        userId={n.actor_id}
                        name={n.actor_name ?? undefined}
                        src={n.actor_avatar}
                        sizeClassName="h-9 w-9 text-[1.5em]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {title}
                        </p>
                        {subtitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{when}</p>
                      </div>
                      {isUnread && (
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500" />
                      )}
                    </div>
                  );

                  return link ? (
                    <Link key={n.id} to={link} onClick={() => setOpen(false)} className="block">
                      {body}
                    </Link>
                  ) : (
                    <div key={n.id}>{body}</div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
