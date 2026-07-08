"use server";

/**
 * app/actions/products.ts
 * Server Actions for product listing and filtering.
 */

import { prisma } from "@/lib/prisma";

export async function getProducts(options?: {
  category?: string;
  tag?: string;
  sortBy?: "newest" | "cheapest" | "most_expensive";
  page?: number;
  limit?: number;
}) {
  const { category, tag, sortBy = "newest", page = 1, limit = 12 } = options ?? {};

  const orderBy =
    sortBy === "cheapest"
      ? { priceIdr: "asc" as const }
      : sortBy === "most_expensive"
      ? { priceIdr: "desc" as const }
      : { createdAt: "desc" as const };

  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      ...(tag ? { tags: { some: { tag } } } : {}),
    },
    include: { tags: true },
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });
}

export async function getProductCategories() {
  const products = await prisma.product.groupBy({
    by: ["category"],
    where: { isActive: true },
  });
  return products.map((p) => p.category).filter(Boolean) as string[];
}

export async function getAllProductTags() {
  const tags = await prisma.productTag.findMany({
    distinct: ["tag"],
    select: { tag: true },
  });
  return tags.map((t) => t.tag);
}
