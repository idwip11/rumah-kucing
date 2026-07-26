"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Home,
  Search,
  Scale,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { BreedCard } from "@/components/breed-card";
import type { BreedFavoriteListType } from "@/lib/catpedia/favorites";

export type BreedForCard = {
  id: string;
  slug: string;
  name: string;
  origin: string | null;
  imageSrc: string | null;
  shortDescription: string | null;
  characteristics: string[];
  careLevel: string | null;
  activityLevel: string | null;
  coatLength: string | null;
  indoorFit: string | null;
  beginnerFitScore: number | null;
  activityScore: number | null;
  groomingScore: number | null;
  availability: string | null;
  matchLabel: string | null;
  viewCount: number;
  weeklyViewCount: number;
  isFeatured: boolean;
};

type QuickFilter =
  | "pemula"
  | "rumah-kecil"
  | "aktif"
  | "perawatan-ringan"
  | "bulu-panjang";

const quickFilters: Array<{ id: QuickFilter; label: string }> = [
  { id: "pemula", label: "Cocok pemula" },
  { id: "rumah-kecil", label: "Rumah kecil" },
  { id: "aktif", label: "Aktif & cerdas" },
  { id: "perawatan-ringan", label: "Perawatan ringan" },
  { id: "bulu-panjang", label: "Bulu panjang" },
];

const compareStorageKey = "rumah-kucing:breed-compare";
const availableValues = new Set(["available", "ready list", "adopt & buy"]);

