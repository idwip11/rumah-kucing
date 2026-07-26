import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Scale,
} from "lucide-react";
import {
  activitySummary,
  beginnerSummary,
  compareEaseScore,
  compareRecommendationReason,
  costSummary,
  groomingSummary,
  indoorSummary,
  obesitySummary,
  playtimeSummary,
  vocalSummary,
} from "@/lib/catpedia/compare";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bandingkan Ras Kucing | Catpedia Rumah Kucing",
  description:
    "Bandingkan karakter, perawatan, biaya, dan kecocokan gaya hidup beberapa ras kucing di Catpedia Rumah Kucing.",
};

type ComparePageProps = {
  searchParams?: {
    ids?: string;
  };
};

function parseCompareIds(value: string | undefined) {
  return Array.from(
    new Set(
      (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, 3);
}

function firstText(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

function formatScore(score: number | null | undefined) {
  return score == null ? null : `${score}/10`;
}

export default async function CompareBreedsPage({
  searchParams,
}: ComparePageProps) {
  const selectedIds = parseCompareIds(searchParams?.ids);

  const breeds =
    selectedIds.length > 0
      ? await prisma.catBreed.findMany({
          where: {
            isPublished: true,
            OR: [
              { id: { in: selectedIds } },
              { slug: { in: selectedIds } },
            ],
          },
          include: {
            characteristics: true,
            nutritionGuide: true,
            costEstimates: {
              orderBy: { updatedAt: "desc" },
              take: 1,
            },
          },
        })
      : [];

  const orderedBreeds = selectedIds
    .map((id) => breeds.find((breed) => breed.id === id || breed.slug === id))
    .filter((breed): breed is (typeof breeds)[number] => Boolean(breed));

  const recommended = [...orderedBreeds].sort(
    (a, b) => compareEaseScore(b) - compareEaseScore(a),
  )[0];
  const recommendationReasons = recommended
    ? compareRecommendationReason(recommended)
    : [];

  const rows = [
    {
      label: "Aktivitas",
      description: "Perkiraan energi harian dan kebutuhan stimulasi.",
      value: activitySummary,
      score: (breed: (typeof orderedBreeds)[number]) =>
        formatScore(breed.activityScore),
    },
    {
      label: "Perawatan bulu",
      description: "Kebutuhan grooming umum berdasarkan bulu dan skor care.",
      value: groomingSummary,
      score: (breed: (typeof orderedBreeds)[number]) =>
        formatScore(breed.groomingScore),
    },
    {
      label: "Cocok pemula",
      description: "Seberapa ramah ras ini untuk pemilik pertama.",
      value: beginnerSummary,
      score: (breed: (typeof orderedBreeds)[number]) =>
        formatScore(breed.beginnerFitScore),
    },
    {
      label: "Vokal",
      description: "Kecenderungan bersuara atau meminta perhatian.",
      value: vocalSummary,
      score: (breed: (typeof orderedBreeds)[number]) =>
        formatScore(breed.vocalScore),
    },
    {
      label: "Indoor fit",
      description: "Kecocokan umum untuk rumah indoor atau apartemen.",
      value: indoorSummary,
      score: () => null,
    },
    {
      label: "Estimasi biaya",
      description: "Kebutuhan bulanan atau estimasi biaya yang tersedia.",
      value: (breed: (typeof orderedBreeds)[number]) =>
        costSummary({
          ...breed,
          monthlyCareLabel:
            breed.costEstimates[0]?.monthlyCostLabel ?? breed.monthlyCareLabel,
        }),
      score: () => null,
    },
    {
      label: "Risiko obesitas",
      description: "Catatan nutrisi yang perlu dipantau, bukan diagnosis.",
      value: obesitySummary,
      score: () => null,
    },
    {
      label: "Waktu bermain",
      description: "Estimasi aktivitas harian awal yang bisa disesuaikan.",
      value: playtimeSummary,
      score: () => null,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-grow px-4 pb-24 pt-[96px] sm:px-6 md:px-[80px] md:pt-[120px]">
      <Link
        href="/breeds"
        className="mb-6 inline-flex items-center gap-2 text-[13px] font-bold text-primary hover:text-primary-container"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Catpedia
      </Link>

      <section className="mb-8 max-w-4xl">
        <p className="eyebrow mb-3">Catpedia Compare</p>
        <h1 className="font-headline text-[36px] font-extrabold leading-tight text-gradient-brand sm:text-[48px]">
          Bandingkan ras sebelum memutuskan
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-on-surface-variant sm:text-[17px]">
          Lihat perbedaan karakter, kebutuhan perawatan, biaya, dan gaya hidup
          beberapa ras kucing. Hasil ini adalah panduan umum; kepribadian setiap
          kucing tetap dipengaruhi lingkungan dan pengalaman hidupnya.
        </p>
      </section>

      {orderedBreeds.length < 2 ? (
        <section className="rounded-2xl border border-dashed border-border bg-white/75 px-6 py-12 text-center shadow-soft">
          <Scale
            className="mx-auto h-10 w-10 text-primary"
            aria-hidden="true"
          />
          <h2 className="mt-4 font-headline text-[24px] font-extrabold text-ink">
            Pilih minimal dua ras
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
            Compare akan lebih berguna jika kamu memilih 2 sampai 3 ras dari
            halaman Catpedia. Ras yang sudah dipilih akan muncul di tray bawah.
          </p>
          <Link
            href="/breeds#semua-profil-ras"
            className="btn-bounce mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-bold text-white shadow-[0_8px_20px_hsl(var(--primary)/0.18)] hover:bg-primary-container"
          >
            Pilih ras untuk dibandingkan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <>
          <section className="mb-8 grid gap-4 md:grid-cols-3">
            {orderedBreeds.map((breed) => (
              <Link
                key={breed.id}
                href={`/breeds/${breed.slug}`}
                className="group overflow-hidden rounded-2xl border border-border/75 bg-white shadow-soft transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] bg-muted">
                  {breed.imageSrc ? (
                    <Image
                      src={breed.imageSrc}
                      alt={`Foto ras ${breed.name}`}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[32px]">
                        pets
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-extrabold uppercase text-primary">
                    {breed.origin || "Asal belum dicatat"}
                  </p>
                  <h2 className="mt-1 font-headline text-[22px] font-extrabold text-ink">
                    {breed.name}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                    {firstText(
                      breed.shortDescription,
                      breed.profileSummary,
                      "Profil ras ini sedang dilengkapi.",
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </section>

          {recommended && (
            <section className="mb-8 rounded-2xl border border-primary/18 bg-primary/6 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12px] font-extrabold uppercase text-primary">
                    Ringkasan panduan
                  </p>
                  <h2 className="mt-1 font-headline text-[24px] font-extrabold text-ink">
                    {recommended.name} tampak paling mudah dipertimbangkan
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
                    Berdasarkan skor Catpedia umum seperti kecocokan pemula,
                    indoor fit, aktivitas, vokal, dan perawatan. Ini bukan
                    keputusan mutlak; gunakan sebagai titik awal sebelum melihat
                    individu kucingnya.
                  </p>
                  {recommendationReasons.length > 0 && (
                    <ul className="mt-4 grid gap-2 text-sm font-semibold text-ink sm:grid-cols-2">
                      {recommendationReasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-2xl border border-border/75 bg-white shadow-soft">
            <div className="border-b border-border/70 px-5 py-4">
              <h2 className="font-headline text-[24px] font-extrabold text-ink">
                Tabel Perbandingan
              </h2>
              <p className="mt-1 flex items-start gap-2 text-[13px] leading-relaxed text-on-surface-variant">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Skor dan label menggambarkan kecenderungan umum ras, bukan
                jaminan sifat setiap kucing.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/45">
                    <th className="w-[240px] px-5 py-4 text-[12px] font-extrabold uppercase text-on-surface-variant">
                      Aspek
                    </th>
                    {orderedBreeds.map((breed) => (
                      <th
                        key={breed.id}
                        className="px-5 py-4 text-[13px] font-extrabold text-ink"
                      >
                        {breed.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-b border-border/55">
                      <th className="align-top px-5 py-4">
                        <span className="block text-[14px] font-extrabold text-ink">
                          {row.label}
                        </span>
                        <span className="mt-1 block text-[12px] font-medium leading-relaxed text-on-surface-variant">
                          {row.description}
                        </span>
                      </th>
                      {orderedBreeds.map((breed) => (
                        <td
                          key={breed.id}
                          className="align-top px-5 py-4 text-[14px] font-semibold leading-relaxed text-on-surface"
                        >
                          {row.value(breed)}
                          {row.score(breed) && (
                            <span className="mt-1 block text-[12px] font-bold text-primary">
                              {row.score(breed)}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
