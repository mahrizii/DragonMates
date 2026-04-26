import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    let userId = searchParams.get("user_id");

    if (!userId) {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get("session")?.value;

      if (!sessionToken) {
        return NextResponse.json(
          { error: "Missing session token or user_id." },
          { status: 401 },
        );
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(sessionToken);
      if (authError || !authData.user) {
        return NextResponse.json(
          { error: authError?.message || "Could not identify user from session." },
          { status: 401 },
        );
      }

      userId = authData.user.id;
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error while loading notifications." },
      { status: 500 },
    );
  }
}
