// Author: Patrick Melan, April 28 2026

import { supabaseAdmin } from "@/lib/supabase-admin"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

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

    if (liker_id === liked_id) {
      return NextResponse.json({ error: "Cannot like yourself" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("likes")
      .insert({ liker_id, liked_id })
      .select()
      .single()

    if (error) {
      // unique_violation — like already exists
      if (error.code === "23505") {
        return NextResponse.json({ error: "Already liked this user" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ like: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
