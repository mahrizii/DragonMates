"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [canReceiveNotifications, setCanReceiveNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "deleting" | "error">("idle");

  useEffect(() => {
    async function loadSettings() {
  const response = await fetch("/api/settings", { method: "GET" });
  const payload = await response.json();
  if (response.ok) {
    setCanReceiveNotifications(payload.can_receive_notifications ?? true);
    setFirstName(payload.first_name ?? "");
    setLastName(payload.last_name ?? "");
    setEmail(payload.email ?? "");
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
  async function handleSave() {
  const response = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
  });
  if (response.ok) {
    setMessage("Settings saved.");
  } else {
    setMessage("Failed to save settings.");
  }
  setTimeout(() => setMessage(null), 3000);
}

async function handleDeleteAccount() {
  setDeleteStatus("deleting");
  const response = await fetch("/api/settings", { method: "DELETE" });
  if (response.ok) {
    window.location.href = "/";
  } else {
    setDeleteStatus("error");
    setTimeout(() => setDeleteStatus("idle"), 3000);
  }
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

        {/* name + email fields */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">First Name</p>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07294d]/30 focus:border-[#07294d] transition-all"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Last Name</p>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07294d]/30 focus:border-[#07294d] transition-all"
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07294d]/30 focus:border-[#07294d] transition-all"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full rounded-xl bg-[#07294d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a3d73] transition-colors cursor-pointer">
            Save Changes
          </button>
        </div>

        {/* danger zone */}
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Delete Account</p>
            <p className="mt-1 text-xs text-gray-500">Permanently removes your account and all data.</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer">
            Delete
          </button>
        </div>

        {message ? (
          <p className="mt-4 text-sm text-gray-500">{message}</p>
        ) : null}
      </div>

      {/* delete modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete your account?</h3>
              <p className="text-sm text-gray-500 mt-1">This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteStatus === "deleting"}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60">
                {deleteStatus === "deleting" ? "Deleting..." : deleteStatus === "error" ? "Error. Try again." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

        
}