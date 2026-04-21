"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  startTransition,
} from "react";
import Link from "next/link";

type RoommatePrefs = {
  sleepSchedule: string;
  cleanliness: string;
  noise: string;
  guests: string;
  socialBattery: string;
  responsibilities: string;
  interests: string;
  budget: number;
};

const defaultPrefs: RoommatePrefs = {
  sleepSchedule: "",
  cleanliness: "",
  noise: "",
  guests: "",
  socialBattery: "",
  responsibilities: "",
  interests: "",
  budget: 1500,
};

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<RoommatePrefs>({ ...defaultPrefs });
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RoommatePrefs, string>>
  >({});

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoad = useRef(true);

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

  function handleChange(
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) {
    const { name, value } = e.target;

    if (name === "budget") {
      setPrefs({ ...prefs, budget: Number(value) });
    } else {
      setPrefs({ ...prefs, [name]: value });
    }

    if (errors[name as keyof RoommatePrefs]) {
      setErrors({ ...errors, [name]: undefined });
    }
  }

  // ✅ Load saved data (optimized)
  useEffect(() => {
    const saved = localStorage.getItem("roommatePrefs");
    const savedTime = localStorage.getItem("roommatePrefsTime");

    if (!saved) return;

    const parsed = JSON.parse(saved) as RoommatePrefs;

    startTransition(() => {
      setPrefs(parsed);
      setLastSaved(savedTime || null);
      setMatchScore(87);
    });
  }, []);

  function validate() {
    const newErrors: Partial<Record<keyof RoommatePrefs, string>> = {};

    fields.forEach(({ name, label }) => {
      if (!prefs[name as keyof RoommatePrefs]) {
        newErrors[name as keyof RoommatePrefs] = `${label} is required.`;
      }
    });

    if (!prefs.interests.trim()) {
      newErrors.interests = "Interests are required.";
    }

    return newErrors;
  }

  const savePreferencesToStorage = useCallback(() => {
    localStorage.setItem("roommatePrefs", JSON.stringify(prefs));

    const time = new Date().toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    localStorage.setItem("roommatePrefsTime", time);
    setLastSaved(time);
  }, [prefs]);

  // ✅ Safe debounced autosave
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      savePreferencesToStorage();
    }, 2000);
  }, [savePreferencesToStorage]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    debouncedSave();
  }, [prefs, debouncedSave]);

  function savePreferences() {
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    savePreferencesToStorage();
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
          <h1 className="text-2xl font-bold text-[#ffc600] tracking-wide">
            Dragonmates
          </h1>
          <p className="text-blue-200 text-sm mt-0.5">
            Find your perfect roommate match
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/my-profile"
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
          >
            My Profile
          </Link>

          <Link
            href="/explore"
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Explore
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 grid gap-5">
          {fields.map(({ label, name, options }) => (
            <div key={name}>
              <label className="text-xs font-semibold">{label}</label>
              <select
                name={name}
                value={prefs[name as keyof RoommatePrefs]}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors[name as keyof RoommatePrefs] && (
                <p className="text-red-500 text-xs">
                  {errors[name as keyof RoommatePrefs]}
                </p>
              )}
            </div>
          ))}

          <input
            type="text"
            name="interests"
            value={prefs.interests}
            onChange={handleChange}
            placeholder="Interests..."
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="range"
            name="budget"
            min="0"
            max="3000"
            step="100"
            value={prefs.budget}
            onChange={handleChange}
          />
          <p>${prefs.budget}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button onClick={savePreferences}>Save</button>
          <button onClick={clearPreferences}>Clear</button>
        </div>

        {saveMsg && <p className="text-center">{saveMsg}</p>}
        {lastSaved && <p className="text-center">Last saved: {lastSaved}</p>}
      </div>
    </div>
  );
}