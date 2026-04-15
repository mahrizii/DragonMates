// Author: Patrick Melan, April 15 2026
// Mod by Patrick Melan, April 15 2026
// Note: Supabase calls written by Patrick Melan. Matching algorithm written by Claude (April 15 2026)
//       — Claude's algorithm was used in place of our own as it provided a more accurate result.

import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");
  const target_id = searchParams.get("target_id");

  if (!user_id || !target_id)
    return NextResponse.json({ error: "user_id and target_id are required" }, { status: 400 });

  // Fetch both users' living styles and interests in parallel
  const [userLiving, targetLiving, userInterests, targetInterests] = await Promise.all([
    supabaseAdmin.from("living_styles").select("*").eq("user_id", user_id).single(),
    supabaseAdmin.from("living_styles").select("*").eq("user_id", target_id).single(),
    supabaseAdmin.from("interests").select("name").eq("user_id", user_id),
    supabaseAdmin.from("interests").select("name").eq("user_id", target_id),
  ]);

  if (userLiving.error || targetLiving.error)
    return NextResponse.json({ error: "Could not load profiles" }, { status: 404 });

  const u = userLiving.data;
  const t = targetLiving.data;

  // Noise level (1-5 scale, max diff = 4)
  const noiseScore = 1 - Math.abs(u.noise_level - t.noise_level) / 4;

  // Cleanliness (1-5 scale, max diff = 4)
  const cleanScore = 1 - Math.abs(u.cleanliness - t.cleanliness) / 4;

  // Temperature (60-85°F range, max diff = 25)
  const tempScore = 1 - Math.abs(u.comfortable_temp - t.comfortable_temp) / 25;

  // Sleep schedule — compare bedtime and wake time as minutes since midnight
  function toMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }
  const sleepDiff = Math.abs(toMinutes(u.time_sleep) - toMinutes(t.time_sleep));
  const wakeDiff = Math.abs(toMinutes(u.time_wake) - toMinutes(t.time_wake));
  const sleepScore = 1 - Math.min(sleepDiff, 720) / 720; // cap at 12h diff
  const wakeScore = 1 - Math.min(wakeDiff, 720) / 720;

  // Music genres — Jaccard similarity
  const uGenres = new Set<string>(u.music_genre ?? []);
  const tGenres = new Set<string>(t.music_genre ?? []);
  const genreUnion = new Set([...uGenres, ...tGenres]);
  const genreIntersect = [...uGenres].filter((g) => tGenres.has(g)).length;
  const genreScore = genreUnion.size === 0 ? 1 : genreIntersect / genreUnion.size;

  // Interests — Jaccard similarity
  const uNames = new Set((userInterests.data ?? []).map((i) => i.name));
  const tNames = new Set((targetInterests.data ?? []).map((i) => i.name));
  const interestUnion = new Set([...uNames, ...tNames]);
  const interestIntersect = [...uNames].filter((n) => tNames.has(n)).length;
  const interestScore = interestUnion.size === 0 ? 1 : interestIntersect / interestUnion.size;

  // Weighted final score
  const score =
    noiseScore * 0.20 +
    cleanScore * 0.20 +
    tempScore  * 0.10 +
    sleepScore * 0.15 +
    wakeScore  * 0.10 +
    genreScore * 0.10 +
    interestScore * 0.15;

  const percentage = Math.round(score * 100);

  return NextResponse.json({ percentage });
}
