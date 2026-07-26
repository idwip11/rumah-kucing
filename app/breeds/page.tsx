import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Database, ShieldCheck } from "lucide-react";
import {
  BreedsExplorer,
  type BreedForCard,
} from "@/components/breeds-explorer";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import type { BreedFavoriteListType } from "@/lib/catpedia/favorites";

export const metadata: Metadata = {
  title: "Catpedia: Panduan Ras Kucing | Rumah Kucing",
  description:
    "Jelajahi karakter, kebutuhan perawatan, kesehatan, dan gaya hidup berbagai ras kucing di Catpedia Rumah Kucing.",
};

export default async function BreedsPage() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const user = await getCurrentUser();

  const [breeds, weeklyViews, favorites] = await Promise.all([
    prisma.catBreed.findMany({
      where: { isPublished: true },
      include: { characteristics: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
    prisma.breedView.groupBy({
      by: ["breedId"],
      where: { createdAt: { gte: oneWeekAgo } },
      _count: { _all: true },
    }),
    user
      ? prisma.breedFavorite.findMany({
          where: {
            userId: user.id,
            breed: { isPublished: true },
          },
          select: { breedId: true, listType: true },
        })
      : Promise.resolve([]),
  ]);

  const weeklyViewCount = new Map(
    weeklyViews.map((item) => [item.breedId, item._count._all]),
  );

  const serialized: BreedForCard[] = breeds.map((breed) => ({
    id: breed.id,
    slug: breed.slug,
    name: breed.name,
    origin: breed.origin,
    imageSrc: breed.imageSrc,
    shortDescription: breed.shortDescription ?? breed.profileSummary,
    characteristics: breed.characteristics.map(
      (characteristic) => characteristic.label,
    ),
    careLevel: breed.careLevel,
    activityLevel: breed.activityLevel,
    coatLength: breed.coatLength,
    indoorFit: breed.indoorFit,
    beginnerFitScore: breed.beginnerFitScore,
    activityScore: breed.activityScore,
    groomingScore: breed.groomingScore,
    availability: breed.availability,
    matchLabel: breed.matchLabel,
    viewCount: breed.viewCount,
    weeklyViewCount: weeklyViewCount.get(breed.id) ?? 0,
    isFeatured: breed.isFeatured,
  }));
  const initialFavorites = favorites.reduce<
    Record<string, BreedFavoriteListType[]>
  >((result, favorite) => {
    result[favorite.breedId] = [
      ...(result[favorite.breedId] ?? []),
      favorite.listType,
    ];
    return result;
  }, {});

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-grow px-4 pb-24 pt-[96px] sm:px-6 md:px-[80px] md:pt-[120px]">
      <section className="mb-8 max-w-5xl md:mb-10">
        <p className="eyebrow mb-3">Catpedia by Rumah Kucing</p>
        <h1 className="mb-5 max-w-4xl font-headline text-[36px] font-extrabold leading-[1.08] text-gradient-brand sm:text-[44px] md:text-[52px]">
          Temukan ras kucing yang paling cocok untukmu
        </h1>
        <p className="max-w-3xl text-[15px] leading-relaxed text-on-surface-variant sm:text-[17px]">
          Jelajahi karakter, kebutuhan perawatan, kesehatan, dan gaya hidup
          berbagai ras kucing sebelum memutuskan untuk merawatnya.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/breeds/quiz"
            className="btn-bounce inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-bold text-white shadow-[0_8px_20px_hsl(var(--primary)/0.18)] hover:bg-primary-container"
          >
            Mulai quiz kecocokan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/breeds/compare"
            className="btn-bounce inline-flex h-11 items-center gap-2 rounded-xl border border-primary/25 bg-white px-5 text-[14px] font-bold text-primary hover:bg-primary/5"
          >
            Bandingkan ras
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[13px] font-semibold text-on-surface-variant">
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" aria-hidden="true" />
            {serialized.length} profil ras
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-secondary" aria-hidden="true" />
            Pengetahuan sebelum keputusan
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-info" aria-hidden="true" />
            Panduan edukatif
          </span>
        </div>
      </section>

      <BreedsExplorer
        breeds={serialized}
        isAuthenticated={Boolean(user)}
        initialFavorites={initialFavorites}
      />
    </main>
  );
}
