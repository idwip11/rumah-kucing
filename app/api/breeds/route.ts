import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const breeds = await prisma.catBreed.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true },
    });
    return NextResponse.json(breeds);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get breeds",
      },
      { status: 500 },
    );
  }
}
