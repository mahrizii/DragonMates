import { supabaseAdmin } from "@/lib/supabase-admin"
import { computeCompatibilityScore, LivingStyleForMatch } from "@/lib/match-score"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(sessionToken)
    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? "Could not identify user from session." },
        { status: 401 },
      )
    }

    const currentUserId = authData.user.id

    const limitParam = req.nextUrl.searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : null

    const [myLivingResult, myInterestsResult] = await Promise.all([
      supabaseAdmin
        .from("living_styles")
        .select("user_id, noise_level, cleanliness, comfortable_temp, time_sleep, time_wake, music_genre")
        .eq("user_id", currentUserId)
        .maybeSingle(),
      supabaseAdmin.from("interests").select("name").eq("user_id", currentUserId),
    ])

    if (myLivingResult.error) {
      return NextResponse.json({ error: myLivingResult.error.message }, { status: 500 })
    }

    if (!myLivingResult.data) {
      return NextResponse.json(
        { error: "Your profile is incomplete. Add a living-style profile to see suggested matches." },
        { status: 422 },
      )
    }

    const myLiving = myLivingResult.data as LivingStyleForMatch
    const myInterests = (myInterestsResult.data ?? []).map((i) => i.name)

    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, first_name, last_name, home_town, home_state")
      .neq("id", currentUserId)

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    const otherUsers = allUsers ?? []

    if (otherUsers.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    const otherUserIds = otherUsers.map((u) => u.id)

    const [allLivingResult, allInterestsResult] = await Promise.all([
      supabaseAdmin
        .from("living_styles")
        .select("user_id, noise_level, cleanliness, comfortable_temp, time_sleep, time_wake, music_genre")
        .in("user_id", otherUserIds),
      supabaseAdmin.from("interests").select("user_id, name").in("user_id", otherUserIds),
    ])

    if (allLivingResult.error) {
      return NextResponse.json({ error: allLivingResult.error.message }, { status: 500 })
    }
    if (allInterestsResult.error) {
      return NextResponse.json({ error: allInterestsResult.error.message }, { status: 500 })
    }

    const livingMap = new Map<string, LivingStyleForMatch>(
      ((allLivingResult.data ?? []) as LivingStyleForMatch[]).map((row) => [
        (row as LivingStyleForMatch & { user_id: string }).user_id,
        row,
      ]),
    )

    const interestsMap = new Map<string, string[]>()
    for (const row of allInterestsResult.data ?? []) {
      const list = interestsMap.get(row.user_id) ?? []
      if (!list.includes(row.name)) list.push(row.name)
      interestsMap.set(row.user_id, list)
    }

    const scored = otherUsers
      .flatMap((user) => {
        const theirLiving = livingMap.get(user.id)
        if (!theirLiving) return []
        const theirInterests = interestsMap.get(user.id) ?? []
        const match_score = computeCompatibilityScore(myLiving, theirLiving, myInterests, theirInterests)
        return [{ user_id: user.id, first_name: user.first_name, last_name: user.last_name, home_town: user.home_town, home_state: user.home_state, match_score, interests: theirInterests }]
      })
      .sort((a, b) => b.match_score - a.match_score)

    const matches = limit && limit > 0 ? scored.slice(0, limit) : scored

    return NextResponse.json({ matches })
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
