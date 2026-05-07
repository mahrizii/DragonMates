import { supabaseAdmin } from "@/lib/supabase-admin"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", authData.user.id)
      .select("*")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 })
    }

    return NextResponse.json({ notification: data }, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error while updating notification." },
      { status: 500 },
    )
  }
}
