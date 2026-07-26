import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  adminId: string;
  username: string;
  exp: number;
  nonce: string;
};

type AdminAuthRecord = {
  id: string;
  username: string;
  passwordHash: string;
  isActive: boolean;
};

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function parseCookies(header: string | null) {
  const cookies = new Map<string, string>();
  if (!header) return cookies;

  for (const part of header.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName || rawValue.length === 0) continue;
    cookies.set(rawName, decodeURIComponent(rawValue.join("=")));
  }

  return cookies;
}

function verifyToken(token: string): AdminSessionPayload | null {
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;

  const expected = sign(payloadPart);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as AdminSessionPayload;
    if (!payload.adminId || !payload.username || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createAdminSessionToken(admin: { id: string; username: string }) {
  const payload: AdminSessionPayload = {
    adminId: admin.id,
    username: admin.username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  return `${payloadPart}.${sign(payloadPart)}`;
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function mapAdminAuthRow(
  row:
    | {
        id: string | number;
        username: string;
        password_hash?: string | null;
        is_active: boolean;
      }
    | undefined,
): AdminAuthRecord | null {
  if (!row) return null;

  return {
    id: String(row.id),
    username: row.username,
    passwordHash: row.password_hash ?? "",
    isActive: row.is_active,
  };
}

export async function getAdminByUsername(username: string) {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string | number;
      username: string;
      password_hash: string | null;
      is_active: boolean;
    }>
  >`
    SELECT id::text AS id, username, password_hash, is_active
    FROM admin_users
    WHERE username = ${username}
    LIMIT 1
  `;

  return mapAdminAuthRow(rows[0]);
}

export async function getActiveAdminByIdentity(adminId: string, username: string) {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string | number;
      username: string;
      password_hash: string | null;
      is_active: boolean;
    }>
  >`
    SELECT id::text AS id, username, password_hash, is_active
    FROM admin_users
    WHERE id::text = ${adminId}
      AND username = ${username}
      AND is_active = true
    LIMIT 1
  `;

  return mapAdminAuthRow(rows[0]);
}

export async function updateAdminPasswordHash(adminId: string, passwordHash: string) {
  await prisma.$executeRaw`
    UPDATE admin_users
    SET password_hash = ${passwordHash}
    WHERE id::text = ${adminId}
  `;
}

export async function getAdminFromRequest(request: Request) {
  const token = parseCookies(request.headers.get("cookie")).get(ADMIN_SESSION_COOKIE);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return getActiveAdminByIdentity(payload.adminId, payload.username);
}

export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  try {
    const admin = await getAdminFromRequest(request);
    if (admin) return null;
  } catch (error) {
    console.error("Admin auth verification failed:", error);
    return NextResponse.json(
      { error: "Server admin auth tidak dapat diverifikasi" },
      { status: 500 },
    );
  }

  const response = NextResponse.json(
    { error: "Unauthorized: admin session tidak valid atau sudah kedaluwarsa" },
    { status: 401 },
  );
  clearAdminSessionCookie(response);
  return response;
}
