import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  Info,
  MapPin,
  Scale,
  Scissors,
  Share2,
  ShieldAlert,
  Sparkles,
  Store,
  Utensils,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { BreedListPicker } from "@/components/breed-list-picker";

export const dynamic = "force-dynamic";

type BreedDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function firstText(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

function asStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "Belum dicatat";
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function scoreLabel(score: number | null | undefined) {
  if (score == null) return "Belum dinilai";
  if (score >= 8) return "Tinggi";
  if (score >= 5) return "Sedang";
  return "Rendah";
}

function scoreValue(score: number | null | undefined) {
  if (score == null) return 0;
  return Math.max(1, Math.min(10, score));
}

function availabilityIsCommercial(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return ["available", "ready list", "adopt & buy", "pre-order"].some((term) =>
    normalized.includes(term),
  );
}

function textIncludes(values: Array<string | null | undefined>, term: string) {
  return values.join(" ").toLowerCase().includes(term);
}

function fallbackCareNotes(breed: {
  name: string;
  careLevel: string | null;
  coatLength: string | null;
  groomingScore: number | null;
  characteristics: { label: string }[];
}) {
  const text = [
    breed.careLevel,
    breed.coatLength,
    ...breed.characteristics.map((item) => item.label),
  ];
  const longHair = textIncludes(text, "panjang") || textIncludes(text, "tebal");
  const highCare = (breed.groomingScore ?? 0) >= 7 || longHair;

  return {
    brushingFrequency: highCare
      ? `Sisir bulu ${breed.name} beberapa kali seminggu. Pada masa rontok, frekuensi bisa ditingkatkan.`
      : `Sisir bulu ${breed.name} 1-2 kali seminggu untuk membantu mengangkat bulu mati.`,
    bathing:
      "Mandi tidak perlu terlalu sering. Fokuskan pada kebersihan bulu, kulit, dan kenyamanan kucing.",
    eyeCare:
      "Periksa area mata secara ringan, terutama jika ada noda air mata atau kotoran yang menumpuk.",
    earCare:
      "Cek telinga secara berkala dan bersihkan hanya bagian luar yang terlihat bila diperlukan.",
    nailCare:
      "Potong kuku secara rutin sesuai kebutuhan dan sediakan scratching post.",
    dentalCare:
      "Biasakan dental care bertahap, seperti sikat gigi khusus kucing atau produk dental yang aman.",
    sheddingLevel: highCare ? "Sedang-tinggi" : scoreLabel(breed.groomingScore),
    hairballRisk: longHair ? "Perlu diperhatikan" : "Cenderung lebih ringan",
    notes:
      "Rutinitas grooming perlu disesuaikan dengan kondisi individu, musim rontok, dan toleransi kucing.",
  };
}

function fallbackNutritionNotes(breed: {
  name: string;
  foodType: string | null;
  activityScore: number | null;
  characteristics: { label: string }[];
}) {
  const text = [breed.foodType, ...breed.characteristics.map((item) => item.label)];
  const obesityRisk = textIncludes(text, "obesitas") ? "Perlu dipantau" : null;
  const active = (breed.activityScore ?? 0) >= 7 || textIncludes(text, "aktif");

  return {
    lifeStageNotes:
      "Sesuaikan makanan dengan usia aktual kucing: kitten, adult, atau senior.",
    proteinNotes: active
      ? "Ras aktif cenderung membutuhkan asupan protein berkualitas dan porsi yang konsisten."
      : "Protein berkualitas tetap menjadi dasar nutrisi harian.",
    hydrationNotes:
      "Wet food atau akses air minum yang menarik dapat membantu menjaga hidrasi.",
    portionNotes:
      "Gunakan takaran porsi dan pantau berat badan secara berkala.",
    obesityRisk: obesityRisk ?? "Pantau sesuai berat dan aktivitas",
    specialNeeds: breed.foodType,
  };
}

function productSearchTerms(breed: {
  foodType: string | null;
  careLevel: string | null;
  coatLength: string | null;
  activityLevel: string | null;
  characteristics: { label: string }[];
}) {
  const text = [
    breed.foodType,
    breed.careLevel,
    breed.coatLength,
    breed.activityLevel,
    ...breed.characteristics.map((item) => item.label),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return [
    text.includes("indoor") ? "indoor" : null,
    text.includes("hairball") || text.includes("bulu panjang") ? "hairball" : null,
    text.includes("skin") || text.includes("coat") || text.includes("bulu")
      ? "skin"
      : null,
    text.includes("aktif") || text.includes("high-protein") ? "protein" : null,
    text.includes("wet") ? "wet" : null,
    text.includes("dental") ? "dental" : null,
  ].filter((term): term is string => Boolean(term));
}

async function recordBreedView(breedId: string, userId?: string | null) {
  try {
    await Promise.all([
      prisma.catBreed.update({
        where: { id: breedId },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.breedView.create({
        data: { breedId, userId: userId ?? null },
      }),
    ]);
  } catch (error) {
    console.error("Failed to record breed view:", error);
  }
}

export async function generateMetadata({
  params,
}: BreedDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const breed = await prisma.catBreed.findUnique({
    where: { slug },
    select: {
      name: true,
      shortDescription: true,
      profileSummary: true,
      isPublished: true,
    },
  });

  if (!breed || !breed.isPublished) {
    return { title: "Ras tidak ditemukan | Rumah Kucing" };
  }

  return {
    title: `${breed.name}: Karakter, Perawatan, Kesehatan, dan Biaya | Rumah Kucing`,
    description:
      firstText(
        breed.shortDescription,
        breed.profileSummary,
        `Panduan lengkap ${breed.name}, mulai dari karakter, kebutuhan makanan, grooming, kesehatan, hingga kecocokan pemilik.`,
      ).slice(0, 160),
  };
}

export default async function BreedDetailPage({ params }: BreedDetailPageProps) {
  const { slug } = await params;

  const breed = await prisma.catBreed.findUnique({
    where: { slug },
    include: {
      characteristics: true,
      careGuide: true,
      nutritionGuide: true,
      healthNotes: { orderBy: { sortOrder: "asc" } },
      costEstimates: { orderBy: { updatedAt: "desc" } },
      galleryImages: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      colorPatterns: { orderBy: { sortOrder: "asc" } },
      similarBreeds: {
        orderBy: { sortOrder: "asc" },
        include: {
          similarBreed: {
            select: {
              id: true,
              slug: true,
              name: true,
              origin: true,
              imageSrc: true,
              shortDescription: true,
              profileSummary: true,
            },
          },
        },
      },
      suitabilities: { orderBy: [{ type: "asc" }, { sortOrder: "asc" }] },
      articles: {
        orderBy: { updatedAt: "desc" },
        take: 4,
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
      },
    },
  });

  if (!breed || !breed.isPublished) {
    notFound();
  }

  const user = await getCurrentUser();
  await recordBreedView(breed.id, user?.id);

  const terms = productSearchTerms(breed);
  const [fallbackSimilar, relatedProducts, savedLists] = await Promise.all([
    breed.similarBreeds.length > 0
      ? Promise.resolve([])
      : prisma.catBreed.findMany({
          where: { isPublished: true, id: { not: breed.id } },
          orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
          take: 4,
          select: {
            id: true,
            slug: true,
            name: true,
            origin: true,
            imageSrc: true,
            shortDescription: true,
            profileSummary: true,
          },
        }),
    prisma.product.findMany({
      where: {
        isActive: true,
        OR:
          terms.length > 0
            ? [
                { name: { contains: terms[0], mode: "insensitive" } },
                { description: { contains: terms[0], mode: "insensitive" } },
                { reason: { contains: terms[0], mode: "insensitive" } },
                { tags: { some: { tag: { in: terms } } } },
              ]
            : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { tags: true },
    }),
    user
      ? prisma.breedFavorite.findMany({
          where: { userId: user.id, breedId: breed.id },
          select: { listType: true },
        })
      : Promise.resolve([]),
  ]);

  const alternativeNames = asStringList(breed.alternativeNames);
  const heroImage =
    breed.backdropImageSrc ??
    breed.galleryImages.find((image) => image.type === "backdrop")?.url ??
    breed.imageSrc;
  const mainImage =
    breed.galleryImages.find((image) => image.type === "main")?.url ??
    breed.imageSrc ??
    heroImage;
  const care = breed.careGuide ?? fallbackCareNotes(breed);
  const nutrition = breed.nutritionGuide ?? fallbackNutritionNotes(breed);
  const cost = breed.costEstimates[0];
  const goodFor = breed.suitabilities.filter((item) => item.type === "good_for");
  const considerIf = breed.suitabilities.filter(
    (item) => item.type === "consider_if",
  );
  const similar = breed.similarBreeds.map((item) => ({
    ...item.similarBreed,
    reason: item.reason,
  }));
  const similarBreeds =
    similar.length > 0
      ? similar
      : fallbackSimilar.map((item) => ({
          ...item,
          reason:
            "Memiliki beberapa karakter yang bisa dibandingkan sebelum memilih ras.",
        }));
  const gallery =
    breed.galleryImages.length > 0
      ? breed.galleryImages
      : mainImage
        ? [
            {
              id: "main",
              url: mainImage,
              alt: `Foto ${breed.name}`,
              type: "main",
              credit: null,
            },
          ]
        : [];

  const scores = [
    ["Cocok pemula", breed.beginnerFitScore, "Panduan awal untuk pemilik baru."],
    ["Aktivitas", breed.activityScore, "Kebutuhan bermain dan stimulasi."],
    ["Keramahan", breed.friendlinessScore, "Kecenderungan sosial ras."],
    ["Perawatan bulu", breed.groomingScore, "Komitmen grooming rutin."],
    ["Vokal", breed.vocalScore, "Kecenderungan bersuara."],
    ["Adaptasi", breed.adaptabilityScore, "Kemudahan menyesuaikan lingkungan."],
  ] as const;

  const temperamentScores = [
    ["Ramah", breed.friendlinessScore],
    ["Mandiri", null],
    ["Aktif", breed.activityScore],
    ["Cerdas", breed.activityScore],
    ["Vokal", breed.vocalScore],
    ["Mudah beradaptasi", breed.adaptabilityScore],
    ["Cocok dengan anak-anak", breed.childFriendlyScore],
    ["Cocok dengan hewan lain", breed.petFriendlyScore],
  ] as const;

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-grow px-4 pb-24 pt-[92px] sm:px-6 md:px-[80px] md:pt-[112px]">
      <Link
        href="/breeds"
        className="mb-5 inline-flex items-center gap-2 text-[13px] font-bold text-primary hover:text-primary-container"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Catpedia
      </Link>

      <section className="relative -mx-4 overflow-hidden bg-ink text-white sm:-mx-6 md:-mx-[80px]">
        {heroImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-55"
            style={{ backgroundImage: `url(${heroImage})` }}
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-gradient opacity-80" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(29,42,37,0.94),rgba(29,42,37,0.72)_42%,rgba(29,42,37,0.32))]" />

        <div className="relative grid min-h-[460px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_360px] md:px-[80px] md:py-14 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex max-w-3xl flex-col justify-center">
            <p className="mb-3 text-[12px] font-extrabold uppercase text-honey">
              Catpedia by Rumah Kucing
            </p>
            <h1 className="font-headline text-[40px] font-extrabold leading-tight sm:text-[54px]">
              {breed.name}
            </h1>
            {alternativeNames.length > 0 && (
              <p className="mt-2 text-[14px] font-semibold text-white/78">
                Juga dikenal sebagai {alternativeNames.join(", ")}
              </p>
            )}
            <p className="mt-5 max-w-2xl text-[17px] leading-8 text-white/86">
              {firstText(
                breed.shortDescription,
                breed.profileSummary,
                "Profil ras ini sedang dilengkapi oleh tim Rumah Kucing.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {breed.origin && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-[12px] font-bold text-white">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {breed.origin}
                </span>
              )}
              {breed.activityLevel && (
                <span className="rounded-full bg-white/12 px-3 py-2 text-[12px] font-bold text-white">
                  Aktivitas {breed.activityLevel}
                </span>
              )}
              {breed.careLevel && (
                <span className="rounded-full bg-white/12 px-3 py-2 text-[12px] font-bold text-white">
                  Perawatan {breed.careLevel}
                </span>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/breeds/compare?ids=${breed.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/28 bg-white/12 px-4 text-[13px] font-bold text-white hover:bg-white/18"
              >
                <Scale className="h-4 w-4" aria-hidden="true" />
                Bandingkan
              </Link>
              <BreedListPicker
                breedId={breed.id}
                breedName={breed.name}
                isAuthenticated={Boolean(user)}
                initialListTypes={savedLists.map((item) => item.listType)}
                variant="hero"
              />
              <Link
                href={`/chat?topic=${encodeURIComponent(`Saya ingin tahu tentang ${breed.name}`)}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/28 bg-white/12 px-4 text-[13px] font-bold text-white hover:bg-white/18"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Tanyakan ke Ketty
              </Link>
              {availabilityIsCommercial(breed.availability) && (
                <Link
                  href={`/chat?topic=${encodeURIComponent(
                    `Apakah ras ${breed.name} saat ini tersedia untuk adopsi atau konsultasi?`,
                  )}`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-secondary px-4 text-[13px] font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,0.2)] hover:bg-secondary/90"
                >
                  <Store className="h-4 w-4" aria-hidden="true" />
                  Tanyakan Ketersediaan
                </Link>
              )}
            </div>
          </div>

          <div className="self-end rounded-[22px] border border-white/14 bg-white/12 p-4 backdrop-blur-md">
            <p className="mb-3 text-[12px] font-bold text-white/72">
              Skor panduan umum
            </p>
            <div className="grid gap-3">
              {scores.map(([label, score, helper]) => (
                <ScoreRow key={label} label={label} score={score} helper={helper} />
              ))}
            </div>
            <p className="mt-4 text-[12px] leading-5 text-white/70">
              Skor ini adalah panduan umum. Kepribadian setiap kucing tetap
              dipengaruhi lingkungan, sosialisasi, dan pengalaman hidupnya.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 pt-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-10">
          <section>
            <SectionTitle
              eyebrow="Tentang ras ini"
              title={`Mengenal ${breed.name}`}
            />
            <div className="grid gap-4 text-[15px] leading-8 text-on-surface-variant">
              {[
                breed.history,
                breed.personalityDescription,
                breed.profileSummary,
              ]
                .filter((item): item is string => Boolean(item?.trim()))
                .slice(0, 4)
                .map((paragraph, index) => (
                  <p key={`${breed.id}-about-${index}`}>{paragraph}</p>
                ))}
              {!firstText(
                breed.history,
                breed.personalityDescription,
                breed.profileSummary,
              ) && (
                <p>
                  Informasi naratif untuk {breed.name} sedang dilengkapi. Admin
                  dapat menambahkan sejarah, karakter, kebiasaan, dan keunikan
                  ras melalui Catpedia.
                </p>
              )}
            </div>
          </section>

          <section>
            <SectionTitle eyebrow="Fakta singkat" title="Profil dasar" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Fact label="Asal" value={breed.origin} />
              <Fact label="Ukuran" value={breed.sizeLabel} />
              <Fact label="Berat jantan" value={breed.maleWeightRange} />
              <Fact label="Berat betina" value={breed.femaleWeightRange} />
              <Fact label="Harapan hidup" value={breed.lifeExpectancy} />
              <Fact label="Panjang bulu" value={breed.coatLength} />
              <Fact label="Pola bulu" value={breed.coatPatterns} />
              <Fact label="Aktivitas" value={breed.activityLevel} />
              <Fact label="Vokal" value={breed.vocalLevel} />
              <Fact label="Cocok indoor" value={breed.indoorFit} />
            </div>
          </section>

          <section>
            <SectionTitle
              eyebrow="Karakter dan temperamen"
              title="Kecenderungan perilaku"
            />
            <div className="grid gap-3 md:grid-cols-2">
              {temperamentScores.map(([label, score]) => (
                <TraitBar key={label} label={label} score={score} />
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-border bg-muted/45 p-4 text-[13px] leading-6 text-on-surface-variant">
              Nilai ini menggambarkan kecenderungan umum ras. Kepribadian
              setiap kucing tetap dipengaruhi lingkungan, sosialisasi, dan
              pengalaman hidupnya.
            </p>
          </section>

          <section>
            <SectionTitle
              eyebrow="Kebutuhan perawatan"
              title="Grooming dan rutinitas"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <CareItem icon={Scissors} title="Menyisir" body={care.brushingFrequency} />
              <CareItem title="Mandi" body={care.bathing} />
              <CareItem title="Mata" body={care.eyeCare} />
              <CareItem title="Telinga" body={care.earCare} />
              <CareItem title="Kuku" body={care.nailCare} />
              <CareItem title="Dental care" body={care.dentalCare} />
              <CareItem title="Kerontokan" body={care.sheddingLevel} />
              <CareItem title="Risiko hairball" body={care.hairballRisk} />
            </div>
            {care.notes && (
              <p className="mt-4 rounded-xl border border-border bg-white p-4 text-[13px] leading-6 text-on-surface-variant">
                {care.notes}
              </p>
            )}
          </section>

          <section>
            <SectionTitle eyebrow="Nutrisi" title="Kebutuhan makanan" />
            <div className="grid gap-3 md:grid-cols-2">
              <CareItem icon={Utensils} title="Life stage" body={nutrition.lifeStageNotes} />
              <CareItem title="Protein" body={nutrition.proteinNotes} />
              <CareItem title="Hidrasi" body={nutrition.hydrationNotes} />
              <CareItem title="Kontrol porsi" body={nutrition.portionNotes} />
              <CareItem title="Risiko berat badan" body={nutrition.obesityRisk} />
              <CareItem title="Kebutuhan khusus" body={nutrition.specialNeeds} />
            </div>
          </section>

          <section>
            <SectionTitle
              eyebrow="Kesehatan"
              title="Hal yang perlu dipantau"
            />
            <div className="space-y-3">
              {breed.healthNotes.length > 0 ? (
                breed.healthNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-xl border border-border bg-white p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-headline text-[18px] font-bold text-ink">
                        {note.title}
                      </h3>
                      {note.severityLabel && (
                        <span className="rounded-full bg-rose/35 px-2.5 py-1 text-[10px] font-bold text-primary">
                          {note.severityLabel}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[14px] leading-7 text-on-surface-variant">
                      {note.description}
                    </p>
                    {note.monitoringTips && (
                      <p className="mt-3 text-[13px] leading-6 text-on-surface-variant">
                        {note.monitoringTips}
                      </p>
                    )}
                  </article>
                ))
              ) : (
                <article className="rounded-xl border border-border bg-white p-5">
                  <h3 className="font-headline text-[18px] font-bold text-ink">
                    Pantau kondisi individual
                  </h3>
                  <p className="mt-2 text-[14px] leading-7 text-on-surface-variant">
                    {breed.name} dapat memiliki kebutuhan kesehatan yang
                    berbeda-beda antar individu. Pantau berat badan, nafsu makan,
                    hidrasi, kebiasaan buang air, dan perubahan perilaku.
                  </p>
                </article>
              )}
            </div>
            <div className="mt-4 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-[13px] leading-6">
                Konten ini bersifat edukasi dan bukan diagnosis dokter hewan.
                Tidak semua individu ras ini pasti mengalami kondisi tertentu.
              </p>
            </div>
          </section>

          <section>
            <SectionTitle eyebrow="Kecocokan" title="Cocok untuk siapa?" />
            <div className="grid gap-4 md:grid-cols-2">
              <SuitabilityList
                title="Cocok untuk"
                fallback={[
                  breed.matchLabel,
                  breed.indoorFit ? `Gaya hidup ${breed.indoorFit}` : null,
                  (breed.beginnerFitScore ?? 0) >= 7 ? "Pemilik pertama" : null,
                ]}
                items={goodFor}
              />
              <SuitabilityList
                title="Perlu dipertimbangkan jika"
                fallback={[
                  (breed.groomingScore ?? 0) >= 7
                    ? "Belum siap grooming intensif"
                    : null,
                  (breed.activityScore ?? 0) >= 7
                    ? "Tidak punya waktu bermain harian"
                    : null,
                  textIncludes(
                    breed.characteristics.map((item) => item.label),
                    "obesitas",
                  )
                    ? "Tidak siap memantau berat badan"
                    : null,
                ]}
                items={considerIf}
              />
            </div>
          </section>

          <section>
            <SectionTitle eyebrow="Estimasi biaya" title="Perencanaan budget" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Fact label="Biaya awal" value={cost?.initialCostLabel ?? breed.kittenPriceLabel} />
              <Fact label="Kebutuhan bulanan" value={cost?.monthlyCostLabel ?? breed.monthlyCareLabel} />
              <Fact label="Grooming" value={cost?.groomingCostLabel} />
              <Fact label="Vaksin & check-up" value={cost?.vaccineCheckupLabel} />
              <Fact label="Starter kit" value={cost?.starterKitLabel} />
              <Fact label="Area" value={cost?.cityLabel} />
            </div>
            <p className="mt-4 rounded-xl border border-border bg-muted/45 p-4 text-[13px] leading-6 text-on-surface-variant">
              Estimasi diperbarui {formatDate(cost?.updatedAt ?? breed.commercialUpdatedAt)}.
              Harga dapat berbeda berdasarkan kota, kualitas produk, layanan,
              dan kondisi kesehatan kucing. Data harga awal hanya referensi,
              bukan fokus utama keputusan adopsi.
            </p>
            {cost?.notes && (
              <p className="mt-3 text-[13px] leading-6 text-on-surface-variant">
                {cost.notes}
              </p>
            )}
          </section>

          {gallery.length > 0 && (
            <section>
              <SectionTitle eyebrow="Galeri" title={`Foto ${breed.name}`} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.slice(0, 9).map((image) => (
                  <figure
                    key={image.id}
                    className="overflow-hidden rounded-xl border border-border bg-white"
                  >
                    <div
                      className="aspect-[4/3] bg-muted bg-cover bg-center"
                      style={{ backgroundImage: `url(${image.url})` }}
                      role="img"
                      aria-label={image.alt ?? `Foto ${breed.name}`}
                    />
                    <figcaption className="px-3 py-2 text-[11px] font-semibold text-on-surface-variant">
                      {image.alt ?? String(image.type).replaceAll("_", " ")}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionTitle
              eyebrow="Warna dan pola"
              title="Variasi yang bisa ditemui"
            />
            {breed.colorPatterns.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {breed.colorPatterns.map((pattern) => (
                  <article
                    key={pattern.id}
                    className="overflow-hidden rounded-xl border border-border bg-white"
                  >
                    {pattern.imageUrl && (
                      <div
                        className="aspect-[16/9] bg-muted bg-cover bg-center"
                        style={{ backgroundImage: `url(${pattern.imageUrl})` }}
                        role="img"
                        aria-label={pattern.name}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-headline text-[17px] font-bold text-ink">
                        {pattern.name}
                      </h3>
                      {pattern.description && (
                        <p className="mt-2 text-[13px] leading-6 text-on-surface-variant">
                          {pattern.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-border bg-white p-4 text-[14px] leading-7 text-on-surface-variant">
                Variasi warna dan pola untuk {breed.name} belum dicatat secara
                detail.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-xl border border-border bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <Info className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[12px] font-bold uppercase text-on-surface-variant">
                  Status Catpedia
                </p>
                <p className="font-headline text-[18px] font-bold text-ink">
                  {breed.availability ?? "Data edukatif"}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-[13px] leading-6 text-on-surface-variant">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                Konten diperbarui {formatDate(breed.contentUpdatedAt ?? breed.updatedAt)}
              </p>
              <p className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-secondary" aria-hidden="true" />
                {breed.viewCount + 1} kali dilihat
              </p>
            </div>
          </section>

          {breed.characteristics.length > 0 && (
            <section className="rounded-xl border border-border bg-white p-5 shadow-soft">
              <h2 className="font-headline text-[18px] font-bold text-ink">
                Tag karakter
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {breed.characteristics.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full border border-border bg-muted/55 px-3 py-1.5 text-[11px] font-bold text-on-surface-variant"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </section>
          )}

          {similarBreeds.length > 0 && (
            <section className="rounded-xl border border-border bg-white p-5 shadow-soft">
              <h2 className="font-headline text-[18px] font-bold text-ink">
                Ras yang mungkin juga kamu sukai
              </h2>
              <div className="mt-4 space-y-3">
                {similarBreeds.map((item) => (
                  <Link
                    key={item.id}
                    href={`/breeds/${item.slug}`}
                    className="group flex gap-3 rounded-lg border border-border/70 p-3 hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {item.imageSrc ? (
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.imageSrc})` }}
                        />
                      ) : (
                        <ImageIcon
                          className="h-5 w-5 text-on-surface-variant"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-headline text-[15px] font-bold text-ink group-hover:text-primary">
                        {item.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-on-surface-variant">
                        {item.reason ??
                          firstText(item.shortDescription, item.profileSummary)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {breed.articles.length > 0 && (
            <section className="rounded-xl border border-border bg-white p-5 shadow-soft">
              <h2 className="font-headline text-[18px] font-bold text-ink">
                Artikel terkait
              </h2>
              <div className="mt-4 space-y-3">
                {breed.articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/explore/${article.slug}`}
                    className="block rounded-lg border border-border/70 p-3 hover:border-primary/30 hover:bg-primary/5"
                  >
                    <p className="text-[12px] font-bold text-primary">
                      {firstText(article.category, article.readTime)}
                    </p>
                    <h3 className="mt-1 font-headline text-[15px] font-bold text-ink">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-on-surface-variant">
                        {article.summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedProducts.length > 0 && (
            <section className="rounded-xl border border-border bg-white p-5 shadow-soft">
              <h2 className="font-headline text-[18px] font-bold text-ink">
                Produk dan layanan terkait
              </h2>
              <p className="mt-1 text-[12px] leading-5 text-on-surface-variant">
                Ditampilkan sebagai konteks kebutuhan ras, bukan pengganti
                saran dokter hewan.
              </p>
              <div className="mt-4 space-y-3">
                {relatedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/explore/products/${product.id}`}
                    className="group flex gap-3 rounded-lg border border-border/70 p-3 hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {product.imageUrl ? (
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${product.imageUrl})` }}
                        />
                      ) : (
                        <Store
                          className="h-5 w-5 text-on-surface-variant"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-headline text-[14px] font-bold text-ink group-hover:text-primary">
                        {product.name}
                      </p>
                      <p className="mt-1 text-[12px] font-bold text-secondary">
                        Rp{Number(product.priceIdr).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h2 className="font-headline text-[27px] font-extrabold text-ink sm:text-[32px]">
        {title}
      </h2>
    </div>
  );
}

function ScoreRow({
  label,
  score,
  helper,
}: {
  label: string;
  score: number | null;
  helper: string;
}) {
  const value = scoreValue(score);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold text-white">{label}</span>
        <span className="text-[12px] font-bold text-white/76">
          {score == null ? "N/A" : `${score}/10`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/16">
        <div
          className="h-full rounded-full bg-honey"
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] leading-4 text-white/62">{helper}</p>
    </div>
  );
}

function TraitBar({
  label,
  score,
}: {
  label: string;
  score: number | null;
}) {
  const value = scoreValue(score);
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink">{label}</span>
        <span className="text-[12px] font-bold text-primary">
          {score == null ? "Belum dinilai" : scoreLabel(score)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <dt className="text-[11px] font-bold uppercase text-on-surface-variant">
        {label}
      </dt>
      <dd className="mt-1 text-[15px] font-bold text-ink">
        {firstText(value, "Belum dicatat")}
      </dd>
    </div>
  );
}

function CareItem({
  icon: Icon = Sparkles,
  title,
  body,
}: {
  icon?: typeof Sparkles;
  title: string;
  body: string | null | undefined;
}) {
  return (
    <article className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-headline text-[16px] font-bold text-ink">
            {title}
          </h3>
          <p className="mt-1 text-[13px] leading-6 text-on-surface-variant">
            {firstText(body, "Belum dicatat.")}
          </p>
        </div>
      </div>
    </article>
  );
}

function SuitabilityList({
  title,
  items,
  fallback,
}: {
  title: string;
  items: Array<{ id: string; label: string; description: string | null }>;
  fallback: Array<string | null | undefined>;
}) {
  const fallbackItems = fallback.filter(
    (item): item is string => Boolean(item?.trim()),
  );
  const visibleItems =
    items.length > 0
      ? items.map((item) => ({
          id: item.id,
          label: item.label,
          description: item.description,
        }))
      : fallbackItems.map((item) => ({
          id: item,
          label: item,
          description: null,
        }));

  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h3 className="font-headline text-[18px] font-bold text-ink">{title}</h3>
      <ul className="mt-3 space-y-3">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <li key={item.id} className="flex gap-2 text-[14px] leading-6">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>
                <span className="font-bold text-ink">{item.label}</span>
                {item.description && (
                  <span className="text-on-surface-variant">
                    {" "}
                    {item.description}
                  </span>
                )}
              </span>
            </li>
          ))
        ) : (
          <li className="text-[14px] leading-6 text-on-surface-variant">
            Data kecocokan masih dilengkapi.
          </li>
        )}
      </ul>
    </section>
  );
}
