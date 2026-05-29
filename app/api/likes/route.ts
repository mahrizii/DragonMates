// Author: Patrick Melan, April 28 2026
// Modified: Patrick Melan 5/5/26

import { supabaseAdmin } from "@/lib/supabase-admin"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// POST /api/likes — like another user; returns the new like and whether it resulted in a match
export async function POST(request: Request) {
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

    const liker_id = authData.user.id

    const body = await request.json()
    const { liked_id } = body

    if (!liked_id) {
      return NextResponse.json({ error: "liked_id is required" }, { status: 400 })
    }

    // Prevent self-likes at the API level (not just the DB)
    if (liker_id === liked_id) {
      return NextResponse.json({ error: "Cannot like yourself" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("likes")
      .insert({ liker_id, liked_id })
      .select()
      .single()

    if (error) {
      // 23505 = unique constraint violation (duplicate like)
      if (error.code === "23505") {
        return NextResponse.json({ error: "Already liked this user" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check if the liked user has also liked back (mutual like = match)
    const { data: mutualLike } = await supabaseAdmin
      .from("likes")
      .select("id")
      .eq("liker_id", liked_id)
      .eq("liked_id", liker_id)
      .maybeSingle()

    // Fetch both users' names and notification preferences up front
    const [{ data: likerUser }, { data: likedUser }] = await Promise.all([
      supabaseAdmin.from("users").select("first_name, last_name, can_receive_notifications").eq("id", liker_id).single(),
      supabaseAdmin.from("users").select("first_name, last_name, can_receive_notifications").eq("id", liked_id).single(),
    ])

    const likerName = likerUser ? `${likerUser.first_name} ${likerUser.last_name}` : "someone"
    const likedName = likedUser ? `${likedUser.first_name} ${likedUser.last_name}` : "someone"

    // Notifications are non-critical — fire and don't block the response
    if (likedUser?.can_receive_notifications !== false) {
      supabaseAdmin.from("notifications").insert({
        user_id: liked_id,
        type: "like",
        title: "New anonymous like",
        body: "Someone liked your profile.",
        read: false,
      })
    }

    if (mutualLike) {
      // Notify both users of the match (respecting their preferences)
      if (likerUser?.can_receive_notifications !== false) {
        supabaseAdmin.from("notifications").insert({
          user_id: liker_id,
          type: "match",
          title: "It's a match!",
          body: `You and ${likedName} have matched.`,
          read: false,
        })
      }

      if (likedUser?.can_receive_notifications !== false) {
        supabaseAdmin.from("notifications").insert({
          user_id: liked_id,
          type: "match",
          title: "It's a match!",
          body: `You and ${likerName} have matched.`,
          read: false,
        })
      }
    }

    return NextResponse.json({ like: data, matched: !!mutualLike }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}

// DELETE /api/likes — unlike a user (scoped to the authenticated liker, so users can only remove their own likes)
export async function DELETE(request: Request) {
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

    const liker_id = authData.user.id

    const body = await request.json()
    const { liked_id } = body

    if (!liked_id) {
      return NextResponse.json({ error: "liked_id is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("likes")
      .delete()
      .eq("liker_id", liker_id)
      .eq("liked_id", liked_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
