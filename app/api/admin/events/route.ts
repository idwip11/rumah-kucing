import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)),
  );
  const status = searchParams.get("status") ?? ""; // "active" | "inactive" | ""

  const where: Record<string, unknown> = {};
  if (status === "active") where.isActive = true;
  else if (status === "inactive") where.isActive = false;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { eventDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({ events, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      title,
      type,
      eventDate,
      location,
      description,
      sourceUrl,
      isActive,
    } = body;

    if (!title || !type || !eventDate || !location) {
      return NextResponse.json(
        { error: "Field title, type, eventDate, dan location wajib diisi" },
        { status: 400 },
      );
    }

    const event = await prisma.event.create({
      data: {
        title: String(title).trim(),
        type: String(type).trim(),
        eventDate: new Date(eventDate),
        location: String(location).trim(),
        description: description ? String(description).trim() : null,
        sourceUrl: sourceUrl ? String(sourceUrl).trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
