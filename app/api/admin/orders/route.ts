import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["Menunggu", "Dikonfirmasi", "Selesai", "Batal"];

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
    const status = searchParams.get("status")?.trim() ?? "";
    const dateFrom = searchParams.get("dateFrom")?.trim() ?? "";
    const dateTo = searchParams.get("dateTo")?.trim() ?? "";

    const where: {
      status?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          status: true,
          total: true,
          channel: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        total: Number(o.total),
        channel: o.channel,
        createdAt: o.createdAt,
        customer: o.user?.name ?? "Guest",
        customerEmail: o.user?.email ?? null,
        itemCount: o._count.items,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status } = body as { id?: string; status?: string };

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 },
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
