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

type LivingStyleRow = {
  user_id: string;
  noise_level: number;
  cleanliness: number;
  comfortable_temp: number;
  time_sleep: string;
  time_wake: string;
  music_genre: string[] | null;
};

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function computeScore(
  u: LivingStyleRow,
  t: LivingStyleRow,
  uInterests: string[],
  tInterests: string[],
): number {
  const noiseScore = 1 - Math.abs(u.noise_level - t.noise_level) / 4;
  const cleanScore = 1 - Math.abs(u.cleanliness - t.cleanliness) / 4;
  const tempScore = 1 - Math.abs(u.comfortable_temp - t.comfortable_temp) / 25;
  const sleepDiff = Math.abs(toMinutes(u.time_sleep) - toMinutes(t.time_sleep));
  const wakeDiff = Math.abs(toMinutes(u.time_wake) - toMinutes(t.time_wake));
  const sleepScore = 1 - Math.min(sleepDiff, 720) / 720;
  const wakeScore = 1 - Math.min(wakeDiff, 720) / 720;

  const uGenres = new Set<string>(u.music_genre ?? []);
  const tGenres = new Set<string>(t.music_genre ?? []);
  const genreUnion = new Set([...uGenres, ...tGenres]);
  const genreIntersect = [...uGenres].filter((g) => tGenres.has(g)).length;
  const genreScore = genreUnion.size === 0 ? 1 : genreIntersect / genreUnion.size;

  const uNames = new Set(uInterests);
  const tNames = new Set(tInterests);
  const interestUnion = new Set([...uNames, ...tNames]);
  const interestIntersect = [...uNames].filter((n) => tNames.has(n)).length;
  const interestScore = interestUnion.size === 0 ? 1 : interestIntersect / interestUnion.size;

  return Math.round(
    (noiseScore * 0.20 +
     cleanScore * 0.20 +
     tempScore  * 0.10 +
     sleepScore * 0.15 +
     wakeScore  * 0.10 +
     genreScore * 0.10 +
     interestScore * 0.15) * 100,
  );
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
  let scoresMap = new Map<string, number>();

  if (users.length > 0) {
    const userIds = users.map((u) => u.id);

    const [
      { data: allAcademics },
      { data: allInterests },
      likedResult,
      { data: allLivingStyles },
      myLivingResult,
      myInterestsResult,
    ] = await Promise.all([
      supabaseAdmin.from("academics").select("user_id, academic_year, major, gpa").in("user_id", userIds),
      supabaseAdmin.from("interests").select("user_id, name").in("user_id", userIds),
      currentUserId
        ? supabaseAdmin.from("likes").select("liked_id").eq("liker_id", currentUserId)
        : Promise.resolve({ data: [] as { liked_id: string }[] }),
      supabaseAdmin
        .from("living_styles")
        .select("user_id, noise_level, cleanliness, comfortable_temp, time_sleep, time_wake, music_genre")
        .in("user_id", userIds),
      currentUserId
        ? supabaseAdmin
            .from("living_styles")
            .select("user_id, noise_level, cleanliness, comfortable_temp, time_sleep, time_wake, music_genre")
            .eq("user_id", currentUserId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      currentUserId
        ? supabaseAdmin.from("interests").select("name").eq("user_id", currentUserId)
        : Promise.resolve({ data: [] as { name: string }[] }),
    ]);

    academicsMap = new Map((allAcademics ?? []).map((a) => [a.user_id, a as AcademicsRow]));

    for (const i of (allInterests ?? []) as InterestRow[]) {
      const list = interestsMap.get(i.user_id) ?? [];
      if (!list.includes(i.name)) list.push(i.name);
      interestsMap.set(i.user_id, list);
    }

    likedIds = new Set(
      ((likedResult as { data: { liked_id: string }[] | null }).data ?? []).map((r) => r.liked_id),
    );

    const myLiving = (myLivingResult as { data: LivingStyleRow | null }).data;
    const myInterests = ((myInterestsResult as { data: { name: string }[] | null }).data ?? []).map((i) => i.name);
    const livingStylesMap = new Map<string, LivingStyleRow>(
      ((allLivingStyles ?? []) as LivingStyleRow[]).map((row) => [row.user_id, row]),
    );

    if (myLiving) {
      for (const user of users) {
        const theirLiving = livingStylesMap.get(user.id);
        if (theirLiving) {
          const theirInterests = interestsMap.get(user.id) ?? [];
          scoresMap.set(user.id, computeScore(myLiving, theirLiving, myInterests, theirInterests));
        }
      }
    }
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
              const score = scoresMap.get(profile.id) ?? null;

              return (
                <div
                  key={profile.id}
                  className="relative rounded-[28px] border border-gray-200 bg-white p-6 
                  shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  {score !== null && (
                    <div
                      className={`absolute right-4 top-4 flex h-[72px] w-[72px] flex-col 
                        items-center justify-center rounded-full border-2 shadow-sm ${
                        score >= 75
                          ? "border-green-400 bg-green-50 text-green-700"
                          : score >= 50
                            ? "border-amber-400 bg-amber-50 text-amber-700"
                            : "border-red-400 bg-red-50 text-red-700"
                      }`}
                    >
                      <span className="text-xl font-bold leading-none">{score}%</span>
                      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest leading-none opacity-75">
                        match
                      </span>
                    </div>
                  )}

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

                  <div className="mt-6 flex gap-2">
                    <Link
                      href={`/user/${profile.id}`}
                      className="flex-1 rounded-2xl border border-gray-200 py-2 text-center text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      View Profile →
                    </Link>
                    <LikeButton likedId={profile.id} initiallyLiked={alreadyLiked} compact />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
