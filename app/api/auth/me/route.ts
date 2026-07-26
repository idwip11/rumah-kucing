import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const headers = { "Cache-Control": "no-store" };
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200, headers });
  }
  return NextResponse.json({ user }, { status: 200, headers });
}
