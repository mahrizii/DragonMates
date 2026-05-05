"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [canReceiveNotifications, setCanReceiveNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const response = await fetch("/api/users/settings", { method: "GET" });
      const payload = await response.json();
      if (response.ok) {
        setCanReceiveNotifications(payload.can_receive_notifications ?? true);
      }
    }
    loadSettings();
  }, []);

  async function handleToggle() {
    setSaving(true);
    setMessage(null);
    const newValue = !canReceiveNotifications;
    setCanReceiveNotifications(newValue);

    const response = await fetch("/api/users/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ can_receive_notifications: newValue }),
    });

    if (response.ok) {
      setMessage("Settings saved.");
    } else {
      setMessage("Failed to save settings.");
      setCanReceiveNotifications(!newValue);
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#07294d]">
          DragonMates
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-3 text-gray-600">
          Manage your notification preferences here.
        </p>

        <div className="mt-8 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Enable Notifications
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Receive notifications for matches and messages.
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              canReceiveNotifications ? "bg-[#07294d]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                canReceiveNotifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {message ? (
          <p className="mt-4 text-sm text-gray-500">{message}</p>
        ) : null}
      </div>
    </div>
  );
}