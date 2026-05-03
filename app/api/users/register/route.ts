// Mod by Patrick Melan, April 12 2026
// Mod: Patrick Melan, April 25 2026

import { hashPassword } from "@/lib/password";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, home_town, home_state, social_links } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    // 1. Create auth user via admin API so email is pre-confirmed and login works immediately
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { password_hash: passwordHash },
    });

    if (createError) return NextResponse.json({ error: createError.message }, { status: 400 });

    // 2. Insert profile into users table linked by auth user id
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: createData.user.id,
      email,
      first_name,
      last_name,
      home_town,
      home_state,
      social_links,
    });

    if (profileError) {
      // Roll back the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(createData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // 3. Sign in immediately to establish a session
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });

    if (signInData?.session) {
      const cookieStore = await cookies();
      cookieStore.set("session", signInData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({ user: createData.user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
