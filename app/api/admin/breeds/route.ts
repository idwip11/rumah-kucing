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
} from "./_utils";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? "20")),
    );
    const search = searchParams.get("search")?.trim() ?? "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { origin: { contains: search, mode: "insensitive" as const } },
            {
              shortDescription: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              profileSummary: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            { careLevel: { contains: search, mode: "insensitive" as const } },
            { activityLevel: { contains: search, mode: "insensitive" as const } },
            { coatLength: { contains: search, mode: "insensitive" as const } },
            {
              characteristics: {
                some: {
                  label: { contains: search, mode: "insensitive" as const },
                },
              },
            },
          ],
        }
      : {};

    const [breeds, total] = await Promise.all([
      prisma.catBreed.findMany({
        where,
        include: breedAdminInclude,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.catBreed.count({ where }),
    ]);

    return NextResponse.json({
      breeds: breeds.map(serializeBreed),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Admin breeds error:", error);
    return NextResponse.json(
      { error: "Failed to load breeds" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const name = cleanString(body.name);
    const slug = normalizeSlug(body.slug || body.name);

    if (!name) {
      return NextResponse.json(
        { error: "Nama ras wajib diisi" },
        { status: 400 },
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug ras wajib diisi" },
        { status: 400 },
      );
    }

    const breed = await prisma.catBreed.create({
      data: {
        name,
        slug,
        ...buildBreedScalarData(body),
      },
      include: breedAdminInclude,
    });

    await syncBreedRelations(breed.id, body);

    const updated = await prisma.catBreed.findUniqueOrThrow({
      where: { id: breed.id },
      include: breedAdminInclude,
    });

    return NextResponse.json(serializeBreed(updated), { status: 201 });
  } catch (error) {
    console.error("Admin create breed error:", error);
    return NextResponse.json(
      { error: "Failed to create breed. Pastikan nama dan slug unik." },
      { status: 500 },
    );
  }
}
