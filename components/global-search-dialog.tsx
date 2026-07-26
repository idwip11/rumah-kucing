"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalPortal } from "@/components/ui/modal-portal";

export type SearchResult = {
  id: string;
  title: string;
  href: string;
  preview: string;
  meta?: string;
  imageUrl?: string | null;
};

export type SearchGroup = {
  key: string;
  label: string;
  results: SearchResult[];
};

type SearchResponse = {
  query: string;
  groups: SearchGroup[];
  total: number;
  error?: string;
};

export function useGlobalSearch({ enabled = true }: { enabled?: boolean } = {}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!enabled) return;

    const searchTerm = debouncedQuery;
    if (searchTerm.length < 2) {
      setGroups([]);
      setError("");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError("");

    fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as SearchResponse;
        if (!response.ok) {
          throw new Error(data.error ?? "Gagal menjalankan pencarian");
        }
        setGroups(data.groups ?? []);
      })
      .catch((searchError) => {
        if (
          searchError instanceof DOMException &&
          searchError.name === "AbortError"
        ) {
          return;
        }
        console.error("Global search UI failed:", searchError);
        setError(
          searchError instanceof Error
            ? searchError.message
            : "Gagal menjalankan pencarian",
        );
        setGroups([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery, enabled]);

  return {
    query,
    setQuery,
    groups,
    isLoading,
    error,
    hasSearchTerm: query.trim().length >= 2,
    hasResults: groups.length > 0,
  };
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    groups,
    isLoading,
    error,
    hasSearchTerm,
    hasResults,
  } = useGlobalSearch({ enabled: open });

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-foreground/30 px-4 py-5 backdrop-blur-md md:px-6">
        <button
          type="button"
          aria-label="Tutup pencarian"
          className="absolute inset-0 cursor-default"
          onClick={() => onOpenChange(false)}
        />

        <section
          className="premium-card relative mx-auto flex max-h-[calc(100vh-40px)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] shadow-floating"
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian global"
        >
          <div className="flex items-center gap-3 border-b border-border/70 bg-white/85 px-4 py-4 md:px-6">
            <Search
              className="h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari artikel, produk, ras, jadwal, prestasi..."
              className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-on-surface outline-none placeholder:text-on-surface-variant/65"
            />
            {query && (
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-primary/7 hover:text-primary"
                onClick={() => setQuery("")}
                aria-label="Hapus kata pencarian"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-secondary/7 hover:text-secondary"
              onClick={() => onOpenChange(false)}
              aria-label="Tutup"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <GlobalSearchResults
            error={error}
            groups={groups}
            hasResults={hasResults}
            hasSearchTerm={hasSearchTerm}
            isLoading={isLoading}
            onResultClick={() => onOpenChange(false)}
          />
        </section>
      </div>
    </ModalPortal>
  );
}

export function GlobalSearchResults({
  error,
  groups,
  hasResults,
  hasSearchTerm,
  isLoading,
  onResultClick,
  className,
}: {
  error: string;
  groups: SearchGroup[];
  hasResults: boolean;
  hasSearchTerm: boolean;
  isLoading: boolean;
  onResultClick?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("overflow-y-auto px-4 py-4 md:px-6 md:py-5", className)}>
      {!hasSearchTerm && (
        <div className="soft-panel rounded-[20px] p-5">
          <p className="text-[15px] font-bold text-on-surface">
            Cari semua konten Rumah Kucing
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-on-surface-variant">
            Ketik minimal 2 huruf untuk mencari artikel, produk, event, ras,
            profil kucing, timeline, dan prestasi.
          </p>
        </div>
      )}

      {hasSearchTerm && isLoading && (
        <div className="space-y-3 rounded-[20px] border border-border/70 bg-white/75 p-5">
          <div className="skeleton-shimmer h-4 w-2/5 rounded-full" />
          <div className="skeleton-shimmer h-14 w-full rounded-2xl" />
          <div className="skeleton-shimmer h-14 w-full rounded-2xl" />
        </div>
      )}

      {hasSearchTerm && error && (
        <div className="rounded-[18px] border border-red-100 bg-red-50 p-5 text-[14px] font-medium text-red-700">
          {error}
        </div>
      )}

      {hasSearchTerm && !isLoading && !error && !hasResults && (
        <div className="soft-panel rounded-[20px] p-5">
          <p className="text-[15px] font-bold text-on-surface">
            Tidak ada hasil ditemukan
          </p>
          <p className="mt-2 text-[14px] text-on-surface-variant">
            Coba kata kunci lain atau periksa ejaannya.
          </p>
        </div>
      )}

      {hasResults && (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[14px] font-bold uppercase tracking-wide text-primary">
                  {group.label}
                </h2>
                <span className="text-[12px] font-semibold text-on-surface-variant">
                  {group.results.length} hasil
                </span>
              </div>

              <div className="space-y-2">
                {group.results.map((result) => (
                  <Link
                    key={`${group.key}-${result.id}`}
                    href={result.href}
                    onClick={onResultClick}
                    className="card-hover flex gap-3 rounded-[18px] border border-border/70 bg-white/82 p-3 hover:border-primary/30 hover:bg-white"
                  >
                    <ResultMedia result={result} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-on-surface">
                        {result.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-on-surface-variant">
                        {result.preview}
                      </p>
                      {result.meta && (
                        <p className="mt-2 text-[12px] font-bold text-primary">
                          {result.meta}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultMedia({ result }: { result: SearchResult }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-soft-gradient text-primary shadow-sm">
      {result.imageUrl ? (
        <img
          src={result.imageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className={cn("text-[18px] font-bold", "font-headline")}>
          {result.title.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
