import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { computeAgeLabel } from "@/lib/age";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const cat = await prisma.cat.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        ageLabel: true,
        estimatedDateOfBirth: true,
        weightKg: true,
        gender: true,
        sterilized: true,
        lifestyle: true,
        notes: true,
        createdAt: true,
        breed: { select: { name: true, origin: true } },
        user: { select: { id: true, name: true, email: true } },
        timelineEvents: {
          select: {
            id: true,
            title: true,
            eventDate: true,
            category: true,
            status: true,
            description: true,
          },
          orderBy: { eventDate: "desc" },
          take: 50,
        },
        achievements: {
          select: {
            id: true,
            title: true,
            description: true,
            achievedAt: true,
            rank: true,
          },
          orderBy: { achievedAt: "desc" },
          take: 50,
        },
        _count: { select: { chatMessages: true } },
      },
    });

    if (!cat) {
      return NextResponse.json({ error: "Cat not found" }, { status: 404 });
    }

    const computedAgeLabel = cat.estimatedDateOfBirth
      ? computeAgeLabel(cat.estimatedDateOfBirth)
      : (cat.ageLabel ?? null);

    return NextResponse.json({
      id: cat.id,
      name: cat.name,
      ageLabel: computedAgeLabel,
      estimatedDateOfBirth: cat.estimatedDateOfBirth
        ? cat.estimatedDateOfBirth.toISOString().split("T")[0]
        : null,
      weightKg: cat.weightKg,
      gender: cat.gender,
      sterilized: cat.sterilized,
      lifestyle: cat.lifestyle,
      notes: cat.notes,
      createdAt: cat.createdAt,
      breed: cat.breed?.name ?? null,
      breedOrigin: cat.breed?.origin ?? null,
      owner: cat.user
        ? { id: cat.user.id, name: cat.user.name, email: cat.user.email }
        : null,
      chatCount: cat._count.chatMessages,
      timelineEvents: cat.timelineEvents.map((e) => ({
        id: e.id,
        title: e.title,
        eventDate: e.eventDate,
        category: e.category,
        status: e.status,
        description: e.description,
      })),
      achievements: cat.achievements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        achievedAt: a.achievedAt,
        rank: a.rank,
      })),
    });
  } catch (error) {
    console.error("Admin cat detail error:", error);
    return NextResponse.json({ error: "Failed to load cat" }, { status: 500 });
  }
}
