import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        cats: {
          select: {
            id: true,
            name: true,
            breed: { select: { name: true } },
            weightKg: true,
            gender: true,
            sterilized: true,
            estimatedDateOfBirth: true,
          },
          orderBy: { createdAt: "desc" },
        },
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            channel: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      cats: user.cats.map((c) => ({
        id: c.id,
        name: c.name,
        breed: c.breed?.name ?? null,
        weightKg: c.weightKg,
        gender: c.gender,
        sterilized: c.sterilized,
        estimatedDateOfBirth: c.estimatedDateOfBirth
          ? String(c.estimatedDateOfBirth).split("T")[0]
          : null,
      })),
      orders: user.orders.map((o) => ({
        id: o.id,
        status: o.status,
        total: Number(o.total),
        channel: o.channel,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}
