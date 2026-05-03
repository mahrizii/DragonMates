import { cookies } from "next/headers"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase-admin"

function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

export default async function MatchesPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#07294d]">DragonMates</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Matches</h1>
          <p className="mt-6 text-sm text-gray-500">Please log in to view your matches.</p>
        </div>
      </div>
    )
  }

  const { data: authData } = await supabaseAdmin.auth.getUser(sessionToken)
  const currentUserId = authData.user?.id

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#07294d]">DragonMates</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Matches</h1>
          <p className="mt-6 text-sm text-gray-500">Session expired. Please log in again.</p>
        </div>
      </div>
    )
  }

  const [{ data: iLiked }, { data: likedMe }] = await Promise.all([
    supabaseAdmin.from("likes").select("liked_id, created_at").eq("liker_id", currentUserId),
    supabaseAdmin.from("likes").select("liker_id, created_at").eq("liked_id", currentUserId),
  ])

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

  type MatchUser = { id: string; first_name: string; last_name: string; avatar_url: string | null }
  let matchUsers: MatchUser[] = []

  if (mutualRaw.length > 0) {
    const { data } = await supabaseAdmin
      .from("users")
      .select("id, first_name, last_name")
      .in("id", mutualRaw.map((m) => m.user_id))
    matchUsers = (data as MatchUser[]) ?? []
  }

  const userMap = new Map(matchUsers.map((u) => [u.id, u]))
  const matches = mutualRaw.map((m) => ({ ...m, user: userMap.get(m.user_id) ?? null }))

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#07294d]">
          DragonMates
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Matches</h1>
        <p className="mt-2 text-gray-600">
          Students who liked you back. Newest matches appear first.
        </p>

        {matches.length === 0 ? (
          <p className="mt-8 text-sm text-gray-500">
            No matches yet. Keep exploring profiles — when someone likes you back, they will appear here.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {matches.map((match) => {
              const user = match.user
              const displayName = user
                ? `${user.first_name} ${user.last_name}`
                : "Unknown User"
              const avatarInitials = user
                ? initials(user.first_name ?? "", user.last_name ?? "")
                : "?"

              return (
                <li
                  key={match.user_id}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffc600]">
                    <span className="text-sm font-bold text-[#07294d]">{avatarInitials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{displayName}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Matched {new Date(match.matched_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/user/${match.user_id}`}
                    className="shrink-0 rounded-lg bg-[#07294d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0a3a6e]"
                  >
                    View Profile
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
