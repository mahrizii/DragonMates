import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Missing notification ID." }, { status: 400 });
}
const { error, count } = await supabase
  .from("notifications")
  .update({ read: true }, { count: "exact" })
  .eq("id", id);

if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
}

if (count === 0) {
  return NextResponse.json({ error: "Notification not found." }, { status: 404 });
}


    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}