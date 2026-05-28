import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const MAX_SUGGESTIONS = 5;

type LivingRow = {
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

function computeScore(u: LivingRow, t: LivingRow, uInt: string[], tInt: string[]): number {
  const noiseScore  = 1 - Math.abs(u.noise_level - t.noise_level) / 4;
  const cleanScore  = 1 - Math.abs(u.cleanliness - t.cleanliness) / 4;
  const tempScore   = 1 - Math.abs(u.comfortable_temp - t.comfortable_temp) / 25;
  const sleepScore  = 1 - Math.min(Math.abs(toMinutes(u.time_sleep) - toMinutes(t.time_sleep)), 720) / 720;
  const wakeScore   = 1 - Math.min(Math.abs(toMinutes(u.time_wake)  - toMinutes(t.time_wake)),  720) / 720;

  const uG = new Set(u.music_genre ?? []);
  const tG = new Set(t.music_genre ?? []);
  const gUnion = new Set([...uG, ...tG]);
  const genreScore = gUnion.size === 0 ? 1 : [...uG].filter(g => tG.has(g)).length / gUnion.size;

  const uI = new Set(uInt);
  const tI = new Set(tInt);
  const iUnion = new Set([...uI, ...tI]);
  const intScore = iUnion.size === 0 ? 1 : [...uI].filter(n => tI.has(n)).length / iUnion.size;

  return Math.round(
    (noiseScore * 0.20 + cleanScore * 0.20 + tempScore * 0.10 +
     sleepScore * 0.15 + wakeScore  * 0.10 + genreScore * 0.10 + intScore * 0.15) * 100,
  );
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(sessionToken);
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authData.user.id;

    // Fetch exclusion lists and candidate users in parallel
    const [usersResult, likedResult, dismissedResult] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("id, first_name, last_name, home_town, home_state")
        .neq("id", currentUserId),
      supabaseAdmin.from("likes").select("liked_id").eq("liker_id", currentUserId),
      supabaseAdmin.from("dismissals").select("dismissed_id").eq("user_id", currentUserId),
    ]);

    const likedIds    = new Set((likedResult.data    ?? []).map((r) => r.liked_id));
    const dismissedIds = new Set((dismissedResult.data ?? []).map((r) => r.dismissed_id));

    const candidates = (usersResult.data ?? []).filter(
      (u) => !likedIds.has(u.id) && !dismissedIds.has(u.id),
    );

    if (candidates.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const ids = candidates.map((u) => u.id);

    const [academicsResult, interestsResult, livingResult, myLivingResult, myInterestsResult] =
      await Promise.all([
        supabaseAdmin.from("academics").select("user_id, academic_year, major").in("user_id", ids),
        supabaseAdmin.from("interests").select("user_id, name").in("user_id", ids),
        supabaseAdmin
          .from("living_styles")
          .select("user_id, noise_level, cleanliness, comfortable_temp, time_sleep, time_wake, music_genre")
          .in("user_id", ids),
        supabaseAdmin
          .from("living_styles")
          .select("user_id, noise_level, cleanliness, comfortable_temp, time_sleep, time_wake, music_genre")
          .eq("user_id", currentUserId)
          .maybeSingle(),
        supabaseAdmin.from("interests").select("name").eq("user_id", currentUserId),
      ]);

    const academicsMap = new Map((academicsResult.data ?? []).map((a) => [a.user_id, a]));
    const interestsMap = new Map<string, string[]>();
    for (const i of (interestsResult.data ?? []) as { user_id: string; name: string }[]) {
      const list = interestsMap.get(i.user_id) ?? [];
      list.push(i.name);
      interestsMap.set(i.user_id, list);
    }
    const livingMap = new Map<string, LivingRow>(
      ((livingResult.data ?? []) as LivingRow[]).map((r) => [r.user_id, r]),
    );

    const myLiving    = (myLivingResult.data as LivingRow | null);
    const myInterests = (myInterestsResult.data ?? []).map((i) => i.name);

    const scored = candidates.map((u) => {
      const acad = academicsMap.get(u.id);
      const interests = interestsMap.get(u.id) ?? [];
      const theirLiving = livingMap.get(u.id);
      const score = myLiving && theirLiving
        ? computeScore(myLiving, theirLiving, myInterests, interests)
        : null;
      return {
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        home_town: u.home_town,
        home_state: u.home_state,
        academic_year: acad?.academic_year ?? null,
        major: acad?.major ?? null,
        interests,
        score,
      };
    });

    // Sort by score desc (nulls last), then take top N
    scored.sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });

    return NextResponse.json({ suggestions: scored.slice(0, MAX_SUGGESTIONS) });
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
