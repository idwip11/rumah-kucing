import { prisma } from "@/lib/prisma";

export type ArticlePreview = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  readTime: string | null;
  summary: string | null;
  heroImage: string | null;
  updatedAt: Date;
};

export async function getLatestArticlePreviews(limit = 8) {
  return prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    take: Math.min(Math.max(limit, 1), 24),
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      readTime: true,
      summary: true,
      heroImage: true,
      updatedAt: true,
    },
  });
}
