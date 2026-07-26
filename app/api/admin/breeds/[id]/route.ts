import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  breedAdminInclude,
  buildBreedScalarData,
  cleanString,
  normalizeSlug,
  serializeBreed,
  syncBreedRelations,
} from "../_utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const breed = await prisma.catBreed.findUnique({
      where: { id: params.id },
      include: breedAdminInclude,
    });

    if (!breed) {
      return NextResponse.json(
        { error: "Ras kucing tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(serializeBreed(breed));
  } catch (error) {
    console.error("Admin breed detail error:", error);
    return NextResponse.json(
      { error: "Failed to load breed" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const existing = await prisma.catBreed.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ras kucing tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const data: Record<string, unknown> = buildBreedScalarData(body);

    if (body.name !== undefined) {
      const name = cleanString(body.name);
      if (!name) {
        return NextResponse.json(
          { error: "Nama ras wajib diisi" },
          { status: 400 },
        );
      }
      data.name = name;
    }

    if (body.slug !== undefined) {
      const slug = normalizeSlug(body.slug);
      if (!slug) {
        return NextResponse.json(
          { error: "Slug ras wajib diisi" },
          { status: 400 },
        );
      }
      data.slug = slug;
    }

    await prisma.catBreed.update({
      where: { id: params.id },
      data,
    });
    await syncBreedRelations(params.id, body);

    const breed = await prisma.catBreed.findUniqueOrThrow({
      where: { id: params.id },
      include: breedAdminInclude,
    });

    return NextResponse.json(serializeBreed(breed));
  } catch (error) {
    console.error("Admin update breed error:", error);
    return NextResponse.json(
      { error: "Failed to update breed. Pastikan nama dan slug unik." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const existing = await prisma.catBreed.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ras kucing tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.catBreed.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete breed error:", error);
    return NextResponse.json(
      { error: "Failed to delete breed" },
      { status: 500 },
    );
  }
}
