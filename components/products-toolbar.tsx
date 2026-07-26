"use client";

import Link from "next/link";
import {
  normalizeProductTag,
  type ProductTagOption,
} from "@/lib/product-tags";

type ProductsToolbarProps = {
  tags: ProductTagOption[];
  activeTag?: string;
  activeSort?: string;
};

function buildHref(tag?: string, sort?: string) {
  const sp = new URLSearchParams();
  const normalizedTag = normalizeProductTag(tag);
  if (normalizedTag) sp.set("tag", normalizedTag);
  if (sort && sort !== "newest") sp.set("sort", sort);
  const qs = sp.toString();
  return `/explore/products${qs ? `?${qs}` : ""}`;
}

export function ProductsToolbar({
  tags,
  activeTag,
  activeSort,
}: ProductsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Horizontal scrollable tags list - mobile only */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar flex-nowrap md:hidden -mx-4 px-4">
        <Link
          href="/explore/products"
          className={
            "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors " +
            (!activeTag
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-transparent text-muted-foreground hover:bg-muted")
          }
        >
          Semua
        </Link>
        {tags.map((t) => (
          <Link
            key={t.value}
            href={buildHref(t.value, activeSort)}
            className={
              "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors " +
              (normalizeProductTag(activeTag) === t.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-transparent text-muted-foreground hover:bg-muted")
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Spacer for desktop layout alignment when tags are hidden */}
      <div className="hidden md:block" />

      {/* Sort Select */}
      <div className="flex w-full items-center justify-end md:w-auto">
        <select
          className="w-full cursor-pointer rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none hover:text-foreground md:w-auto"
          value={activeSort ?? "newest"}
          onChange={(e) => {
            window.location.href = buildHref(activeTag, e.target.value);
          }}
        >
          <option value="newest">Urutkan menurut yang terbaru</option>
          <option value="price-asc">Urutkan dari termurah</option>
          <option value="price-desc">Urutkan dari termahal</option>
        </select>
      </div>
    </div>
  );
}
