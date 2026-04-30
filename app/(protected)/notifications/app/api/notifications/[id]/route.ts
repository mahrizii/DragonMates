import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ message: "PATCH route connected" }, { status: 200 });
}