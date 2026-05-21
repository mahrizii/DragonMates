"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const ACADEMIC_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

const MAJORS = [
  "Computer Science", "Information Systems", "Software Engineering",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "Business Administration", "Finance", "Accounting", "Marketing",
  "Biology", "Chemistry", "Physics", "Mathematics", "Psychology",
  "Communications", "Political Science", "English", "History", "Other",
];

const MUSIC_GENRES = [
  "Pop", "Hip-Hop", "R&B", "Rock", "Classical",
  "Country", "Electronic", "Jazz", "Lo-fi", "Indie",
];

const INTEREST_OPTIONS = [
  { name: "Gaming",       emoji: "🎮" },
  { name: "Gym / Fitness", emoji: "💪" },
  { name: "Cooking",      emoji: "🍳" },
  { name: "Hiking",       emoji: "🥾" },
  { name: "Reading",      emoji: "📚" },
  { name: "Music",        emoji: "🎵" },
  { name: "Art",          emoji: "🎨" },
  { name: "Photography",  emoji: "📷" },
  { name: "Travel",       emoji: "✈️" },
  { name: "Movies",       emoji: "🎬" },
  { name: "Sports",       emoji: "⚽" },
  { name: "Coding",       emoji: "💻" },
  { name: "Dancing",      emoji: "💃" },
  { name: "Volunteering", emoji: "🤝" },
  { name: "Fashion",      emoji: "👗" },
  { name: "Esports",      emoji: "🏆" },
];

type Academics = {
  academic_year: string;
  major: string;
  minor: string;
  gpa: string;
};

type Living = {
  time_sleep: string;
  time_wake: string;
  comfortable_temp: number;
  noise_level: number;
  cleanliness: number;
  music_genre: string[];
};

