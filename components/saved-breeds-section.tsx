"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  BREED_FAVORITE_LIST_META,
  BREED_FAVORITE_LIST_TYPES,
  type BreedFavoriteListType,
} from "@/lib/catpedia/favorites";

type SavedBreed = {
  id: string;
  listType: BreedFavoriteListType;
  createdAt: string;
  breed: {
    id: string;
    slug: string;
    name: string;
    origin: string | null;
    imageSrc: string | null;
    shortDescription: string | null;
    profileSummary: string | null;
  };
};

export function SavedBreedsSection() {
  const [favorites, setFavorites] = useState<SavedBreed[]>([]);
  const [activeList, setActiveList] =
    useState<BreedFavoriteListType>("favorite");
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/breeds/favorites", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          if (!cancelled) setFavorites([]);
          return;
        }
        if (!response.ok) {
          throw new Error(data?.error || "Gagal memuat Ras Pilihanku.");
        }

        if (!cancelled) {
          setFavorites(
            Array.isArray(data?.favorites) ? data.favorites : [],
          );
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Gagal memuat Ras Pilihanku.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        BREED_FAVORITE_LIST_TYPES.map((listType) => [
          listType,
          favorites.filter((item) => item.listType === listType).length,
        ]),
      ) as Record<BreedFavoriteListType, number>,
    [favorites],
  );
  const visible = favorites.filter((item) => item.listType === activeList);

  async function removeFavorite(item: SavedBreed) {
    if (removingId) return;
    setRemovingId(item.id);
    setError("");

    try {
      const response = await fetch(
        `/api/breeds/favorites?breedId=${encodeURIComponent(
          item.breed.id,
        )}&listType=${item.listType}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Gagal menghapus ras dari daftar.");
      }

      setFavorites((current) =>
        current.filter((favorite) => favorite.id !== item.id),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Gagal menghapus ras dari daftar.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="mt-8 border-t border-border/70 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Catpedia tersimpan</p>
          <h2 className="font-headline text-2xl font-extrabold text-ink">
            Ras Pilihanku
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Kelola ras favorit, bahan belajar, pertimbangan adopsi, dan ras
            yang pernah kamu pelihara.
          </p>
        </div>
        <Link
          href="/breeds"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary/25 bg-white px-4 text-xs font-bold text-primary hover:bg-primary/5"
        >
          Jelajahi Catpedia
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div
        className="mt-5 flex gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Daftar ras tersimpan"
      >
        {BREED_FAVORITE_LIST_TYPES.map((listType) => (
          <button
            key={listType}
            type="button"
            role="tab"
            aria-selected={activeList === listType}
            onClick={() => setActiveList(listType)}
            className={
              "flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-bold transition-colors " +
              (activeList === listType
                ? "bg-primary text-white"
                : "border border-border bg-white text-on-surface-variant hover:border-primary/25 hover:text-primary")
            }
          >
            {BREED_FAVORITE_LIST_META[listType].label}
            <span
              className={
                "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] " +
                (activeList === listType
                  ? "bg-white/18 text-white"
                  : "bg-muted text-on-surface-variant")
              }
            >
              {counts[listType]}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p
          className="mt-4 rounded-xl border border-destructive/15 bg-destructive/7 px-4 py-3 text-sm font-semibold text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="mt-5 flex min-h-[150px] items-center justify-center rounded-xl border border-border/70 bg-white/65">
          <span className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Memuat Ras Pilihanku...
          </span>
        </div>
      ) : visible.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {visible.map((item) => (
            <article
              key={item.id}
              className="flex min-h-[132px] overflow-hidden rounded-xl border border-border/75 bg-white shadow-sm"
            >
              <Link
                href={`/breeds/${item.breed.slug}`}
                className="relative w-32 shrink-0 bg-muted sm:w-40"
                aria-label={`Lihat profil ${item.breed.name}`}
              >
                {item.breed.imageSrc ? (
                  <Image
                    src={item.breed.imageSrc}
                    alt={`Foto ${item.breed.name}`}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <Bookmark
                    className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary"
                    aria-hidden="true"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <p className="text-[10px] font-bold uppercase text-primary">
                  {item.breed.origin || "Asal belum dicatat"}
                </p>
                <Link
                  href={`/breeds/${item.breed.slug}`}
                  className="mt-1 truncate font-headline text-lg font-extrabold text-ink hover:text-primary"
                >
                  {item.breed.name}
                </Link>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-on-surface-variant">
                  {item.breed.shortDescription ||
                    item.breed.profileSummary ||
                    "Informasi ras sedang dilengkapi."}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <Link
                    href={`/breeds/${item.breed.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary"
                  >
                    Lihat detail
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFavorite(item)}
                    disabled={Boolean(removingId)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-destructive/7 hover:text-destructive disabled:opacity-50"
                    aria-label={`Hapus ${item.breed.name} dari ${BREED_FAVORITE_LIST_META[item.listType].label}`}
                    title="Hapus dari daftar"
                  >
                    {removingId === item.id ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-white/60 px-5 py-10 text-center">
          <Bookmark
            className="mx-auto h-7 w-7 text-on-surface-variant"
            aria-hidden="true"
          />
          <h3 className="mt-3 font-headline text-base font-bold text-ink">
            Daftar {BREED_FAVORITE_LIST_META[activeList].label.toLowerCase()} masih kosong
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-on-surface-variant">
            Buka Catpedia lalu gunakan tombol Simpan pada profil ras yang ingin
            kamu masukkan ke daftar ini.
          </p>
        </div>
      )}
    </section>
  );
}
