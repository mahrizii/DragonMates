"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";

type RoommatePrefs = {
  sleepSchedule: string;
  cleanliness: string;
  noise: string;
  guests: string;
  socialBattery: string;
  responsibilities: string;
  interests: string;
  budget: number | string;
};

export default function SavedProfilePage() {
  const [savedProfile, setSavedProfile] = useState<RoommatePrefs | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("roommatePrefs");
    const savedTime = localStorage.getItem("roommatePrefsTime");
    if (!saved) return;
    const parsed = JSON.parse(saved) as RoommatePrefs;
    startTransition(() => {
      setSavedProfile(parsed);
      setLastSaved(savedTime);
      // Stub: set a fake match score for demonstration
      setMatchScore(87);
    });
  }, []);

  const responsibilitiesMap: Record<string, string> = {
    low: "Minimal — I do my part",
    medium: "Balanced — split evenly",
    high: "Proactive — I like things done",
  };

  if (!savedProfile) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] font-sans">
        {/* Header */}
        <div className="bg-[#07294d] px-8 py-5 flex items-center justify-between shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-[#ffc600] tracking-wide">Dragonmates</h1>
            <p className="text-blue-200 text-sm mt-0.5">Find your perfect roommate match</p>
          </div>
          <div className="flex gap-3">
            <Link href="/explore" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
              Explore
            </Link>
            <Link href="/preferences" className="px-3 py-1.5 bg-[#ffc600] text-[#07294d] text-sm font-semibold rounded-lg hover:bg-[#e6b200] transition">
              Preferences
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-gray-400">📋</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Saved Profile Found</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven&apos;t saved any preferences yet. Set up your roommate preferences to see your profile here.
              </p>
              <Link
                href="/preferences"
                className="inline-block px-8 py-3 bg-[#07294d] text-white font-semibold rounded-lg hover:bg-[#0a3a6e] transition"
              >
                Set Up Preferences
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
          <Link href="/explore" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
            Explore
          </Link>
          <Link href="/preferences" className="px-3 py-1.5 bg-[#ffc600] text-[#07294d] text-sm font-semibold rounded-lg hover:bg-[#e6b200] transition">
            Edit Preferences
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#07294d] to-[#0a3a6e] rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#ffc600] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-[#07294d]">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Roommate Profile</h1>
              <p className="text-blue-200 text-lg">Ready to find your perfect match!</p>
              {lastSaved && (
                <p className="text-blue-300 text-sm mt-2">Last updated: {lastSaved}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Sleep Schedule", value: savedProfile.sleepSchedule, icon: "🛏️", color: "from-blue-50 to-blue-100", iconColor: "text-blue-600" },
            { label: "Cleanliness", value: savedProfile.cleanliness, icon: "🧹", color: "from-green-50 to-green-100", iconColor: "text-green-600" },
            { label: "Noise Level", value: savedProfile.noise, icon: "🔊", color: "from-purple-50 to-purple-100", iconColor: "text-purple-600" },
            { label: "Guests", value: savedProfile.guests, icon: "👥", color: "from-orange-50 to-orange-100", iconColor: "text-orange-600" },
            { label: "Social Battery", value: savedProfile.socialBattery, icon: "⚡", color: "from-yellow-50 to-yellow-100", iconColor: "text-yellow-600" },
            { label: "Responsibilities", value: responsibilitiesMap[savedProfile.responsibilities] || savedProfile.responsibilities, icon: "🏠", color: "from-pink-50 to-pink-100", iconColor: "text-pink-600" },            
            { label: "Interests", value: savedProfile.interests || "None specified", icon: "🎯", color: "from-indigo-50 to-indigo-100", iconColor: "text-indigo-600" },
            { label: "Budget", value: savedProfile.budget ? `$${savedProfile.budget}/mo` : "Not set", icon: "💰", color: "from-teal-50 to-teal-100", iconColor: "text-teal-600" },
          ].map(({ label, value, icon, color, iconColor }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-r ${color} px-4 py-3 border-b border-gray-200`}>
                <div className="flex items-center gap-2">
                  <span className={`${iconColor} text-lg`}>{icon}</span>
                  <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wider">{label}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-900 font-medium capitalize">{value || "Not set"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Match Score Card */}
        {matchScore !== null && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#ffc600] to-[#e6b200] px-6 py-4">
              <h2 className="text-[#07294d] font-bold text-lg flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Compatibility Score
              </h2>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#07294d] to-[#0a3a6e] flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-3xl">{matchScore}%</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Great Match Potential!</h3>
                  <p className="text-gray-600 mb-4">
                    Based on your preferences, you&apos;re {matchScore}% compatible with profiles in our database.
                    Start exploring to find your ideal roommate!
                  </p>
                  <Link
                    href="/explore"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-[#07294d] to-[#0a3a6e] text-white font-semibold rounded-lg hover:from-[#0a3a6e] hover:to-[#07294d] transition-all shadow-md"
                  >
                    Explore Roommates
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/preferences"
            className="px-8 py-3 bg-gradient-to-r from-[#07294d] to-[#0a3a6e] text-white font-semibold rounded-lg hover:from-[#0a3a6e] hover:to-[#07294d] transition-all shadow-md"
          >
            Edit Preferences
          </Link>
          <Link
            href="/explore"
            className="px-8 py-3 bg-gradient-to-r from-[#ffc600] to-[#e6b200] text-[#07294d] font-semibold rounded-lg hover:from-[#e6b200] hover:to-[#ffc600] transition-all shadow-md"
          >
            Find Roommates
          </Link>
        </div>
      </div>
    </div>
  );
}