import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { normalizeProductTags } from "@/lib/product-tags";

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
    const category = searchParams.get("category")?.trim() ?? "";
    const isActiveRaw = searchParams.get("isActive")?.trim() ?? "";

    const where: { category?: string; isActive?: boolean } = {};
    if (category) where.category = category;
    if (isActiveRaw === "true") where.isActive = true;
    if (isActiveRaw === "false") where.isActive = false;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        priceIdr: Number(p.priceIdr),
        reason: p.reason,
        description: p.description,
        badge: p.badge,
        imageUrl: p.imageUrl,
        stock: p.stock,
        isActive: p.isActive,
        createdAt: p.createdAt,
        tags: p.tags.map((t) => t.tag),
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Admin products error:", error);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const priceRaw = body.priceIdr;
    const priceIdr =
      priceRaw === "" || priceRaw == null ? null : Number(priceRaw);

    if (!name) {
      return NextResponse.json(
        { error: "Nama produk wajib diisi" },
        { status: 400 },
      );
    }
    if (priceIdr == null || Number.isNaN(priceIdr)) {
      return NextResponse.json(
        { error: "Harga produk tidak valid" },
        { status: 400 },
      );
    }

    const category = body.category ? String(body.category).trim() : null;
    const reason = body.reason ? String(body.reason).trim() : null;
    const description = body.description
      ? String(body.description).trim()
      : null;
    const badge = body.badge ? String(body.badge).trim() : null;
    const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;
    const stockRaw = body.stock;
    const stock = stockRaw === "" || stockRaw == null ? null : Number(stockRaw);
    const isActive =
      body.isActive === undefined ? true : Boolean(body.isActive);
    const tags = Array.isArray(body.tags) ? normalizeProductTags(body.tags) : [];

    const product = await prisma.product.create({
      data: {
        name,
        category,
        priceIdr,
        reason,
        description,
        badge,
        imageUrl,
        stock,
        isActive,
        tags: { create: tags.map((tag: string) => ({ tag })) },
      },
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

    return NextResponse.json(
      {
        ...product,
        priceIdr: Number(product.priceIdr),
        tags: product.tags.map((t) => t.tag),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
