import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/session";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File foto kucing tidak ditemukan" },
        { status: 400 },
      );
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan PNG, JPG, WEBP, atau GIF." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran foto maksimal 5MB" },
        { status: 400 },
      );
    }

    const ext = file.name.includes(".")
      ? file.name.split(".").pop()!.toLowerCase()
      : "png";
    const filename = `${user.id}-${crypto.randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "cats");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), Buffer.from(bytes));

    return NextResponse.json({ url: `/api/cats/image/${filename}` });
  } catch (error) {
    console.error("[cat-photo-upload] failed:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah foto kucing" },
      { status: 500 },
    );
  }
}
