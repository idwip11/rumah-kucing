import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// Explicit OPTIONS handler so the admin panel's CORS preflight is always
// answered by a real route handler.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":
        process.env.ADMIN_PANEL_ORIGIN || "http://localhost:3001",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File gambar tidak ditemukan" },
        { status: 400 },
      );
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung (png/jpg/jpeg/webp/gif)" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 },
      );
    }

    const ext = file.name.includes(".")
      ? file.name.split(".").pop()!.toLowerCase()
      : "png";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "products");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), Buffer.from(bytes));

    // Served by the /api/products/image/[name] route (works in dev & prod).
    return NextResponse.json({ url: `/api/products/image/${filename}` });
  } catch (error) {
    console.error("[upload] failed:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar" },
      { status: 500 },
    );
  }
}
