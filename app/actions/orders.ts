"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export type OrderItemInput = {
  productId?: string | null;
  name: string;
  price: number; // IDR
  quantity: number;
};

export type CreateOrderResult = {
  ok: boolean;
  orderId?: string;
  error?: string;
};

export async function createOrder(
  items: OrderItemInput[],
): Promise<CreateOrderResult> {
  if (!items || items.length === 0) {
    return { ok: false, error: "Keranjang kosong" };
  }

  const user = await getCurrentUser();

  const orderItems = items.map((item) => {
    const price = new Prisma.Decimal(item.price);
    const quantity = Math.max(1, Math.floor(item.quantity));
    const subtotal = price.mul(quantity);
    return {
      productId: item.productId ?? null,
      name: item.name,
      price,
      quantity,
      subtotal,
    };
  });

  const total = orderItems.reduce(
    (sum, i) => sum.add(i.subtotal),
    new Prisma.Decimal(0),
  );

  try {
    const order = await prisma.order.create({
      data: {
        userId: user?.id ?? null,
        total,
        status: "Menunggu",
        channel: "WhatsApp",
        items: { create: orderItems },
      },
      select: { id: true },
    });

    return { ok: true, orderId: order.id };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { ok: false, error: "Gagal menyimpan pesanan" };
  }
}
