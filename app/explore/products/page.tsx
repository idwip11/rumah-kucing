"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { ProductsToolbar } from "@/components/products-toolbar";
import {
  buildProductTagOptions,
  normalizeProductTag,
} from "@/lib/product-tags";

export const dynamic = "force-dynamic";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

interface Product {
  id: string;
  name: string;
  category: string | null;
  priceIdr: number;
  imageUrl: string | null;
  tags: Array<{ id: string; tag: string }>;
}

interface TagOption {
  value: string;
  label: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  tags: TagOption[];
}

const PAGE_SIZE = 20;

function PaginationControls({
  currentPage,
  totalPages,
  baseUrl,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];

  pages.push(1);
  if (currentPage > 3) pages.push("...");

  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {/* Previous button */}
      <Link
        href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : baseUrl}
        className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
          currentPage === 1
            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
            : "border-border bg-card text-muted-foreground hover:bg-muted"
        }`}
      >
        ← Previous
      </Link>

      {/* Page numbers */}
      <div className="flex gap-1">
        {pages.map((page, index) =>
          typeof page === "string" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={`${baseUrl}?page=${page}`}
              className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                page === currentPage
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      {/* Next button */}
      <Link
        href={
          currentPage < totalPages
            ? `${baseUrl}?page=${currentPage + 1}`
            : baseUrl
        }
        className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
          currentPage === totalPages
            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
            : "border-border bg-card text-muted-foreground hover:bg-muted"
        }`}
      >
        Next →
      </Link>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productsData, setProductsData] = useState<ProductsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const tag = searchParams.get("tag") || "";
  const sort = searchParams.get("sort") || "";

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    if (tag) params.set("tag", tag);
    if (sort) params.set("sort", sort);

    try {
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load products");
      }
      const data: ProductsResponse = await response.json();
      setProductsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, tag, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const totalPages = productsData
    ? Math.ceil(productsData.total / PAGE_SIZE)
    : 0;

  // Build base URL without page param for pagination
  const baseParams = new URLSearchParams();
  if (tag) baseParams.set("tag", tag);
  if (sort) baseParams.set("sort", sort);
  const baseUrl = `/explore/products${baseParams.toString() ? `?${baseParams.toString()}` : ""}`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 md:pb-16 md:pt-28 lg:px-8">
      <div className="mb-6">
        <Link
          href="/explore"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Explore
        </Link>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Filters */}
        <aside className="hidden md:block w-full shrink-0 space-y-8 md:w-64">
          <div>
            <h3 className="mb-4 text-lg font-bold">Tag Produk</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/explore/products${sort ? `?sort=${sort}` : ""}`}
                className={
                  "rounded-full border px-3 py-1.5 text-xs transition-colors " +
                  (!tag
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted")
                }
              >
                Semua
              </Link>
              {productsData?.tags.map((t) => (
                <Link
                  key={t.value}
                  href={`/explore/products?tag=${encodeURIComponent(t.value)}${sort ? `&sort=${sort}` : ""}`}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs transition-colors " +
                    (tag === t.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-transparent text-muted-foreground hover:bg-muted")
                  }
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <ProductsToolbar
            tags={productsData?.tags || []}
            activeTag={tag}
            activeSort={sort}
          />

          <div className="mb-6 mt-6 flex items-center justify-between border-b border-border pb-4">
            <div className="text-sm text-muted-foreground">
              {loading ? (
                "Memuat..."
              ) : productsData ? (
                <>
                  Menampilkan {(page - 1) * PAGE_SIZE + 1}-
                  {Math.min(page * PAGE_SIZE, productsData.total)} dari{" "}
                  {productsData.total} produk
                </>
              ) : (
                "Memuat..."
              )}
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-xl border border-border bg-card p-4"
                >
                  <div className="mb-3 aspect-square w-full rounded-lg bg-muted" />
                  <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : productsData?.products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada produk pada filter ini.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {productsData?.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/explore/products/${product.id}`}
                    className="premium-card card-hover group relative flex flex-col overflow-hidden rounded-[20px]"
                  >
                    <div className="relative aspect-square w-full bg-muted/30 p-4">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-background text-muted-foreground/40">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 text-lg font-extrabold text-secondary">
                        {formatPrice(product.priceIdr)}
                      </div>
                      <h3 className="mb-2 line-clamp-2 flex-1 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                        {product.name}
                      </h3>
                      {product.category && (
                        <span className="text-xs text-muted-foreground">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                baseUrl={baseUrl}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
