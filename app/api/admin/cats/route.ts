import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { computeAgeLabel } from "@/lib/age";

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
    const breedId = searchParams.get("breedId")?.trim() ?? "";

    const where = breedId ? { breedId } : {};

    const [cats, total] = await Promise.all([
      prisma.cat.findMany({
        where,
        select: {
          id: true,
          name: true,
          weightKg: true,
          gender: true,
          sterilized: true,
          estimatedDateOfBirth: true,
          ageLabel: true,
          breed: { select: { name: true } },
          user: { select: { name: true, email: true } },
          _count: { select: { timelineEvents: true, achievements: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cat.count({ where }),
    ]);

    return NextResponse.json({
      cats: cats.map((c) => ({
        id: c.id,
        name: c.name,
        weightKg: c.weightKg,
        gender: c.gender,
        sterilized: c.sterilized,
        ageLabel: c.estimatedDateOfBirth
          ? computeAgeLabel(c.estimatedDateOfBirth)
          : (c.ageLabel ?? ""),
        estimatedDateOfBirth: c.estimatedDateOfBirth
          ? c.estimatedDateOfBirth instanceof Date
            ? c.estimatedDateOfBirth.toISOString().split("T")[0]
            : c.estimatedDateOfBirth
          : null,
        breed: c.breed?.name ?? null,
        owner: c.user?.name ?? null,
        ownerEmail: c.user?.email ?? null,
        timelineCount: c._count.timelineEvents,
        achievementCount: c._count.achievements,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Admin cats error:", error);
    return NextResponse.json({ error: "Failed to load cats" }, { status: 500 });
  }
}
