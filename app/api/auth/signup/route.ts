import { NextResponse } from "next/server";
import { signup } from "@/app/actions/auth";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await signup(body);
    const token = createSessionToken(user.id);
    const response = NextResponse.json(user, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed" },
      { status: 400 },
    );
  }
}
