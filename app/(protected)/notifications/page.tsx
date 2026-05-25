"use client";

import { useEffect, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";

type NotificationRecord = {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  read: boolean;
};

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.round((now - then) / 1000));

  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/notifications", { method: "GET" });
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error || "Failed to load notifications.");
          return;
        }

        const list: NotificationRecord[] = payload.notifications ?? [];
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setNotifications(list);
      } catch {
        setError("Unable to load notifications right now.");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  async function markAllAsRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#07294d]">
          DragonMates
        </p>
        <div className="mt-3 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 inline-flex items-center justify-center rounded-full bg-blue-600 px-2.5 py-0.5 text-sm font-semibold text-white align-middle">
                {unreadCount}
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          )}
        </div>
        <p className="mt-3 text-gray-600">
          Updates about profile activity, new matches, and app events will appear here.
        </p>

        {loading && (
          <p className="mt-6 text-sm text-gray-500">Loading notifications...</p>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <BsCheckCircle className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              You&apos;re all caught up
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              No notifications yet. We&apos;ll show updates here as they arrive.
            </p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <ul className="mt-6 space-y-3">
            {notifications.map((notification) => {
              const isUnread = !notification.read;
              return (
                <li
                  key={notification.id}
                  className={`relative rounded-lg border px-4 py-3 transition ${
                    isUnread
                      ? "border-blue-300 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                      : "border-gray-200 bg-white opacity-80"
                  }`}
                  aria-label={isUnread ? "Unread notification" : "Read notification"}
                >
                  {isUnread && (
                    <span
                      aria-hidden="true"
                      className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-600"
                    />
                  )}
                  <div className={isUnread ? "pl-3" : ""}>
                    <p
                      className={`text-sm ${
                        isUnread
                          ? "font-bold text-gray-900"
                          : "font-medium text-gray-600"
                      }`}
                    >
                      {notification.title || "Notification"}
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        isUnread ? "text-gray-800" : "text-gray-500"
                      }`}
                    >
                      {notification.body || "You have a new update."}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  {isUnread && (
                    <button
                      aria-label="Mark as read"
                      onClick={() => markAsRead(notification.id)}
                      className="absolute right-3 top-3 rounded-full p-1 text-blue-500 hover:bg-blue-100 hover:text-blue-700"
                    >
                      <BsCheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
