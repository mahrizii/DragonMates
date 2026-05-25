"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from "lucide-react";

const ACADEMIC_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

const INTEREST_OPTIONS = [
  { name: "Gaming",        emoji: "🎮" },
  { name: "Gym / Fitness", emoji: "💪" },
  { name: "Cooking",       emoji: "🍳" },
  { name: "Hiking",        emoji: "🥾" },
  { name: "Reading",       emoji: "📚" },
  { name: "Music",         emoji: "🎵" },
  { name: "Art",           emoji: "🎨" },
  { name: "Photography",   emoji: "📷" },
  { name: "Travel",        emoji: "✈️" },
  { name: "Movies",        emoji: "🎬" },
  { name: "Sports",        emoji: "⚽" },
  { name: "Coding",        emoji: "💻" },
  { name: "Dancing",       emoji: "💃" },
  { name: "Volunteering",  emoji: "🤝" },
  { name: "Fashion",       emoji: "👗" },
  { name: "Esports",       emoji: "🏆" },
];

export default function ExploreFilters({ hasScores }: { hasScores: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [interestsOpen, setInterestsOpen] = useState(false);

  const year = searchParams.get("year") ?? "";
  const score = searchParams.get("score") ?? "";
  const activeInterests = (searchParams.get("interests") ?? "").split(",").filter(Boolean);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleInterest(name: string) {
    const next = activeInterests.includes(name)
      ? activeInterests.filter((i) => i !== name)
      : [...activeInterests, name];
    setParam("interests", next.join(","));
  }

  function clearAll() {
    router.push(pathname);
    setInterestsOpen(false);
  }

  const activeCount = [year, score, activeInterests.length > 0 ? "x" : ""].filter(Boolean).length;

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <SlidersHorizontal size={15} />
          Filter
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#07294d] text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>

        {/* Academic year */}
        <select
          value={year}
          onChange={(e) => setParam("year", e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07294d]"
        >
          <option value="">Any year</option>
          {ACADEMIC_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Compatibility score — only shown when the current user has a profile */}
        {hasScores && (
          <select
            value={score}
            onChange={(e) => setParam("score", e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#07294d]"
          >
            <option value="">Any match</option>
            <option value="50">50%+ match</option>
            <option value="75">75%+ match</option>
          </select>
        )}

        {/* Interests toggle */}
        <button
          type="button"
          onClick={() => setInterestsOpen((o) => !o)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${
            activeInterests.length > 0
              ? "border-[#07294d] bg-[#07294d] text-white"
              : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#07294d]"
          }`}
        >
          Interests
          {activeInterests.length > 0 && (
            <span className="font-bold">({activeInterests.length})</span>
          )}
          {interestsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 text-sm text-gray-400 transition hover:text-gray-700"
          >
            <X size={13} /> Clear all
          </button>
        )}
      </div>

      {interestsOpen && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          {INTEREST_OPTIONS.map(({ name, emoji }) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleInterest(name)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                activeInterests.includes(name)
                  ? "border-[#07294d] bg-[#07294d] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#07294d]"
              }`}
            >
              <span>{emoji}</span> {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
