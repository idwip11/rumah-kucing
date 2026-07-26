import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { normalizeProductTags } from "@/lib/product-tags";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.category !== undefined)
      data.category = body.category ? String(body.category).trim() : null;
    if (body.priceIdr !== undefined) {
      const v = Number(body.priceIdr);
      if (Number.isNaN(v)) {
        return NextResponse.json(
          { error: "Harga tidak valid" },
          { status: 400 },
        );
      }
      data.priceIdr = v;
    }
    if (body.reason !== undefined)
      data.reason = body.reason ? String(body.reason).trim() : null;
    if (body.description !== undefined)
      data.description = body.description
        ? String(body.description).trim()
        : null;
    if (body.badge !== undefined)
      data.badge = body.badge ? String(body.badge).trim() : null;
    if (body.imageUrl !== undefined)
      data.imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;
    if (body.stock !== undefined)
      data.stock =
        body.stock === "" || body.stock == null ? null : Number(body.stock);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updateData: Record<string, unknown> = { ...data };
    if (body.tags !== undefined && Array.isArray(body.tags)) {
      const tags = normalizeProductTags(body.tags);
      updateData.tags = {
        deleteMany: {},
        create: tags.map((tag: string) => ({ tag })),
      };
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        category: true,
        priceIdr: true,
        reason: true,
        description: true,
        badge: true,
        imageUrl: true,
        stock: true,
        isActive: true,
        createdAt: true,
        tags: { select: { tag: true } },
      },
    });

    return NextResponse.json({
      ...product,
      priceIdr: Number(product.priceIdr),
      tags: product.tags.map((t) => t.tag),
    });
  } catch (error) {
    console.error("Admin update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
