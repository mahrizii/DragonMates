// Mod by Patrick Melan, April 12 2026

import { hashPassword } from "@/lib/password";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, first_name, last_name, home_town, home_state, social_links, avatar_url } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const passwordHash = hashPassword(password);

  // 1. Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        password_hash: passwordHash,
      },
    },
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  // 2. Insert profile into users table, linked by auth user id
  const { data: profileData, error: profileError } = await supabaseAdmin.from("users").insert({
    id: authData.user?.id,
    email,
    first_name,
    last_name,
    home_town,
    home_state,
    social_links,
    avatar_url,
  });

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

  return NextResponse.json({ user: authData.user, profile: profileData });
}
