"use client";

import { useState, useEffect, useCallback, useRef, startTransition } from "react";
import Link from "next/link";

const defaultPrefs = {
  sleepSchedule: "",
  cleanliness: "",
  noise: "",
  guests: "",
  socialBattery: "",
  responsibilities: "",
  interests: "",
  budget: "1500",
};

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState({ ...defaultPrefs });
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultPrefs, string>>>({});

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fields = [
    {
      label: "Sleep Schedule",
      name: "sleepSchedule",
      options: [
        { value: "", label: "Select..." },
        { value: "early", label: "Early Sleeper" },
        { value: "middle", label: "Normal" },
        { value: "late", label: "Night Owl" },
      ],
    },
    {
      label: "Cleanliness",
      name: "cleanliness",
      options: [
        { value: "", label: "Select..." },
        { value: "low", label: "Relaxed" },
        { value: "medium", label: "Moderate" },
        { value: "high", label: "Very Clean" },
      ],
    },
    {
      label: "Noise Preference",
      name: "noise",
      options: [
        { value: "", label: "Select..." },
        { value: "quiet", label: "Quiet" },
        { value: "moderate", label: "Moderate" },
        { value: "loud", label: "Loud / Social" },
      ],
    },
    {
      label: "Guests",
      name: "guests",
      options: [
        { value: "", label: "Select..." },
        { value: "rare", label: "Rarely" },
        { value: "sometimes", label: "Sometimes" },
        { value: "often", label: "Often" },
      ],
    },
    {
      label: "Social Battery",
      name: "socialBattery",
      options: [
        { value: "", label: "Select..." },
        { value: "introverted", label: "Introverted" },
        { value: "ambivert", label: "Ambivert" },
        { value: "extroverted", label: "Extroverted" },
      ],
    },
    {
      label: "Responsibilities",
      name: "responsibilities",
      options: [
        { value: "", label: "Select..." },
        { value: "low", label: "Minimal — I do my part" },
        { value: "medium", label: "Balanced — split evenly" },
        { value: "high", label: "Proactive — I like things done" },
      ],
    },
  ];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
    const { name, value } = e.target;
    setPrefs({ ...prefs, [name]: value });
    if (errors[name as keyof typeof defaultPrefs]) {
      setErrors({ ...errors, [name]: undefined });
    }
  }

  function validate() {
    const newErrors: Partial<Record<keyof typeof defaultPrefs, string>> = {};
    fields.forEach(({ name, label }) => {
      if (!prefs[name as keyof typeof prefs]) {
        newErrors[name as keyof typeof defaultPrefs] = `${label} is required.`;
      }
    });
    if (!prefs.interests.trim()) {
      newErrors.interests = "Interests are required.";
    }
    return newErrors;
  }

  const savePreferencesToStorage = useCallback(() => {
    localStorage.setItem("roommatePrefs", JSON.stringify(prefs));
    const time = new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
    localStorage.setItem("roommatePrefsTime", time);
    setLastSaved(time);
  }, [prefs]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      savePreferencesToStorage();
    }, 2000);
  }, [savePreferencesToStorage]);

  useEffect(() => {
    debouncedSave();
  }, [debouncedSave]);

  useEffect(() => {
    const saved = localStorage.getItem("roommatePrefs");
    const savedTime = localStorage.getItem("roommatePrefsTime");
    if (!saved) return;
    startTransition(() => {
      const parsed = JSON.parse(saved);
      setPrefs(parsed);
      setLastSaved(savedTime || null);
      setMatchScore(87);
    });
  }, []);

  function savePreferences() {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSaveMsg("Preferences saved!");
  }

  function clearPreferences() {
    localStorage.removeItem("roommatePrefs");
    localStorage.removeItem("roommatePrefsTime");
    setPrefs({ ...defaultPrefs });
    setMatchScore(null);
    setLastSaved(null);
    setSaveMsg("Preferences cleared!");
    setErrors({});
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">

      {/* Header */}
      <div className="bg-[#07294d] px-8 py-5 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-[#ffc600] tracking-wide">Dragonmates</h1>
          <p className="text-blue-200 text-sm mt-0.5">Find your perfect roommate match</p>
        </div>
        <div className="flex gap-3">
          <Link href="/my-profile" className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
            My Profile
          </Link>
          <Link href="/explore" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
            Explore
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#07294d] px-6 py-4">
            <h2 className="text-white font-semibold text-lg">Your Living Preferences</h2>
            <p className="text-blue-300 text-sm">Tell us how you like to live</p>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fields.map(({ label, name, options }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <select
                  name={name}
                  value={prefs[name as keyof typeof prefs]}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600] focus:border-transparent transition ${
                    errors[name as keyof typeof defaultPrefs] ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors[name as keyof typeof defaultPrefs] && (
                  <p className="text-red-500 text-xs mt-1">{errors[name as keyof typeof defaultPrefs]}</p>
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                Interests
              </label>
              <input
                type="text"
                name="interests"
                value={prefs.interests}
                onChange={handleChange}
                placeholder="e.g. gaming, gym, cooking, hiking, reading..."
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600] focus:border-transparent transition ${
                  errors.interests ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.interests && <p className="text-red-500 text-xs mt-1">{errors.interests}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                Monthly Budget ($)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  name="budget"
                  min="0"
                  max="3000"
                  step="100"
                  value={prefs.budget}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>$500</span>
                  <span className="font-semibold text-gray-700">${prefs.budget}</span>
                  <span>$3000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#07294d] px-6 py-4">
            <h2 className="text-white font-semibold text-lg">Matching Result</h2>
          </div>
          <div className="p-6">
            {matchScore !== null ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#ffc600] flex items-center justify-center shadow">
                  <span className="text-[#07294d] font-bold text-lg">{matchScore}%</span>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Compatibility Score</p>
                  <p className="text-gray-400 text-sm">Stub example — real matching coming soon</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Save your preferences to view your profile and match score.</p>
            )}
          </div>
        </div>

        {/* Button Container */}
        <div className="flex gap-3 justify-center">
          <button onClick={savePreferences} className="px-6 py-2 bg-[#ffc600] text-[#07294d] font-semibold rounded-lg hover:bg-yellow-500 transition">Save</button>
          <Link href="/my-profile" className="px-6 py-2 bg-[#07294d] text-white font-semibold rounded-lg hover:bg-blue-900 transition inline-block text-center">Preview</Link>
          <button onClick={clearPreferences} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition">Clear</button>
        </div>
        {saveMsg && <p className="text-center text-sm text-gray-600">{saveMsg}</p>}
        {lastSaved && <p className="text-center text-xs text-gray-400">Last saved: {lastSaved}</p>}

      </div>
    </div>
  );
}