export default function PreferencesPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [academics, setAcademics] = useState<Academics>({
    academic_year: "", major: "", minor: "", gpa: "",
  });
  const [living, setLiving] = useState<Living>({
    time_sleep: "23:00", time_wake: "07:00",
    comfortable_temp: 70, noise_level: 3, cleanliness: 3,
    music_genre: [],
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const userIdRef = useRef<string | null>(null);
  const academicsRef = useRef(academics);
  const livingRef = useRef(living);
  const interestsRef = useRef(selectedInterests);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const readyToSave = useRef(false);

  // Keep refs in sync so doSave always reads latest values
  useEffect(() => { academicsRef.current = academics; }, [academics]);
  useEffect(() => { livingRef.current = living; }, [living]);
  useEffect(() => { interestsRef.current = selectedInterests; }, [selectedInterests]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profiles");
        if (!res.ok) throw new Error("Could not load your profile data.");
        const data = await res.json();

        const uid = data.user?.id ?? null;
        setUserId(uid);
        userIdRef.current = uid;

        if (data.academics) {
          setAcademics({
            academic_year: data.academics.academic_year ?? "",
            major:         data.academics.major         ?? "",
            minor:         data.academics.minor         ?? "",
            gpa:           data.academics.gpa != null ? String(data.academics.gpa) : "",
          });
        }
        if (data.living) {
          setLiving({
            time_sleep:       data.living.time_sleep       ?? "23:00",
            time_wake:        data.living.time_wake        ?? "07:00",
            comfortable_temp: data.living.comfortable_temp ?? 70,
            noise_level:      data.living.noise_level      ?? 3,
            cleanliness:      data.living.cleanliness      ?? 3,
            music_genre:      data.living.music_genre      ?? [],
          });
        }
        if (data.interests) {
          setSelectedInterests((data.interests as { name: string }[]).map((i) => i.name));
        }

        readyToSave.current = true;
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, []);

  const doSave = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:   uid,
          academics: {
            ...academicsRef.current,
            gpa: parseFloat(academicsRef.current.gpa) || null,
          },
          living: {
            ...livingRef.current,
            music_genre: livingRef.current.music_genre.length
              ? livingRef.current.music_genre
              : null,
          },
          interests: INTEREST_OPTIONS
            .filter((o) => interestsRef.current.includes(o.name))
            .map(({ name, emoji }) => ({ name, emoji, description: null })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed.");
      }
      setLastSaved(new Date());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, []);

  function scheduleSave() {
    if (!readyToSave.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(doSave, 1500);
  }

  function handleAcademics(patch: Partial<Academics>) {
    setAcademics((prev) => { const next = { ...prev, ...patch }; academicsRef.current = next; return next; });
    scheduleSave();
  }
  function handleLiving(patch: Partial<Living>) {
    setLiving((prev) => { const next = { ...prev, ...patch }; livingRef.current = next; return next; });
    scheduleSave();
  }
  function toggleGenre(genre: string) {
    setLiving((prev) => {
      const next = {
        ...prev,
        music_genre: prev.music_genre.includes(genre)
          ? prev.music_genre.filter((g) => g !== genre)
          : [...prev.music_genre, genre],
      };
      livingRef.current = next;
      return next;
    });
    scheduleSave();
  }
  function toggleInterest(name: string) {
    setSelectedInterests((prev) => {
      const next = prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name];
      interestsRef.current = next;
      return next;
    });
    scheduleSave();
  }

  async function handleSaveNow() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await doSave();
  }

  const formatSaved = (d: Date) =>
    d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa]">
        <p className="text-sm text-gray-500">Loading your preferences…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa] px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <p className="font-semibold text-red-700">Could not load preferences</p>
          <p className="mt-1 text-sm text-red-600">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-blue-900/20 bg-[#07294d] px-6 py-4 shadow-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-[#ffc600]">My Preferences</h1>
            <p className="text-xs text-blue-300">
              {saving ? "Saving…" : lastSaved ? `Saved ${formatSaved(lastSaved)}` : "Changes save automatically"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleSaveNow}
              disabled={saving}
              className="rounded-lg border border-white/20 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#0a3a6e] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save now"}
            </button>
            {userId && (
              <button
                onClick={() => router.push(`/user/${userId}`)}
                className="rounded-lg bg-[#ffc600] px-4 py-1.5 text-sm font-semibold text-[#07294d] transition hover:bg-[#e6b200]"
              >
                Preview →
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">

        {/* Academics */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[#07294d] px-6 py-4">
            <h2 className="font-semibold text-white">Academics</h2>
            <p className="text-xs text-blue-300">Your academic background</p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Academic Year
              </label>
              <select
                value={academics.academic_year}
                onChange={(e) => handleAcademics({ academic_year: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 
                text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
              >
                <option value="">Select…</option>
                {ACADEMIC_YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                GPA (optional)
              </label>
              <input
                type="number" min="0" max="4" step="0.01"
                value={academics.gpa}
                onChange={(e) => handleAcademics({ gpa: e.target.value })}
                placeholder="3.50"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Major
              </label>
              <select
                value={academics.major}
                onChange={(e) => handleAcademics({ major: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
              >
                <option value="">Select…</option>
                {MAJORS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Minor (optional)
              </label>
              <input
                value={academics.minor}
                onChange={(e) => handleAcademics({ minor: e.target.value })}
                placeholder="e.g. Mathematics"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
              />
            </div>
          </div>
        </section>

        {/* Living Style */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[#07294d] px-6 py-4">
            <h2 className="font-semibold text-white">Living Style</h2>
            <p className="text-xs text-blue-300">How you like to live at home</p>
          </div>
          <div className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={living.time_sleep}
                  onChange={(e) => handleLiving({ time_sleep: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Wake Time
                </label>
                <input
                  type="time"
                  value={living.time_wake}
                  onChange={(e) => handleLiving({ time_wake: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Comfortable Temperature —{" "}
                <span className="font-bold text-[#07294d]">{living.comfortable_temp}°F</span>
              </label>
              <input
                type="range" min="60" max="85" step="1"
                value={living.comfortable_temp}
                onChange={(e) => handleLiving({ comfortable_temp: Number(e.target.value) })}
                className="w-full accent-[#07294d]"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>60°F — cool</span><span>85°F — warm</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Noise Level —{" "}
                <span className="font-bold text-[#07294d]">
                  {["Silent", "Quiet", "Moderate", "Lively", "Loud"][living.noise_level - 1]}
                </span>
              </label>
              <input
                type="range" min="1" max="5" step="1"
                value={living.noise_level}
                onChange={(e) => handleLiving({ noise_level: Number(e.target.value) })}
                className="w-full accent-[#07294d]"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>Silent</span><span>Loud</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Cleanliness —{" "}
                <span className="font-bold text-[#07294d]">
                  {["Very Relaxed", "Relaxed", "Moderate", "Tidy", "Very Clean"][living.cleanliness - 1]}
                </span>
              </label>
              <input
                type="range" min="1" max="5" step="1"
                value={living.cleanliness}
                onChange={(e) => handleLiving({ cleanliness: Number(e.target.value) })}
                className="w-full accent-[#07294d]"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>Very relaxed</span><span>Very clean</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Music Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {MUSIC_GENRES.map((g) => (
                  <button
                    key={g} type="button" onClick={() => toggleGenre(g)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      living.music_genre.includes(g)
                        ? "border-[#07294d] bg-[#07294d] text-white"
                        : "border-gray-300 bg-white text-gray-600 hover:border-[#07294d]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interests */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[#07294d] px-6 py-4">
            <h2 className="font-semibold text-white">Interests</h2>
            <p className="text-xs text-blue-300">Select everything that applies</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {INTEREST_OPTIONS.map(({ name, emoji }) => (
                <button
                  key={name} type="button" onClick={() => toggleInterest(name)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    selectedInterests.includes(name)
                      ? "border-[#07294d] bg-[#07294d] text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-[#07294d]"
                  }`}
                >
                  <span style={{ fontSize: 16 }}>{emoji}</span> {name}
                </button>
              ))}
            </div>
            {selectedInterests.length > 0 && (
              <p className="mt-4 text-xs text-gray-400">{selectedInterests.length} selected</p>
            )}
          </div>
        </section>

        {/* Footer row */}
        {saveError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </p>
        )}
        <div className="flex items-center justify-between pb-6">
          <p className="text-xs text-gray-400">
            {saving
              ? "Saving…"
              : lastSaved
                ? `Last saved ${formatSaved(lastSaved)}`
                : "Not yet saved this session"}
          </p>
          <button
            onClick={handleSaveNow}
            disabled={saving}
            className="rounded-xl bg-[#ffc600] px-6 py-2.5 text-sm font-semibold text-[#07294d] transition hover:bg-[#e6b200] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
