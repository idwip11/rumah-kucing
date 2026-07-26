import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "public", "cats");

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { name: string } },
) {
  const name = path.basename(params.name);
  if (!name || name.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = name.split(".").pop()?.toLowerCase() || "";
  const type = TYPES[ext];
  if (!type) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await fs.readFile(path.join(DIR, name));
    return new NextResponse(Buffer.from(data), {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
