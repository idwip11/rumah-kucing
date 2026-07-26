import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { BreedMatchQuiz } from "@/components/breed-match-quiz";
import type { BreedQuizInput } from "@/lib/catpedia/quiz";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quiz Kecocokan Ras Kucing | Catpedia Rumah Kucing",
  description:
    "Jawab beberapa pertanyaan sederhana untuk menemukan ras kucing yang mungkin cocok dengan rumah, rutinitas, dan preferensi perawatanmu.",
};

export default async function BreedQuizPage() {
  const breeds = await prisma.catBreed.findMany({
    where: { isPublished: true },
    include: {
      characteristics: true,
      nutritionGuide: {
        select: {
          obesityRisk: true,
        },
      },
      costEstimates: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          monthlyCostLabel: true,
        },
      },
      suitabilities: {
        orderBy: { sortOrder: "asc" },
        select: {
          type: true,
          label: true,
          description: true,
        },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });

  const serialized: BreedQuizInput[] = breeds.map((breed) => ({
    id: breed.id,
    slug: breed.slug,
    name: breed.name,
    origin: breed.origin,
    imageSrc: breed.imageSrc,
    shortDescription: breed.shortDescription,
    profileSummary: breed.profileSummary,
    careLevel: breed.careLevel,
    activityLevel: breed.activityLevel,
    indoorFit: breed.indoorFit,
    coatLength: breed.coatLength,
    monthlyCareLabel: breed.monthlyCareLabel,
    matchLabel: breed.matchLabel,
    beginnerFitScore: breed.beginnerFitScore,
    activityScore: breed.activityScore,
    groomingScore: breed.groomingScore,
    vocalScore: breed.vocalScore,
    childFriendlyScore: breed.childFriendlyScore,
    petFriendlyScore: breed.petFriendlyScore,
    characteristics: breed.characteristics.map((item) => item.label),
    suitabilities: breed.suitabilities,
    nutritionGuide: breed.nutritionGuide,
    costEstimates: breed.costEstimates,
  }));

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-grow px-4 pb-24 pt-[96px] sm:px-6 md:px-[80px] md:pt-[120px]">
      <Link
        href="/breeds"
        className="mb-6 inline-flex items-center gap-2 text-[13px] font-bold text-primary hover:text-primary-container"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Catpedia
      </Link>

      <section className="mb-8 max-w-5xl">
        <p className="eyebrow mb-3">Breed Match Quiz</p>
        <h1 className="font-headline text-[36px] font-extrabold leading-tight text-gradient-brand sm:text-[48px]">
          Belum tahu ras apa yang cocok?
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-on-surface-variant sm:text-[17px]">
          Jawab beberapa pertanyaan tentang rumah, rutinitas, grooming, budget,
          dan pengalaman merawat kucing. Catpedia akan menyarankan tiga ras yang
          mungkin paling selaras dengan preferensimu.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-[13px] font-semibold text-on-surface-variant">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            Termasuk ras domestik dan campuran
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-info" aria-hidden="true" />
            Skor adalah panduan preferensi
          </span>
        </div>
      </section>

      <BreedMatchQuiz breeds={serialized} />
    </main>
  );
}
