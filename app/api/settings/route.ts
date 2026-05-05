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