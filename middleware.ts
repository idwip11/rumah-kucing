import { NextRequest, NextResponse } from "next/server";

const adminOrigin = process.env.ADMIN_PANEL_ORIGIN || "http://localhost:3001";

function withAdminCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", adminOrigin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type",
  );
  return response;
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    if (request.method === "OPTIONS") {
      return withAdminCors(new NextResponse(null, { status: 204 }));
    }

    return withAdminCors(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/admin/:path*",
};
