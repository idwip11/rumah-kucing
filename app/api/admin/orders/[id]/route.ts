import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["Menunggu", "Dikonfirmasi", "Selesai", "Batal"];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        total: true,
        channel: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        items: {
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            subtotal: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: Number(order.total),
      channel: order.channel,
      createdAt: order.createdAt,
      customer: order.user
        ? { id: order.user.id, name: order.user.name, email: order.user.email }
        : null,
      items: order.items.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
      })),
    });
  } catch (error) {
    console.error("Admin order detail error:", error);
    return NextResponse.json(
      { error: "Failed to load order" },
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
    const body = await request.json();
    const { status } = body as { status?: string };

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
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
      where: { id: params.id },
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
