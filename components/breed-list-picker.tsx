"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bookmark,
  BookOpen,
  Check,
  Heart,
  History,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { ModalPortal } from "@/components/ui/modal-portal";
import {
  BREED_FAVORITE_LIST_META,
  BREED_FAVORITE_LIST_TYPES,
  type BreedFavoriteListType,
} from "@/lib/catpedia/favorites";

const listIcons = {
  favorite: Heart,
  learn_later: BookOpen,
  adoption_consideration: Sparkles,
  had_before: History,
} satisfies Record<BreedFavoriteListType, typeof Heart>;

type BreedListPickerProps = {
  breedId: string;
  breedName: string;
  isAuthenticated: boolean;
  initialListTypes?: BreedFavoriteListType[];
  variant?: "card" | "hero";
  onChange?: (listTypes: BreedFavoriteListType[]) => void;
};

export function BreedListPicker({
  breedId,
  breedName,
  isAuthenticated,
  initialListTypes = [],
  variant = "card",
  onChange,
}: BreedListPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] =
    useState<BreedFavoriteListType[]>(initialListTypes);
  const [pendingType, setPendingType] =
    useState<BreedFavoriteListType | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelected(initialListTypes);
  }, [initialListTypes]);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  function openPicker() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setError("");
    setIsOpen(true);
  }

  async function toggleListType(listType: BreedFavoriteListType) {
    if (pendingType || isClearing) return;

    const isSelected = selected.includes(listType);
    setPendingType(listType);
    setError("");

    try {
      const response = await fetch(
        isSelected
          ? `/api/breeds/favorites?breedId=${encodeURIComponent(
              breedId,
            )}&listType=${listType}`
          : "/api/breeds/favorites",
        {
          method: isSelected ? "DELETE" : "POST",
          credentials: "include",
          headers: isSelected
            ? undefined
            : { "Content-Type": "application/json" },
          body: isSelected
            ? undefined
            : JSON.stringify({ breedId, listType }),
        },
      );
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        setIsOpen(false);
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!response.ok) {
        throw new Error(data?.error || "Gagal memperbarui daftar.");
      }

      const next = isSelected
        ? selected.filter((item) => item !== listType)
        : [...selected, listType];
      setSelected(next);
      onChange?.(next);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Gagal memperbarui daftar.",
      );
    } finally {
      setPendingType(null);
    }
  }

  async function clearLists() {
    if (selected.length === 0 || pendingType || isClearing) return;
    setIsClearing(true);
    setError("");

    try {
      const response = await fetch(
        `/api/breeds/favorites?breedId=${encodeURIComponent(breedId)}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        setIsOpen(false);
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!response.ok) {
        throw new Error(data?.error || "Gagal menghapus ras dari daftar.");
      }

      setSelected([]);
      onChange?.([]);
      setIsOpen(false);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Gagal menghapus ras dari daftar.",
      );
    } finally {
      setIsClearing(false);
    }
  }

  const isSaved = selected.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={
          variant === "hero"
            ? "inline-flex h-11 items-center gap-2 rounded-xl border border-white/28 bg-white/12 px-4 text-[13px] font-bold text-white hover:bg-white/18"
            : "btn-bounce flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/75 bg-white px-3 text-[13px] font-bold text-on-surface-variant transition-colors hover:border-secondary/30 hover:text-secondary"
        }
      >
        {isSaved ? (
          <Bookmark className="h-4 w-4 fill-current" aria-hidden="true" />
        ) : (
          <Heart className="h-4 w-4" aria-hidden="true" />
        )}
        {isSaved ? "Tersimpan" : "Simpan"}
      </button>

      {isOpen && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsOpen(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby={`save-breed-${breedId}`}
              className="w-full max-w-md rounded-[20px] border border-border/70 bg-white p-5 shadow-floating sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow mb-1">Ras Pilihanku</p>
                  <h2
                    id={`save-breed-${breedId}`}
                    className="font-headline text-xl font-extrabold text-ink"
                  >
                    Simpan {breedName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    Satu ras dapat disimpan ke lebih dari satu daftar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-on-surface-variant hover:bg-muted hover:text-ink"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-5 grid gap-2">
                {BREED_FAVORITE_LIST_TYPES.map((listType) => {
                  const meta = BREED_FAVORITE_LIST_META[listType];
                  const Icon = listIcons[listType];
                  const active = selected.includes(listType);
                  const pending = pendingType === listType;

                  return (
                    <button
                      key={listType}
                      type="button"
                      onClick={() => toggleListType(listType)}
                      disabled={Boolean(pendingType) || isClearing}
                      aria-pressed={active}
                      className={
                        "flex min-h-[68px] items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-wait disabled:opacity-65 " +
                        (active
                          ? "border-primary/30 bg-primary/7"
                          : "border-border/75 bg-white hover:border-primary/25 hover:bg-primary/4")
                      }
                    >
                      <span
                        className={
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg " +
                          (active
                            ? "bg-primary text-white"
                            : "bg-muted text-on-surface-variant")
                        }
                      >
                        {pending ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink">
                          {meta.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-on-surface-variant">
                          {meta.description}
                        </span>
                      </span>
                      {active && !pending && (
                        <Check
                          className="h-5 w-5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {error && (
                <p
                  className="mt-3 rounded-lg bg-destructive/8 px-3 py-2 text-xs font-semibold text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
                {selected.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearLists}
                    disabled={Boolean(pendingType) || isClearing}
                    className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-xs font-bold text-destructive hover:bg-destructive/7 disabled:opacity-50"
                  >
                    {isClearing ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    Hapus dari semua daftar
                  </button>
                ) : (
                  <span className="text-xs text-on-surface-variant">
                    Belum disimpan
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-10 rounded-lg bg-primary px-4 text-xs font-bold text-white hover:bg-primary-container"
                >
                  Selesai
                </button>
              </div>
            </section>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
