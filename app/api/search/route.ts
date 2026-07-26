import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type SearchResult = {
  id: string;
  title: string;
  href: string;
  preview: string;
  meta?: string;
  imageUrl?: string | null;
};

type SearchGroup = {
  key: string;
  label: string;
  results: SearchResult[];
};

const LIMIT_PER_GROUP = 5;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function firstText(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ query, groups: [], total: 0 });
  }

  try {
    const user = await getCurrentUser();

    const [
      articles,
      products,
      events,
      breeds,
      cats,
      timelineEvents,
      achievements,
    ] = await Promise.all([
      prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { vetWarning: { contains: query, mode: "insensitive" } },
            {
              sections: {
                some: {
                  OR: [
                    { heading: { contains: query, mode: "insensitive" } },
                    { body: { contains: query, mode: "insensitive" } },
                  ],
                },
              },
            },
            {
              takeaways: {
                some: { point: { contains: query, mode: "insensitive" } },
              },
            },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: LIMIT_PER_GROUP,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          category: true,
          readTime: true,
          heroImage: true,
          updatedAt: true,
        },
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { reason: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { badge: { contains: query, mode: "insensitive" } },
            { tags: { some: { tag: { contains: query, mode: "insensitive" } } } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: LIMIT_PER_GROUP,
        select: {
          id: true,
          name: true,
          category: true,
          reason: true,
          description: true,
          imageUrl: true,
          priceIdr: true,
        },
      }),
      prisma.event.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { type: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { eventDate: "desc" },
        take: LIMIT_PER_GROUP,
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
          description: true,
          eventDate: true,
        },
      }),
      prisma.catBreed.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { origin: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
            { profileSummary: { contains: query, mode: "insensitive" } },
            { foodType: { contains: query, mode: "insensitive" } },
            { matchLabel: { contains: query, mode: "insensitive" } },
            { careLevel: { contains: query, mode: "insensitive" } },
            { activityLevel: { contains: query, mode: "insensitive" } },
            { coatLength: { contains: query, mode: "insensitive" } },
            { indoorFit: { contains: query, mode: "insensitive" } },
            {
              characteristics: {
                some: { label: { contains: query, mode: "insensitive" } },
              },
            },
          ],
        },
        orderBy: { name: "asc" },
        take: LIMIT_PER_GROUP,
        select: {
          id: true,
          slug: true,
          name: true,
          origin: true,
          shortDescription: true,
          profileSummary: true,
          imageSrc: true,
        },
      }),
      user
        ? prisma.cat.findMany({
            where: {
              userId: user.id,
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { ageLabel: { contains: query, mode: "insensitive" } },
                { gender: { contains: query, mode: "insensitive" } },
                { lifestyle: { contains: query, mode: "insensitive" } },
                { notes: { contains: query, mode: "insensitive" } },
                {
                  breed: {
                    name: { contains: query, mode: "insensitive" },
                  },
                },
              ],
            },
            orderBy: { updatedAt: "desc" },
            take: LIMIT_PER_GROUP,
            select: {
              id: true,
              name: true,
              ageLabel: true,
              lifestyle: true,
              notes: true,
              photoUrl: true,
              breed: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
      user
        ? prisma.timelineEvent.findMany({
            where: {
              cat: { userId: user.id },
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            },
            orderBy: { eventDate: "desc" },
            take: LIMIT_PER_GROUP,
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              status: true,
              eventDate: true,
              cat: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
      user
        ? prisma.achievement.findMany({
            where: {
              cat: { userId: user.id },
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            },
            orderBy: { achievedAt: "desc" },
            take: LIMIT_PER_GROUP,
            select: {
              id: true,
              title: true,
              description: true,
              achievedAt: true,
              cat: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
    ]);

    const groups: SearchGroup[] = [
      {
        key: "articles",
        label: "Artikel & Edukasi",
        results: articles.map((article) => ({
          id: article.id,
          title: article.title,
          href: `/explore/${article.slug}`,
          preview: article.summary ?? "Buka artikel edukasi ini.",
          meta: firstText(article.category, article.readTime, formatDate(article.updatedAt)),
          imageUrl: article.heroImage,
        })),
      },
      {
        key: "products",
        label: "Produk",
        results: products.map((product) => ({
          id: product.id,
          title: product.name,
          href: `/explore/products/${product.id}`,
          preview: firstText(product.reason, product.description, "Lihat detail produk."),
          meta: firstText(product.category, `Rp${Number(product.priceIdr).toLocaleString("id-ID")}`),
          imageUrl: product.imageUrl,
        })),
      },
      {
        key: "events",
        label: "Event Kucing",
        results: events.map((event) => ({
          id: event.id,
          title: event.title,
          href: "/explore",
          preview: firstText(event.description, event.location),
          meta: `${event.type} · ${formatDate(event.eventDate)}`,
        })),
      },
      {
        key: "breeds",
        label: "Ras Kucing",
        results: breeds.map((breed) => ({
          id: breed.id,
          title: breed.name,
          href: `/breeds/${breed.slug}`,
          preview: firstText(
            breed.shortDescription,
            breed.profileSummary,
            breed.origin,
            "Lihat profil ras kucing.",
          ),
          meta: breed.origin ?? undefined,
          imageUrl: breed.imageSrc,
        })),
      },
      {
        key: "cats",
        label: "Profil Kucing",
        results: cats.map((cat) => ({
          id: cat.id,
          title: cat.name,
          href: "/",
          preview: firstText(cat.notes, cat.lifestyle, "Buka profil kucing."),
          meta: firstText(cat.breed?.name, cat.ageLabel),
          imageUrl: cat.photoUrl,
        })),
      },
      {
        key: "timeline",
        label: "Timeline & Jadwal",
        results: timelineEvents.map((event) => ({
          id: event.id,
          title: event.title,
          href: "/timeline",
          preview: firstText(event.description, `Catatan untuk ${event.cat.name}`),
          meta: `${String(event.category).replaceAll("_", " ")} · ${formatDate(event.eventDate)}`,
        })),
      },
      {
        key: "achievements",
        label: "Prestasi",
        results: achievements.map((achievement) => ({
          id: achievement.id,
          title: achievement.title,
          href: "/achievements",
          preview: firstText(achievement.description, `Prestasi ${achievement.cat.name}`),
          meta: `${achievement.cat.name} · ${formatDate(achievement.achievedAt)}`,
        })),
      },
    ].filter((group) => group.results.length > 0);

    const total = groups.reduce((sum, group) => sum + group.results.length, 0);

    return NextResponse.json({ query, groups, total });
  } catch (error) {
    console.error("Global search failed:", error);
    return NextResponse.json(
      { error: "Gagal menjalankan pencarian" },
      { status: 500 },
    );
  }
}
