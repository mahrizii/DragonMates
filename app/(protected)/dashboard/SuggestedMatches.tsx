"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

type Suggestion = {
  id: string;
  first_name: string;
  last_name: string;
  home_town: string | null;
  home_state: string | null;
  academic_year: string | null;
  major: string | null;
  interests: string[];
  score: number | null;
};

const AVATAR_COLORS = [
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-yellow-500",
  "from-blue-600 to-indigo-600",
  "from-amber-600 to-orange-500",
  "from-blue-400 to-cyan-500",
  "from-amber-400 to-yellow-600",
];

function avatarColor(id: string): string {
  const index = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function SuggestedMatches() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/suggested-matches")
      .then((r) => r.json())
      .then((data) => setSuggestions(data.suggestions ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDismiss(id: string) {
    // Optimistic update — remove immediately
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    await fetch("/api/dismissals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed_id: id }),
    });
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-[#07294d] px-6 py-5">
          <h2 className="text-lg font-bold text-white">Suggested for You</h2>
        </div>
        <div className="p-6 text-sm text-gray-400">Loading suggestions…</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-[#07294d] px-6 py-5">
          <h2 className="text-lg font-bold text-white">Suggested for You</h2>
        </div>
        <div className="p-6 text-sm text-gray-400">
          No suggestions right now — check back after more students join.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-[#07294d] px-6 py-5">
        <h2 className="text-lg font-bold text-white">Suggested for You</h2>
        <p className="mt-0.5 text-xs text-blue-300">Profiles you haven&apos;t seen yet</p>
      </div>
      <div className="divide-y divide-gray-100">
        {suggestions.map((s) => (
          <div key={s.id} className="flex items-center gap-4 px-6 py-4">
            {/* Avatar */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(s.id)} text-sm font-bold text-white`}
            >
              {initials(s.first_name ?? "", s.last_name ?? "")}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">
                {s.first_name} {s.last_name}
              </p>
              <p className="truncate text-xs text-gray-500">
                {[s.academic_year, s.major].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>

            {/* Score badge */}
            {s.score !== null && (
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  s.score >= 75
                    ? "bg-green-100 text-green-700"
                    : s.score >= 50
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {s.score}%
              </span>
            )}

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/user/${s.id}`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                View
              </Link>
              <button
                onClick={() => handleDismiss(s.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
