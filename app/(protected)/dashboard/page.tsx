// Author: Patrick Melan, April 12 2026
// Mod by Patrick Melan, April 14 2026

"use client";

import { useEffect, useState } from "react";

// type for all profile data returned by GET /api/profiles
type ProfileData = {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    home_town: string;
    home_state: string;
    social_links: string;
  } | null;
  academics: {
    academic_year: string;
    major: string;
    minor: string;
    gpa: string;
  } | null;
  living: {
    time_sleep: string;
    time_wake: string;
    comfortable_temp: string;
    noise_level: string;
    cleanliness: string;
    music_genre: string[];
  } | null;
  interests: { name: string; emoji: string; description: string }[] | null;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // fetch profile for the authenticated user — API reads user_id from session cookie
  useEffect(() => {
    fetch("/api/profiles")
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  return (
    <div className="h-screen bg-[#f5f6fa] font-sans flex flex-col overflow-hidden">
      <div className="flex flex-1 gap-4 p-6 overflow-hidden">
        {/* profile sidebar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col w-64 shrink-0 overflow-hidden self-start">
          <div className="bg-[#07294d] px-5 py-3">
            <h2 className="text-white font-semibold">Profile</h2>
          </div>
          <div className="p-5 flex flex-col gap-3 text-sm text-gray-700">
            <Field label="First Name" value={profile?.user?.first_name} />
            <Field label="Last Name" value={profile?.user?.last_name} />
            <Field label="Email" value={profile?.user?.email} />
            <Field label="Hometown" value={profile?.user?.home_town} />
            <Field label="Home State" value={profile?.user?.home_state} />
            <Field label="Social Links" value={profile?.user?.social_links} />
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4 overflow-hidden">
          {/* academics card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start w-full">
            <div className="bg-[#07294d] px-5 py-3">
              <h2 className="text-white font-semibold">Academics</h2>
            </div>
            <div className="p-5 grid grid-cols-4 gap-4 text-sm text-gray-700">
              <Field label="Year" value={profile?.academics?.academic_year} />
              <Field label="Major" value={profile?.academics?.major} />
              <Field label="Minor" value={profile?.academics?.minor} />
              <Field label="GPA" value={profile?.academics?.gpa} />
            </div>
          </div>

          {/* living style card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start w-full">
            <div className="bg-[#07294d] px-5 py-3">
              <h2 className="text-white font-semibold">Living Style</h2>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4 text-sm text-gray-700">
              <Field label="Bedtime" value={profile?.living?.time_sleep} />
              <Field label="Wake Time" value={profile?.living?.time_wake} />
              <Field
                label="Temp"
                value={profile?.living?.comfortable_temp?.toString()}
              />
              <Field
                label="Noise Level"
                value={profile?.living?.noise_level?.toString()}
              />
              <Field
                label="Cleanliness"
                value={profile?.living?.cleanliness?.toString()}
              />
              <Field
                label="Music"
                value={profile?.living?.music_genre?.join(", ")}
              />
            </div>
          </div>

          {/* interests card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start w-full">
            <div className="bg-[#07294d] px-5 py-3">
              <h2 className="text-white font-semibold">Interests</h2>
            </div>
            <div className="p-5">
              {profile?.interests?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((i) => (
                    <span
                      key={i.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-[#07294d]">
                      <span>{i.emoji}</span>
                      {i.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-gray-700 mt-0.5">{value || "—"}</p>
    </div>
  );
}
