import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ProductRecommendationPanel } from "@/components/product-recommendation-panel";
import { displayProductTag, normalizeProductTag } from "@/lib/product-tags";

export const dynamic = "force-dynamic";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!product) {
    notFound();
  }

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      OR: [
        { category: product.category ?? undefined },
        { tags: { some: { tag: { in: product.tags.map((t) => t.tag) } } } },
      ],
    },
    take: 4,
    include: { tags: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 md:pb-16 md:pt-28 lg:px-8">
      {/* Back button */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/explore/products"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground touch-target-min"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Produk
        </Link>
      </div>

      {/* Main product section - stacked on mobile, side-by-side on desktop */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-muted/30 p-4 sm:p-6">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-background text-muted-foreground/40">
              <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between">
          <div>
            {product.badge && (
              <span className="mb-2 sm:mb-3 w-fit rounded-md bg-amber-100 px-2 py-1 text-[10px] sm:text-xs font-bold text-amber-900">
                {product.badge}
              </span>
            )}
            <h1 className="font-headline text-xl sm:text-2xl font-bold text-on-surface leading-tight">
              {product.name}
            </h1>
            {product.category && (
              <p className="mt-1 text-sm text-muted-foreground">
                {product.category}
              </p>
            )}

            <div className="mt-3 sm:mt-4 flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current"
                />
              ))}
              <span className="ml-2 text-[11px] sm:text-xs text-muted-foreground">
                (Belum ada ulasan)
              </span>
            </div>

            <div className="mt-4 text-2xl font-extrabold text-secondary sm:mt-6 sm:text-3xl">
              {formatPrice(Number(product.priceIdr))}
            </div>

            {typeof product.stock === "number" && (
              <p className="mt-2 text-sm text-muted-foreground">
                Stok:{" "}
                {product.stock > 0 ? `${product.stock} tersedia` : "Habis"}
              </p>
            )}

            {/* Description */}
            {product.description && (
              <div className="mt-5 sm:mt-8">
                <h2 className="mb-2 text-base sm:text-lg font-bold">
                  Deskripsi Produk
                </h2>
                <div className="markdown-content text-sm leading-relaxed text-muted-foreground">
                  <MarkdownRenderer content={product.description} />
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/explore/products?tag=${encodeURIComponent(normalizeProductTag(t.tag))}`}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] sm:text-xs text-muted-foreground hover:bg-muted touch-target-min"
                  >
                    {displayProductTag(t.tag)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Add to cart button - sticky at bottom on mobile */}
          <div className="mt-4 sm:mt-6">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={Number(product.priceIdr)}
              imageUrl={product.imageUrl}
              variant="default"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <ProductRecommendationPanel productId={product.id} />

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold">
            Produk Terkait
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/explore/products/${r.id}`}
                className="premium-card card-hover touch-target-min flex flex-col overflow-hidden rounded-[20px] p-3 sm:p-4"
              >
                <div className="mb-2 sm:mb-3 flex aspect-square w-full items-center justify-center rounded-lg bg-muted/30 text-muted-foreground/40">
                  {r.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                  )}
                </div>
                <div className="text-sm font-extrabold text-secondary sm:text-base">
                  {formatPrice(Number(r.priceIdr))}
                </div>
                <h3 className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium leading-snug line-clamp-2">
                  {r.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
