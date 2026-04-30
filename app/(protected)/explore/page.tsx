"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  home_town: string;
  home_state: string;
  avatar_url: string;
  academics: Array<{
    academic_year: string;
    major: string;
    minor: string;
    gpa: number;
  }>;
  living_style: Array<{
    time_sleep: string;
    time_wake: string;
    comfortable_temp: number;
    noise_level: number;
    cleanliness: number;
    music_genre: string[];
  }>;
  interests: Array<{
    interests: string[];
  }>;
}

const AVATAR_COLORS = [
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-yellow-500",
  "from-blue-600 to-indigo-600",
  "from-amber-600 to-orange-500",
  "from-blue-400 to-cyan-500",
  "from-amber-400 to-yellow-600",
];

const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    email: "alex.johnson@university.edu",
    first_name: "Alex",
    last_name: "Johnson",
    home_town: "Boston",
    home_state: "Massachusetts",
    avatar_url: "AJ",
    academics: [
      {
        academic_year: "Sophomore",
        major: "Computer Science",
        minor: "Mathematics",
        gpa: 3.8,
      },
    ],
    living_style: [
      {
        time_sleep: "23:30",
        time_wake: "07:00",
        comfortable_temp: 72,
        noise_level: 3,
        cleanliness: 4,
        music_genre: ["Lo-fi", "Classical", "Jazz"],
      },
    ],
    interests: [
      {
        interests: ["Coding", "Gaming", "Reading"],
      },
    ],
  },
  {
    id: "2",
    email: "sarah.smith@university.edu",
    first_name: "Sarah",
    last_name: "Smith",
    home_town: "New York",
    home_state: "New York",
    avatar_url: "SS",
    academics: [
      {
        academic_year: "Junior",
        major: "Business Administration",
        minor: "Marketing",
        gpa: 3.6,
      },
    ],
    living_style: [
      {
        time_sleep: "22:00",
        time_wake: "06:30",
        comfortable_temp: 70,
        noise_level: 2,
        cleanliness: 5,
        music_genre: ["Pop", "R&B", "Hip-Hop"],
      },
    ],
    interests: [
      {
        interests: ["Gym / Fitness", "Fashion", "Cooking"],
      },
    ],
  },
  {
    id: "3",
    email: "jordan.lee@university.edu",
    first_name: "Jordan",
    last_name: "Lee",
    home_town: "Los Angeles",
    home_state: "California",
    avatar_url: "JL",
    academics: [
      {
        academic_year: "Freshman",
        major: "Environmental Science",
        minor: "",
        gpa: 3.7,
      },
    ],
    living_style: [
      {
        time_sleep: "23:00",
        time_wake: "08:00",
        comfortable_temp: 75,
        noise_level: 4,
        cleanliness: 3,
        music_genre: ["Indie", "Electronic", "Rock"],
      },
    ],
    interests: [
      {
        interests: ["Hiking", "Photography", "Travel"],
      },
    ],
  },
];

const INTEREST_OPTIONS = [
  { name: "Gaming", emoji: "🎮" },
  { name: "Gym / Fitness", emoji: "💪" },
  { name: "Cooking", emoji: "🍳" },
  { name: "Hiking", emoji: "🥾" },
  { name: "Reading", emoji: "📚" },
  { name: "Music", emoji: "🎵" },
  { name: "Art", emoji: "🎨" },
  { name: "Photography", emoji: "📷" },
  { name: "Travel", emoji: "✈️" },
  { name: "Movies", emoji: "🎬" },
  { name: "Sports", emoji: "⚽" },
  { name: "Coding", emoji: "💻" },
  { name: "Dancing", emoji: "💃" },
  { name: "Volunteering", emoji: "🤝" },
  { name: "Fashion", emoji: "👗" },
  { name: "Esports", emoji: "🏆" },
];

export default function ExplorePage() {
  const [connectedProfiles, setConnectedProfiles] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("connectedProfiles");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  function toggleConnection(profileId: string) {
    setConnectedProfiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      localStorage.setItem("connectedProfiles", JSON.stringify([...newSet]));
      return newSet;
    });
  }

  function getInterestEmoji(name: string): string {
    return INTEREST_OPTIONS.find((opt) => opt.name === name)?.emoji || "";
  }

  function getAvatarColor(id: string): string {
    const index = parseInt(id) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">

      {/* Header */}
      <div className="bg-[#07294d] px-8 py-5 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-[#ffc600] tracking-wide">DragonMates</h1>
          <p className="text-blue-200 text-sm mt-0.5">Browse verified campus roommates</p>
        </div>
        <div className="flex gap-3">
          <Link href="/my-profile" className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
            My Profile
          </Link>
          <Link href="/preferences" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
            Preferences
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Browse verified campus roommates</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Compare student profiles, shared routines, and lifestyle preferences to find the best match for your next housing term.
          </p>
        </div>

        {MOCK_PROFILES.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-600">
            No roommate profiles are available at the moment.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {MOCK_PROFILES.map((profile) => (
              <div
                key={profile.id}
                className="relative rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <button
                  onClick={() => toggleConnection(profile.id)}
                  className="absolute top-4 right-4 text-2xl transition-colors hover:scale-110"
                  style={{ color: connectedProfiles.has(profile.id) ? '#ef4444' : '#6b7280' }}
                >
                  {connectedProfiles.has(profile.id) ? '❤️' : '🤝'}
                </button>
                <div
                  className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(
                    profile.id,
                  )} text-white shadow-lg`}
                >
                  <span className="text-3xl font-semibold">{profile.avatar_url}</span>
                </div>

                <h2 className="text-2xl font-semibold text-gray-900">{profile.first_name} {profile.last_name}</h2>
                <p className="mt-2 text-sm text-gray-600">{profile.home_town}, {profile.home_state}</p>

                <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#07294d]">Academic snapshot</p>
                  <p className="mt-3 text-sm text-gray-900">{profile.academics[0].academic_year} · {profile.academics[0].major}</p>
                  {profile.academics[0].minor && <p className="mt-2 text-sm text-gray-600">Minor: {profile.academics[0].minor}</p>}
                  <p className="mt-2 text-sm text-gray-600">GPA {profile.academics[0].gpa.toFixed(2)}</p>
                </div>

                <div className="mt-6 grid gap-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#07294d]">Shared interests</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests[0].interests.map((interest) => (
                      <span key={interest} className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        {getInterestEmoji(interest)} {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
