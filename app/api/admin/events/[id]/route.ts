import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const existing = await prisma.event.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.type !== undefined) updateData.type = String(body.type).trim();
    if (body.eventDate !== undefined)
      updateData.eventDate = new Date(body.eventDate);
    if (body.location !== undefined)
      updateData.location = String(body.location).trim();
    if (body.description !== undefined)
      updateData.description = body.description
        ? String(body.description).trim()
        : null;
    if (body.sourceUrl !== undefined)
      updateData.sourceUrl = body.sourceUrl
        ? String(body.sourceUrl).trim()
        : null;
    if (body.isActive !== undefined)
      updateData.isActive = Boolean(body.isActive);

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(event);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memperbarui event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const existing = await prisma.event.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.event.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal menghapus event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
