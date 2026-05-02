import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import LikeButton from "./LikeButton";

const INTEREST_EMOJIS: Record<string, string> = {
  "Gaming": "🎮",
  "Gym / Fitness": "💪",
  "Cooking": "🍳",
  "Hiking": "🥾",
  "Reading": "📚",
  "Music": "🎵",
  "Art": "🎨",
  "Photography": "📷",
  "Travel": "✈️",
  "Movies": "🎬",
  "Sports": "⚽",
  "Coding": "💻",
  "Dancing": "💃",
  "Volunteering": "🤝",
  "Fashion": "👗",
  "Esports": "🏆",
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

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;

  // Identify the logged-in user from the session cookie
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

  // Check if current user has already liked this profile
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

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">
      {/* Header */}
      <div className="bg-[#07294d] px-8 py-5 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-[#ffc600] tracking-wide">DragonMates</h1>
          <p className="text-blue-200 text-sm mt-0.5">Student profile</p>
        </div>
        <Link
          href="/explore"
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          ← Back to Explore
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Profile hero */}
        <div className="bg-gradient-to-r from-[#07294d] to-[#0a3a6e] rounded-2xl p-8 text-white shadow-lg flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#ffc600] flex items-center justify-center shadow-lg shrink-0">
            <span className="text-2xl font-bold text-[#07294d]">
              {initials(user.first_name ?? "", user.last_name ?? "")}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold">
              {user.first_name} {user.last_name}
            </h2>
            {(user.home_town || user.home_state) && (
              <p className="text-blue-200 mt-1">
                {[user.home_town, user.home_state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          {!isSelf && (
            <LikeButton likedId={user_id} initiallyLiked={alreadyLiked} />
          )}
        </div>

        {/* Academics */}
        {academics && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#07294d] px-6 py-4">
              <h3 className="text-[#ffc600] font-semibold uppercase tracking-widest text-xs">
                Academic Snapshot
              </h3>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
              {academics.academic_year && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Year</p>
                  <p className="text-gray-900 font-medium">{academics.academic_year}</p>
                </div>
              )}
              {academics.major && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Major</p>
                  <p className="text-gray-900 font-medium">{academics.major}</p>
                </div>
              )}
              {academics.minor?.length > 0 && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Minor</p>
                  <p className="text-gray-900 font-medium">
                    {Array.isArray(academics.minor) ? academics.minor.join(", ") : academics.minor}
                  </p>
                </div>
              )}
              {academics.gpa != null && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">GPA</p>
                  <p className="text-gray-900 font-medium">{Number(academics.gpa).toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Living style */}
        {living && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#07294d] px-6 py-4">
              <h3 className="text-[#ffc600] font-semibold uppercase tracking-widest text-xs">
                Living Style
              </h3>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Bedtime</p>
                <p className="text-gray-900 font-medium">{formatTime(living.time_sleep)}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Wake time</p>
                <p className="text-gray-900 font-medium">{formatTime(living.time_wake)}</p>
              </div>
              {living.comfortable_temp != null && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Temp</p>
                  <p className="text-gray-900 font-medium">{living.comfortable_temp}°F</p>
                </div>
              )}
              {living.noise_level != null && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Noise</p>
                  <p className="text-gray-900 font-medium">{living.noise_level} / 5</p>
                </div>
              )}
              {living.cleanliness != null && (
                <div>
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">Cleanliness</p>
                  <p className="text-gray-900 font-medium">{living.cleanliness} / 5</p>
                </div>
              )}
              {living.music_genre?.length > 0 && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-gray-500 uppercase tracking-wider text-xs mb-2">Music</p>
                  <div className="flex flex-wrap gap-2">
                    {living.music_genre.map((g: string) => (
                      <span
                        key={g}
                        className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-700"
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

        {/* Interests */}
        {interests && interests.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#07294d] px-6 py-4">
              <h3 className="text-[#ffc600] font-semibold uppercase tracking-widest text-xs">
                Interests
              </h3>
            </div>
            <div className="px-6 py-5 flex flex-wrap gap-2">
              {interests.map((i: { name: string }) => (
                <span
                  key={i.name}
                  className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-700"
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