function searchableText(breed: BreedForCard) {
  return [
    breed.name,
    breed.origin,
    breed.shortDescription,
    breed.matchLabel,
    breed.careLevel,
    breed.activityLevel,
    breed.coatLength,
    breed.indoorFit,
    ...breed.characteristics,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function isBeginnerFriendly(breed: BreedForCard) {
  return (
    (breed.beginnerFitScore ?? 0) >= 7 ||
    includesAny(searchableText(breed), [
      "first-time",
      "pemula",
      "adaptif",
      "perawatan mudah",
      "ramah keluarga",
    ])
  );
}

function isSmallHomeFriendly(breed: BreedForCard) {
  return includesAny(searchableText(breed), [
    "apartemen",
    "rumah kecil",
    "indoor",
    "tenang",
    "kalem",
  ]);
}

function isActiveAndSmart(breed: BreedForCard) {
  return (
    (breed.activityScore ?? 0) >= 7 ||
    includesAny(searchableText(breed), [
      "sangat aktif",
      "aktif",
      "cerdas",
      "atletis",
      "enerjik",
      "playful",
    ])
  );
}

function isLowGrooming(breed: BreedForCard) {
  const text = searchableText(breed);
  return (
    (breed.groomingScore != null && breed.groomingScore <= 4) ||
    includesAny(text, [
      "perawatan rendah",
      "perawatan ringan",
      "perawatan mudah",
      "rendah sedang",
      "bulu pendek",
      "shorthair",
    ])
  );
}

function isLongHaired(breed: BreedForCard) {
  return includesAny(searchableText(breed), [
    "bulu panjang",
    "semi panjang",
    "longhair",
    "bulu tebal",
  ]);
}

function isDomestic(breed: BreedForCard) {
  return includesAny(searchableText(breed), [
    "domestic",
    "domestik",
    "campuran",
    "kucing lokal",
    "kucing kampung",
  ]);
}

function isAvailable(breed: BreedForCard) {
  return availableValues.has(breed.availability?.trim().toLowerCase() ?? "");
}

function matchesQuickFilter(breed: BreedForCard, filter: QuickFilter | null) {
  if (!filter) return true;
  if (filter === "pemula") return isBeginnerFriendly(breed);
  if (filter === "rumah-kecil") return isSmallHomeFriendly(breed);
  if (filter === "aktif") return isActiveAndSmart(breed);
  if (filter === "perawatan-ringan") return isLowGrooming(breed);
  return isLongHaired(breed);
}

function pickBreeds(
  breeds: BreedForCard[],
  predicate: (breed: BreedForCard) => boolean,
  limit = 5,
) {
  return breeds.filter(predicate).slice(0, limit);
}

function popularBreeds(breeds: BreedForCard[]) {
  return [...breeds]
    .sort(
      (a, b) =>
        b.weeklyViewCount - a.weeklyViewCount ||
        b.viewCount - a.viewCount ||
        Number(b.isFeatured) - Number(a.isFeatured) ||
        Number(Boolean(b.imageSrc)) - Number(Boolean(a.imageSrc)) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 5);
}

export function BreedsExplorer({
  breeds,
  isAuthenticated,
  initialFavorites,
}: {
  breeds: BreedForCard[];
  isAuthenticated: boolean;
  initialFavorites: Record<string, BreedFavoriteListType[]>;
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<QuickFilter | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [favoriteTypesByBreed, setFavoriteTypesByBreed] =
    useState(initialFavorites);

  useEffect(() => {
    const stored = window.localStorage.getItem(compareStorageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setCompareIds(
          parsed
            .filter((item): item is string => typeof item === "string")
            .slice(0, 3),
        );
      }
    } catch {
      window.localStorage.removeItem(compareStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(compareStorageKey, JSON.stringify(compareIds));
  }, [compareIds]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return breeds.filter((breed) => {
      const matchesQuery =
        normalizedQuery === "" ||
        searchableText(breed).includes(normalizedQuery);
      return matchesQuery && matchesQuickFilter(breed, activeFilter);
    });
  }, [breeds, query, activeFilter]);

  const collections = useMemo(
    () => [
      {
        title: "Populer Minggu Ini",
        description: "Profil yang menjadi titik awal favorit di Catpedia.",
        icon: Sparkles,
        breeds: popularBreeds(breeds),
      },
      {
        title: "Cocok untuk Pemula",
        description: "Karakter adaptif dengan kebutuhan yang relatif mudah dipahami.",
        icon: BookOpen,
        breeds: pickBreeds(breeds, isBeginnerFriendly),
      },
      {
        title: "Cocok untuk Rumah Kecil",
        description: "Pilihan yang cenderung nyaman dengan gaya hidup indoor.",
        icon: Home,
        breeds: pickBreeds(breeds, isSmallHomeFriendly),
      },
      {
        title: "Ras Aktif dan Cerdas",
        description: "Untuk rumah yang siap menyediakan permainan dan stimulasi.",
        icon: Brain,
        breeds: pickBreeds(breeds, isActiveAndSmart),
      },
      {
        title: "Perawatan Bulu Rendah",
        description: "Kebutuhan grooming yang cenderung lebih ringan.",
        icon: SlidersHorizontal,
        breeds: pickBreeds(breeds, isLowGrooming),
      },
      {
        title: "Domestic dan Campuran",
        description: "Kucing lokal dan non-pedigree yang sama layaknya dipertimbangkan.",
        icon: Sparkles,
        breeds: pickBreeds(breeds, isDomestic),
      },
    ],
    [breeds],
  );

  const availableBreeds = useMemo(
    () => pickBreeds(breeds, isAvailable, 6),
    [breeds],
  );
  const selectedBreeds = useMemo(
    () =>
      compareIds
        .map((id) => breeds.find((breed) => breed.id === id))
        .filter((breed): breed is BreedForCard => Boolean(breed)),
    [breeds, compareIds],
  );
  const compareHref = `/breeds/compare?ids=${selectedBreeds
    .map((breed) => breed.id)
    .join(",")}`;
  const isFiltering = query.trim() !== "" || activeFilter !== null;

  function toggleCompare(breedId: string) {
    setCompareIds((current) => {
      if (current.includes(breedId)) {
        return current.filter((id) => id !== breedId);
      }

      if (current.length >= 3) return current;
      return [...current, breedId];
    });
  }

  return (
    <>
      <section
        className="mb-12 border-y border-border/70 py-5 sm:py-6"
        aria-label="Pencarian dan filter ras"
      >
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary sm:left-5"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-14 w-full rounded-xl border border-input bg-white pl-12 pr-12 text-[14px] text-on-surface outline-none sm:pl-14 sm:text-[15px]"
            placeholder="Cari ras, sifat, ukuran, atau kebutuhan perawatan..."
            type="search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-muted hover:text-ink"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              type="button"
              key={filter.id}
              onClick={() =>
                setActiveFilter((current) =>
                  current === filter.id ? null : filter.id,
                )
              }
              aria-pressed={activeFilter === filter.id}
              className={
                "btn-bounce rounded-full px-3.5 py-2 text-[11px] font-bold transition-colors sm:text-[12px] " +
                (activeFilter === filter.id
                  ? "bg-primary text-white shadow-[0_6px_14px_hsl(var(--primary)/0.18)]"
                  : "border border-border/75 bg-white text-on-surface-variant hover:border-primary/30 hover:text-primary")
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {!isFiltering && (
        <div className="space-y-14">
          {collections
            .filter((collection) => collection.breeds.length > 0)
            .map((collection) => (
              <DiscoveryShelf
                key={collection.title}
                {...collection}
              />
            ))}
        </div>
      )}

      <section
        id="semua-profil-ras"
        className={isFiltering ? "" : "mt-16 border-t border-border/70 pt-12"}
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">
              {isFiltering ? "Hasil pencarian" : "Database Catpedia"}
            </p>
            <h2 className="font-headline text-[27px] font-extrabold text-ink sm:text-[32px]">
              {isFiltering ? `${filtered.length} ras ditemukan` : "Semua Profil Ras"}
            </h2>
          </div>
          {isFiltering && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter(null);
              }}
              className="flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-[12px] font-bold text-primary hover:bg-primary/5"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Reset filter
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((breed) => (
              <BreedCard
                key={breed.id}
                {...breed}
                profileHref={`/breeds/${breed.slug}`}
                isCompareSelected={compareIds.includes(breed.id)}
                compareDisabled={
                  compareIds.length >= 3 && !compareIds.includes(breed.id)
                }
                onToggleCompare={() => toggleCompare(breed.id)}
                isAuthenticated={isAuthenticated}
                favoriteListTypes={favoriteTypesByBreed[breed.id] ?? []}
                onFavoriteChange={(listTypes) =>
                  setFavoriteTypesByBreed((current) => ({
                    ...current,
                    [breed.id]: listTypes,
                  }))
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-white/65 px-6 py-14 text-center">
            <Search
              className="mx-auto h-8 w-8 text-on-surface-variant"
              aria-hidden="true"
            />
            <h3 className="mt-4 font-headline text-lg font-bold text-ink">
              Belum ada ras yang cocok
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
              Coba gunakan kata yang lebih umum atau hapus salah satu filter.
            </p>
          </div>
        )}
      </section>

      {!isFiltering && availableBreeds.length > 0 && (
        <section className="mt-16 border-t border-border/70 pt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Layanan Sumber Jaya</p>
              <h2 className="font-headline text-[27px] font-extrabold text-ink sm:text-[32px]">
                Tersedia di Sumber Jaya
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                Kucing yang saat ini dapat ditanyakan untuk adopsi, daftar
                tunggu, atau konsultasi ketersediaan.
              </p>
            </div>
            <Link
              href="/chat"
              className="flex h-10 items-center gap-2 rounded-lg border border-primary/25 bg-white px-4 text-[12px] font-bold text-primary hover:bg-primary/5"
            >
              Konsultasi dengan Ketty
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableBreeds.map((breed) => (
              <Link
                key={breed.id}
                href={`/breeds/${breed.slug}`}
                className="group flex min-h-[88px] items-center gap-4 rounded-xl border border-border/75 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {breed.imageSrc ? (
                    <Image
                      src={breed.imageSrc}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <Store
                      className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-headline text-[15px] font-bold text-ink">
                    {breed.name}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-semibold text-primary">
                    {breed.availability}
                  </p>
                </div>
                <ArrowRight
                  className="ml-auto h-4 w-4 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {selectedBreeds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/75 bg-white/95 px-4 py-3 shadow-[0_-12px_34px_rgba(33,41,36,0.12)] backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase text-primary">
                <Scale className="h-4 w-4" aria-hidden="true" />
                Compare ras
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedBreeds.map((breed) => (
                  <button
                    key={breed.id}
                    type="button"
                    onClick={() => toggleCompare(breed.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1.5 text-[12px] font-bold text-primary"
                    aria-label={`Hapus ${breed.name} dari compare`}
                  >
                    {breed.name}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}
                {selectedBreeds.length < 3 && (
                  <span className="rounded-full border border-dashed border-border px-3 py-1.5 text-[12px] font-semibold text-on-surface-variant">
                    Pilih {2 - selectedBreeds.length > 0 ? 2 - selectedBreeds.length : 1} lagi
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setCompareIds([])}
                className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-[13px] font-bold text-on-surface-variant hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Bersihkan
              </button>
              <Link
                href={compareHref}
                aria-disabled={selectedBreeds.length < 2}
                className={
                  "flex h-11 items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-white shadow-[0_8px_20px_hsl(var(--primary)/0.18)] " +
                  (selectedBreeds.length >= 2
                    ? "bg-primary hover:bg-primary-container"
                    : "pointer-events-none bg-on-surface-variant/45")
                }
              >
                Lihat Perbandingan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DiscoveryShelf({
  title,
  description,
  icon: Icon,
  breeds,
}: {
  title: string;
  description: string;
  icon: typeof Sparkles;
  breeds: BreedForCard[];
}) {
  return (
    <section>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-headline text-[23px] font-extrabold text-ink sm:text-[27px]">
            {title}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-on-surface-variant">
            {description}
          </p>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {breeds.map((breed) => (
          <Link
            key={breed.id}
            href={`/breeds/${breed.slug}`}
            className="group w-[220px] shrink-0 snap-start overflow-hidden rounded-xl border border-border/75 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-md sm:w-[250px]"
            aria-label={`Lihat profil ras ${breed.name}`}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              {breed.imageSrc ? (
                <Image
                  src={breed.imageSrc}
                  alt={`Foto ${breed.name}`}
                  fill
                  sizes="250px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[28px]">
                    pets
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="truncate font-headline text-[16px] font-bold text-ink">
                {breed.name}
              </p>
              <p className="mt-1 truncate text-[11px] font-semibold uppercase text-on-surface-variant">
                {breed.origin || "Asal belum dicatat"}
              </p>
              <span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-primary">
                Lihat profil
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
