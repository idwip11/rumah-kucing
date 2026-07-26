import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildProductTagOptions,
  normalizeProductTag,
} from "@/lib/product-tags";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? "20")),
    );
    const tag = searchParams.get("tag")?.trim() ?? "";
    const sort = searchParams.get("sort")?.trim() ?? "";

    const normalizedTag = normalizeProductTag(tag);

    const where: { isActive: boolean; category?: string } = { isActive: true };
    if (normalizedTag) {
      where.category = undefined; // clear category filter when tag is present
    }

    // Build the query based on filters
    let productsQuery = prisma.product.findMany({
      where: { isActive: true },
      include: { tags: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Apply tag filter
    if (normalizedTag) {
      productsQuery = prisma.product.findMany({
        where: {
          isActive: true,
          tags: { some: { tag: normalizedTag } },
        },
        include: { tags: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    }

    // Apply sort
    if (sort === "price-asc") {
      productsQuery = prisma.product.findMany({
        where: normalizedTag
          ? { isActive: true, tags: { some: { tag: normalizedTag } } }
          : { isActive: true },
        include: { tags: true },
        orderBy: { priceIdr: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    } else if (sort === "price-desc") {
      productsQuery = prisma.product.findMany({
        where: normalizedTag
          ? { isActive: true, tags: { some: { tag: normalizedTag } } }
          : { isActive: true },
        include: { tags: true },
        orderBy: { priceIdr: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    }

    // Get total count for pagination
    let countQuery = prisma.product.count({
      where: { isActive: true },
    });
    if (normalizedTag) {
      countQuery = prisma.product.count({
        where: { isActive: true, tags: { some: { tag: normalizedTag } } },
      });
    }

    // Get all tags for filter options
    const allTags = await prisma.productTag.findMany({
      where: { product: { isActive: true } },
      select: { tag: true },
      orderBy: { tag: "asc" },
    });

    const [products, total] = await Promise.all([productsQuery, countQuery]);

    const tags = buildProductTagOptions(allTags.map((t) => t.tag));

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
        tags: p.tags.map((t) => ({ id: t.id, tag: t.tag })),
      })),
      total,
      page,
      limit,
      tags,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 },
    );
  }
}
