import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionCookie, getAdminFromRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    const response = NextResponse.json({ admin: null }, { status: 401 });
    clearAdminSessionCookie(response);
    return response;
  }

  return NextResponse.json({
    admin: {
      id: admin.id,
      username: admin.username,
    },
  });
}
