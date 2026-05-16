import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(session);

        if (authError || !authData.user) {
          return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }
    
        const { data: userData, error: userError } = await supabase
             .from("users")
             .select("first_name, last_name, can_receive_notifications")             .eq("id", authData.user.id)
             .single();

if (userError) {
  console.log("userError:", userError.message);
  return NextResponse.json({ error: userError.message }, { status: 500 });
}

console.log("authError:", authError, "user:", authData?.user?.id);
return NextResponse.json({
  email: authData.user.email,
  first_name: userData.first_name,
  last_name: userData.last_name,
  can_receive_notifications: userData.can_receive_notifications,
});      } catch (error) {
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
      }
    }
    export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(session);

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { first_name, last_name, email, can_receive_notifications } = body;

    if (email && email !== authData.user.email) {
  const { createClient } = await import("@supabase/supabase-js");
  const userSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${session}` } } }
  );
  const { error: emailError } = await userSupabase.auth.updateUser({ email });
  if (emailError) return NextResponse.json({ error: emailError.message }, { status: 500 });
}

    const updates: Record<string, unknown> = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (typeof can_receive_notifications === "boolean")
      updates.can_receive_notifications = can_receive_notifications;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("users").update(updates).eq("id", authData.user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(session);

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", authData.user.id);

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    if (authDeleteError)
      return NextResponse.json({ error: authDeleteError.message }, { status: 500 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}