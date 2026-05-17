import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  computeCompatibilityScore,
  matchScoreBadgeClasses,
  type LivingStyleForMatch,
} from "@/lib/match-score";
import LikeButton from "./LikeButton";

const INTEREST_EMOJIS: Record<string, string> = {
  Gaming: "🎮",
  "Gym / Fitness": "💪",
  Cooking: "🍳",
  Hiking: "🥾",
  Reading: "📚",
  Music: "🎵",
  Art: "🎨",
  Photography: "📷",
  Travel: "✈️",
  Movies: "🎬",
  Sports: "⚽",
  Coding: "💻",
  Dancing: "💃",
  Volunteering: "🤝",
  Fashion: "👗",
  Esports: "🏆",
};

function formatTime(t: string | null | undefined): string {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function toLivingStyleForMatch(row: {
  noise_level: number;
  cleanliness: number;
  comfortable_temp: number;
  time_sleep: string;
  time_wake: string;
  music_genre: string[] | null;
}): LivingStyleForMatch {
  return {
    noise_level: row.noise_level,
    cleanliness: row.cleanliness,
    comfortable_temp: row.comfortable_temp,
    time_sleep: row.time_sleep,
    time_wake: row.time_wake,
    music_genre: row.music_genre,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  let currentUserId: string | null = null;
  if (sessionToken) {
    const { data } = await supabaseAdmin.auth.getUser(sessionToken);
    currentUserId = data.user?.id ?? null;
  }

  const isSelf = currentUserId === user_id;

  const [{ data: user }, { data: academics }, { data: living }, { data: interests }] =
    await Promise.all([
      supabaseAdmin.from("users").select("*").eq("id", user_id).single(),
      supabaseAdmin.from("academics").select("*").eq("user_id", user_id).single(),
      supabaseAdmin.from("living_styles").select("*").eq("user_id", user_id).single(),
      supabaseAdmin.from("interests").select("*").eq("user_id", user_id),
    ]);

  if (!user) notFound();

  let alreadyLiked = false;
  if (currentUserId && !isSelf) {
    const { data: likeRow } = await supabaseAdmin
      .from("likes")
      .select("id")
      .eq("liker_id", currentUserId)
      .eq("liked_id", user_id)
      .single();
    alreadyLiked = !!likeRow;
  }

  let compatibilityScore: number | null = null;
  if (currentUserId && !isSelf && living) {
    const [{ data: myLiving }, { data: myInterests }] = await Promise.all([
      supabaseAdmin.from("living_styles").select("*").eq("user_id", currentUserId).maybeSingle(),
      supabaseAdmin.from("interests").select("name").eq("user_id", currentUserId),
    ]);

    if (myLiving) {
      const theirInterests = (interests ?? []).map((i: { name: string }) => i.name);
      const myInterestNames = (myInterests ?? []).map((i: { name: string }) => i.name);
      compatibilityScore = computeCompatibilityScore(
        toLivingStyleForMatch(myLiving),
        toLivingStyleForMatch(living),
        myInterestNames,
        theirInterests,
      );
    }
  }

  return (
    <div className="bg-[#f5f6fa] font-sans">
      <div className="mx-auto max-w-3xl px-4 py-5 space-y-4">
        <Link
          href="/explore"
          className="inline-flex items-center text-sm font-medium text-[#07294d] hover:text-[#0a3a6e] transition"
        >
          ← Back to Explore
        </Link>

        <div className="relative bg-gradient-to-r from-[#07294d] to-[#0a3a6e] rounded-xl p-5 text-white shadow-md flex items-center gap-4">
          {compatibilityScore !== null && (
            <div
              className={`absolute right-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 shadow-sm ${matchScoreBadgeClasses(compatibilityScore)}`}
            >
              <span className="text-lg font-bold leading-none">{compatibilityScore}%</span>
              <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-widest leading-none opacity-75">
                match
              </span>
            </div>
          )}

          <div className="w-16 h-16 rounded-full bg-[#ffc600] flex items-center justify-center shadow shrink-0">
            <span className="text-xl font-bold text-[#07294d]">
              {initials(user.first_name ?? "", user.last_name ?? "")}
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-20">
            <h2 className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h2>
            {(user.home_town || user.home_state) && (
              <p className="text-blue-200 mt-0.5 text-sm">
                {[user.home_town, user.home_state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {!isSelf && <LikeButton likedId={user_id} initiallyLiked={alreadyLiked} />}
        </div>

        {academics && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#07294d] px-4 py-2.5">
              <h3 className="text-[#ffc600] font-semibold uppercase tracking-widest text-xs">
                Academic Snapshot
              </h3>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 gap-3 text-sm">
              {academics.academic_year && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-0.5">Year</p>
                  <p className="text-gray-900 font-medium">{academics.academic_year}</p>
                </div>
              )}
              {academics.major && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-0.5">Major</p>
                  <p className="text-gray-900 font-medium">{academics.major}</p>
                </div>
              )}
              {academics.minor?.length > 0 && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-0.5">Minor</p>
                  <p className="text-gray-900 font-medium">
                    {Array.isArray(academics.minor) ? academics.minor.join(", ") : academics.minor}
                  </p>
                </div>
              )}
              {academics.gpa != null && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-0.5">GPA</p>
                  <p className="text-gray-900 font-medium">{Number(academics.gpa).toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {living && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#07294d] px-4 py-2.5">
              <h3 className="text-[#ffc600] font-semibold uppercase tracking-widest text-xs">
                Living Style
              </h3>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-500 uppercase tracking-wider text-xs mb-0.5">Bedtime</p>
                <p className="text-gray-900 font-medium">{formatTime(living.time_sleep)}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase tracking-wider text-xs mb-0.5">Wake time</p>
                <p className="text-gray-900 font-medium">{formatTime(living.time_wake)}</p>
              </div>
              {living.comfortable_temp != null && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-0.5">Temp</p>
                  <p className="text-gray-900 font-medium">{living.comfortable_temp}°F</p>
                </div>
              )}
              {living.noise_level != null && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-0.5">Noise</p>
                  <p className="text-gray-900 font-medium">{living.noise_level} / 5</p>
                </div>
              )}
              {living.cleanliness != null && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-0.5">Cleanliness</p>
                  <p className="text-gray-900 font-medium">{living.cleanliness} / 5</p>
                </div>
              )}
              {living.music_genre?.length > 0 && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-1.5">Music</p>
                  <div className="flex flex-wrap gap-1.5">
                    {living.music_genre.map((g: string) => (
                      <span
                        key={g}
                        className="rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-sm text-gray-700"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {interests && interests.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#07294d] px-4 py-2.5">
              <h3 className="text-[#ffc600] font-semibold uppercase tracking-widest text-xs">
                Interests
              </h3>
            </div>
            <div className="px-4 py-3 flex flex-wrap gap-1.5">
              {interests.map((i: { name: string }) => (
                <span
                  key={i.name}
                  className="rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-sm text-gray-700"
                >
                  {INTEREST_EMOJIS[i.name] ?? ""} {i.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
