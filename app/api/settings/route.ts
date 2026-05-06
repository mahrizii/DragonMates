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
    
        return NextResponse.json({ success: true });
      } catch (error) {
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
    const { can_receive_notifications } = body;

    if (typeof can_receive_notifications !== "boolean") {
      return NextResponse.json({ error: "Invalid value." }, { status: 400 });
    }

    const { error } = await supabase
      .from("users")
      .update({ can_receive_notifications })
      .eq("id", authData.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}