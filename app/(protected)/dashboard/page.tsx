// Author: Patrick Melan, April 12 2026
// Mod by Patrick Melan, May 15 2026

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

// strip seconds from HH:MM:SS → HH:MM
function formatTime(raw?: string): string {
  if (!raw) return "—";
  return raw.slice(0, 5);
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  // fetch profile and match count in parallel
  useEffect(() => {
    fetch("/api/profiles")
      .then((res) => res.json())
      .then((data) => setProfile(data));

    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => setMatchCount(data.matches?.length ?? 0));
  }, []);

  return (
    <div className="h-screen bg-[#f5f6fa] font-sans flex flex-col overflow-hidden">
      <div className="flex flex-1 gap-5 p-6 overflow-hidden">
        {/* profile sidebar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col w-72 shrink-0 overflow-hidden self-start">
          <div className="bg-[#07294d] px-6 py-5">
            <h2 className="text-white font-bold text-lg">Profile</h2>
          </div>
          <div className="p-6 flex flex-col gap-4 text-sm text-gray-700">
            <Field label="First Name" value={profile?.user?.first_name} />
            <Field label="Last Name" value={profile?.user?.last_name} />
            <Field label="Email" value={profile?.user?.email} />
            <Field
              label="Hometown"
              value={
                profile?.user?.home_town + ", " + profile?.user?.home_state
              }
            />
            {profile?.user?.social_links &&
              profile?.user?.social_links.length > 0 && (
                <Field label="Social Links" value={profile.user.social_links} />
              )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-5 overflow-y-auto">
          {/* stats row */}
          <div className="grid grid-cols-3 gap-5">
            <StatCard label="Matches" value={matchCount ?? "—"} />
            <StatCard
              label="Interests"
              value={profile?.interests?.length ?? "—"}
            />
            <StatCard label="GPA" value={profile?.academics?.gpa ?? "—"} />
          </div>

          {/* academics card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start w-full">
            <div className="bg-[#07294d] px-6 py-5">
              <h2 className="text-white font-bold text-lg">Academics</h2>
            </div>
            <div className="p-6 grid grid-cols-4 gap-5 text-sm text-gray-700">
              <Field label="Year" value={profile?.academics?.academic_year} />
              <Field label="Major" value={profile?.academics?.major} />

              {profile?.academics?.minor && (
                <Field label="Minor" value={profile?.academics?.minor} />
              )}
            </div>
          </div>

          {/* living style card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start w-full">
            <div className="bg-[#07294d] px-6 py-5">
              <h2 className="text-white font-bold text-lg">Living Style</h2>
            </div>
            <div className="p-6 grid grid-cols-3 gap-5 text-sm text-gray-700">
              <Field
                label="Bedtime"
                value={formatTime(profile?.living?.time_sleep)}
              />
              <Field
                label="Wake Time"
                value={formatTime(profile?.living?.time_wake)}
              />
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
              {/* music as badges */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Music
                </p>
                {profile?.living?.music_genre?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.living.music_genre.map((g) => (
                      <span
                        key={g}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {g}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-medium text-gray-700">—</p>
                )}
              </div>
            </div>
          </div>

          {/* interests card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start w-full">
            <div className="bg-[#07294d] px-6 py-5">
              <h2 className="text-white font-bold text-lg">Interests</h2>
            </div>
            <div className="p-6">
              {profile?.interests?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((i) => (
                    <span
                      key={i.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-700">
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm bg-white px-6 py-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-[#07294d]">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-0.5 font-medium text-gray-700">{value || "—"}</p>
    </div>
  );
}
