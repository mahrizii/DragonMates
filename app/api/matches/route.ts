import { supabaseAdmin } from "@/lib/supabase-admin"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(sessionToken)
    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Could not identify user from session." },
        { status: 401 },
      )
    }

    const currentUserId = authData.user.id

    const [{ data: iLiked, error: iLikedError }, { data: likedMe, error: likedMeError }] =
      await Promise.all([
        supabaseAdmin.from("likes").select("liked_id, created_at").eq("liker_id", currentUserId),
        supabaseAdmin.from("likes").select("liker_id, created_at").eq("liked_id", currentUserId),
      ])

    if (iLikedError) return NextResponse.json({ error: iLikedError.message }, { status: 500 })
    if (likedMeError) return NextResponse.json({ error: likedMeError.message }, { status: 500 })

    if (!iLiked || iLiked.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    const iLikedMap = new Map((iLiked ?? []).map((l) => [l.liked_id, l.created_at]))

    const mutualRaw = ((likedMe ?? []) as { liker_id: string; created_at: string }[])
      .filter((l) => iLikedMap.has(l.liker_id))
      .map((l) => {
        const myLikeTime = iLikedMap.get(l.liker_id)!
        const matchedAt =
          new Date(l.created_at) > new Date(myLikeTime) ? l.created_at : myLikeTime
        return { user_id: l.liker_id, matched_at: matchedAt }
      })
      .sort((a, b) => new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime())

    if (mutualRaw.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    const matchUserIds = mutualRaw.map((m) => m.user_id)
    const { data: matchUsers, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, first_name, last_name")
      .in("id", matchUserIds)

    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 })

    const userMap = new Map((matchUsers ?? []).map((u) => [u.id, u]))

    const matches = mutualRaw.map((m) => ({
      user_id: m.user_id,
      matched_at: m.matched_at,
      user: userMap.get(m.user_id) ?? null,
    }))

    return NextResponse.json({ matches })
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
