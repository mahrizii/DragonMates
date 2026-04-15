// Author: Patrick Melan, April 12 2026
// Mod by Patrick Melan, April 14 2026

"use client";

import { use, useEffect, useState } from "react";

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

export default function DashboardPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  // unwrap async params with use()
  const { user_id } = use(params);

  // store fetched profile data in state
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // fetch all user profile data on load
  useEffect(() => {
    fetch(`/api/profiles?user_id=${user_id}`)
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, [user_id]);

  return (
    <div className="h-screen bg-[#f5f6fa] font-sans flex flex-col overflow-hidden">
      <div className="bg-[#07294d] px-8 py-4 flex items-center justify-between shadow-md shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#ffc600] tracking-wide">
            DragonMates
          </h1>
          <p className="text-blue-300 text-xs mt-0.5">Dashboard</p>
        </div>
        <span className="text-blue-200 text-sm">ID: {user_id}</span>
      </div>

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
            <div className="p-5 text-sm text-gray-400">
              {profile?.interests
                ?.map((i) => `${i.emoji} ${i.name}`)
                .join(", ") || "—"}
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
      {/* show dash if value hasn't loaded yet */}
      <p className="text-gray-700 mt-0.5">{value || "—"}</p>
    </div>
  );
}
