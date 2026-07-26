import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);

  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/users/:path*",
    "/cats/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/breeds",
    "/breeds/:path*",
    "/articles/:path*",
    "/events/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
  ],
};
