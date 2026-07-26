import crypto from "crypto";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "rumah_kucing_session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for session signing");
  }
  return secret;
}

function base64urlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64urlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function createSessionToken(userId: string) {
  const payload = { userId, exp: Date.now() + COOKIE_MAX_AGE_SEC * 1000 };
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return null;
  }

  if (
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(encodedPayload)) as {
      userId: string;
      exp: number;
    };

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

export function getSessionCookieValue() {
  const cookieStore = cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser() {
  const token = getSessionCookieValue();
  if (!token) {
    return null;
  }

  const userId = verifySessionToken(token);
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true },
  });
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
    sameSite: "lax",
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
}
