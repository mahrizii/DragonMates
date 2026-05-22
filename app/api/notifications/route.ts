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

export async function PATCH(_request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Missing session token." },
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

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ read: true })
      .eq("user_id", authData.user.id)
      .eq("read", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error while marking notifications as read." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, title, body: notificationBody } = body ?? {};

    if (!user_id || !title || !notificationBody) {
      return NextResponse.json(
        { error: "user_id, title, and body are required." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id,
        title,
        body: notificationBody,
        read: false,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notification: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error while creating notification." },
      { status: 500 },
    );
  }
}
