import { NextResponse } from "next/server";
import { login } from "@/app/actions/auth";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await login(body);
    const token = createSessionToken(user.id);
    const response = NextResponse.json(user, { status: 200 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 400 },
    );
  }
}
