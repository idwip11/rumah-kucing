import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createAdminSessionToken,
  getAdminByUsername,
  setAdminSessionCookie,
  updateAdminPasswordHash,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function looksLikeBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };

    const username = body.username?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 },
      );
    }

    const admin = await getAdminByUsername(username);

    if (!admin) {
      return NextResponse.json(
        { error: "Username atau password tidak valid" },
        { status: 401 },
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: "Akun admin tidak aktif" },
        { status: 403 },
      );
    }

    let passwordMatches = false;

    if (looksLikeBcryptHash(admin.passwordHash)) {
      passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    } else {
      // Backward-compatible path for manually inserted legacy rows.
      // If the stored value matches the submitted password exactly, upgrade it
      // to a bcrypt hash immediately so the database no longer stores plain text.
      passwordMatches = password === admin.passwordHash;

      if (passwordMatches) {
        const nextHash = await bcrypt.hash(password, 12);
        await updateAdminPasswordHash(admin.id, nextHash);
      } else {
        console.warn(
          `Admin login rejected: username="${admin.username}" has a non-bcrypt password_hash in the database.`,
        );
      }
    }

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Username atau password tidak valid" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
    setAdminSessionCookie(response, createAdminSessionToken(admin));
    return response;
  } catch (error) {
    console.error("Admin login failed:", error);
    const message =
      error instanceof Error ? error.message : "Unknown admin login error";
    return NextResponse.json(
      { error: `Gagal login admin: ${message}` },
      { status: 500 },
    );
  }
}
