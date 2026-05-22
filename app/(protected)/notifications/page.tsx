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

        setNotifications(payload.notifications ?? []);
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
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function markAllAsRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (    <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#07294d]">
          DragonMates
        </p>
        <div className="mt-3 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-blue-500 hover:text-blue-700"
            >
              Mark all as read
            </button>
          )}
        </div>
        <p className="mt-3 text-gray-600">
          Updates about profile activity, new matches, and app events will
          appear here.
        </p>
        {loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading notifications...</p>
        ) : null}
        {error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {!loading && !error && notifications.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">
            No notifications yet. We will show updates here as they arrive.
          </p>
        ) : null}
        {!loading && !error && notifications.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`relative rounded-lg border px-4 py-3 ${
                  notification.read
                    ? "border-gray-200 bg-gray-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <p className={`text-sm font-semibold ${notification.read ? "text-gray-500" : "text-gray-900"}`}>
                  {notification.title || "Notification"}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {notification.body || "You have a new update."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
                {!notification.read && (
                  <button
                    aria-label="Mark as read"
                    onClick={() => markAsRead(notification.id)}
                    className="absolute right-3 top-3 rounded-full p-1 text-blue-400 hover:bg-blue-100 hover:text-blue-600"
                  >
                    <BsCheckCircle className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
