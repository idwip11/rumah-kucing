"use client";

import { Search, X } from "lucide-react";
import {
  GlobalSearchResults,
  useGlobalSearch,
} from "@/components/global-search-dialog";

const SUGGESTED_SEARCHES = [
  "Hairball",
  "Kitten",
  "Steril",
  "British Shorthair",
  "Vaksin",
];

export function ExploreSearchCard() {
  const {
    query,
    setQuery,
    groups,
    isLoading,
    error,
    hasSearchTerm,
    hasResults,
  } = useGlobalSearch();

  return (
    <div className="premium-card rounded-[24px] p-5 sm:p-6">
      <label className="flex h-[54px] cursor-text items-center gap-3 rounded-2xl border border-input bg-white px-4 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <Search
          className="h-5 w-5 text-on-surface-variant"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-on-surface outline-none placeholder:text-on-surface-variant"
          placeholder="Cari artikel, produk, ras, jadwal, prestasi..."
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-on-surface-variant hover:bg-primary/7 hover:text-primary"
            aria-label="Hapus kata pencarian"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </label>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {SUGGESTED_SEARCHES.map((tag) => (
          <button
            type="button"
            className="btn-bounce rounded-full border border-border/70 bg-muted/45 px-4 py-2 text-[12px] font-bold text-on-surface-variant hover:border-primary/20 hover:bg-primary/6 hover:text-primary"
            key={tag}
            onClick={() => setQuery(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {(hasSearchTerm || isLoading) && (
        <GlobalSearchResults
          className="mt-4 max-h-[520px] rounded-[20px] border border-border/70 bg-white/60 px-3 py-3 md:px-4 md:py-4"
          error={error}
          groups={groups}
          hasResults={hasResults}
          hasSearchTerm={hasSearchTerm}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
