import { cookies } from "next/headers";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import LikeButton from "@/app/(protected)/user/[user_id]/LikeButton";

export const dynamic = "force-dynamic";

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

const INTEREST_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
];

function interestColor(name: string): string {
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % INTEREST_COLORS.length;
  return INTEREST_COLORS[index];
}

const AVATAR_COLORS = [
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-yellow-500",
  "from-blue-600 to-indigo-600",
  "from-amber-600 to-orange-500",
  "from-blue-400 to-cyan-500",
  "from-amber-400 to-yellow-600",
];

function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function avatarColor(id: string): string {
  const index = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default async function ExplorePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  let currentUserId: string | null = null;
  if (sessionToken) {
    const { data } = await supabaseAdmin.auth.getUser(sessionToken);
    currentUserId = data.user?.id ?? null;
  }

  const { data: allUsers, error: usersError } = await supabaseAdmin
    .from("users")
    .select("id, first_name, last_name, home_town, home_state")
    .order("created_at", { ascending: false });

  if (usersError) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8">
          <p className="font-semibold text-red-700">Database error</p>
          <p className="mt-1 text-sm text-red-600">{usersError.message}</p>
        </div>
      </div>
    );
  }

  const users = (allUsers ?? []).filter((u) => u.id !== currentUserId);

  type AcademicsRow = { user_id: string; academic_year: string | null; major: string | null; gpa: number | null };
  type InterestRow = { user_id: string; name: string };

  let academicsMap = new Map<string, AcademicsRow>();
  let interestsMap = new Map<string, string[]>();
  let likedIds = new Set<string>();

  if (users.length > 0) {
    const userIds = users.map((u) => u.id);

    const [{ data: allAcademics }, { data: allInterests }, likedResult] = await Promise.all([
      supabaseAdmin.from("academics").select("user_id, academic_year, major, gpa").in("user_id", userIds),
      supabaseAdmin.from("interests").select("user_id, name").in("user_id", userIds),
      currentUserId
        ? supabaseAdmin.from("likes").select("liked_id").eq("liker_id", currentUserId)
        : Promise.resolve({ data: [] as { liked_id: string }[] }),
    ]);

    academicsMap = new Map((allAcademics ?? []).map((a) => [a.user_id, a as AcademicsRow]));

    for (const i of (allInterests ?? []) as InterestRow[]) {
      const list = interestsMap.get(i.user_id) ?? [];
      if (!list.includes(i.name)) list.push(i.name);
      interestsMap.set(i.user_id, list);
    }

    likedIds = new Set(
      ((likedResult as { data: { liked_id: string }[] | null }).data ?? []).map((r) => r.liked_id)
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
            Browse verified campus roommates
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Compare student profiles, shared routines, and lifestyle preferences to find the best
            match for your next housing term.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-600">
            No roommate profiles are available at the moment.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {users.map((profile) => {
              const academics = academicsMap.get(profile.id);
              const interests = interestsMap.get(profile.id) ?? [];
              const alreadyLiked = likedIds.has(profile.id);

              return (
                <div
                  key={profile.id}
                  className="relative rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="absolute right-4 top-4">
                    <LikeButton likedId={profile.id} initiallyLiked={alreadyLiked} compact />
                  </div>

                  <div
                    className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(profile.id)} text-white shadow-lg`}
                  >
                    <span className="text-3xl font-semibold">
                      {initials(profile.first_name ?? "", profile.last_name ?? "")}
                    </span>
                  </div>

                  <h2 className="text-2xl font-semibold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  {(profile.home_town || profile.home_state) && (
                    <p className="mt-2 text-sm text-gray-600">
                      {[profile.home_town, profile.home_state].filter(Boolean).join(", ")}
                    </p>
                  )}

                  {academics && (
                    <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#07294d]">
                        Academic snapshot
                      </p>
                      <p className="mt-3 text-sm text-gray-900">
                        {[academics.academic_year, academics.major].filter(Boolean).join(" · ")}
                      </p>
                      {academics.gpa != null && (
                        <p className="mt-2 text-sm text-gray-600">
                          GPA {Number(academics.gpa).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}

                  {interests.length > 0 && (
                    <div className="mt-6 grid gap-2">
                      <div className="text-xs uppercase tracking-[0.18em] text-[#07294d]">
                        Shared interests
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((name) => (
                          <span
                            key={name}
                            className={`rounded-full border px-3 py-1 text-sm font-medium ${interestColor(name)}`}
                          >
                            {INTEREST_EMOJIS[name] ?? ""} {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/user/${profile.id}`}
                    className="mt-6 block rounded-2xl border border-gray-200 py-2 text-center text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    View Profile →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
