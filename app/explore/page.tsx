import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  PawPrint,
  ShoppingBag,
} from "lucide-react";
import { ExploreSearchCard } from "@/components/explore-search-card";
import { ProductCard } from "@/components/product-card";
import { UpcomingEventsCarousel } from "@/components/upcoming-events-carousel";
import { Button } from "@/components/ui/button";
import { getLatestArticlePreviews } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatArticleDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function ExplorePage() {
  const [products, articles, events] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    getLatestArticlePreviews(8),
    prisma.event.findMany({
      where: { isActive: true },
      orderBy: { eventDate: "asc" },
    }),
  ]);

  return (
    <div className="pt-[120px] pb-[80px] px-6 md:px-[80px] max-w-[1440px] mx-auto w-full">
      <section className="mb-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow mb-2">PANDUAN UNTUK ANABUL</p>
          <h1 className="font-headline text-[34px] font-extrabold leading-[1.15] tracking-tight text-gradient-brand md:text-[44px]">
            Temukan jawaban untuk kebutuhan anabulmu
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-on-surface-variant max-w-[95%]">
            Cari artikel, tips perawatan, info event, dan rekomendasi produk
            yang relevan untuk kucingmu
          </p>
        </div>
        <ExploreSearchCard />
      </section>

      {/* Articles / educational content */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-headline text-[26px] font-bold text-primary">
            Artikel & Edukasi
          </h2>
          <Link
            href="/explore/products"
            className="text-[15px] font-bold text-primary hover:underline"
          >
            Lihat semua
          </Link>
        </div>
        {articles.length === 0 ? (
          <p className="text-[14px] text-on-surface-variant">
            Belum ada artikel. Konten edukasi akan muncul di sini setelah
            ditambahkan.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {articles.map((article) => (
              <article
                key={article.id}
                className="premium-card card-hover flex flex-col overflow-hidden rounded-[22px]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-soft-gradient">
                  {article.heroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.heroImage}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary/35">
                      <PawPrint className="h-9 w-9" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground">
                    <span className="rounded-full bg-rose/60 px-2.5 py-1 text-secondary">
                      {article.category ?? "Edukasi"}
                    </span>
                    {article.readTime && <span>{article.readTime}</span>}
                    <span>·</span>
                    <span>{formatArticleDate(article.updatedAt)}</span>
                  </div>
                  <h2 className="font-headline text-[18px] font-extrabold leading-snug text-on-surface">
                    {article.title}
                  </h2>
                  <p className="mb-5 mt-2 flex-grow text-[13px] leading-relaxed text-on-surface-variant">
                    {article.summary}
                  </p>
                  <Link
                    href={`/explore/${article.slug}`}
                    className="btn-bounce mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white py-3 text-center text-[13px] font-bold text-primary hover:bg-primary/5"
                  >
                    Baca artikel
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Cat care products */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[14px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Produk perawatan kucing
            </p>
            <h2 className="font-headline text-[26px] font-bold text-primary">
              Rekomendasi untuk anabul
            </h2>
          </div>
          <Link
            href="/explore/products"
            className="text-[15px] font-bold text-primary hover:underline"
          >
            Lihat produk lainnya
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-[14px] text-on-surface-variant">
            Belum ada produk. Rekomendasi perawatan akan muncul di sini setelah
            ditambahkan.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category ?? "Produk"}
                reason={product.reason ?? ""}
                price={new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(Number(product.priceIdr))}
                priceIdr={Number(product.priceIdr)}
                badge={product.badge ?? "Rekomendasi"}
                imageUrl={product.imageUrl}
              />
            ))}
          </div>
        )}
      </section>

      {/* Event Anabul */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Event Anabul
            </p>
            <h2 className="font-headline text-[26px] font-bold text-primary">
              Acara kucing mendatang
            </h2>
          </div>
        </div>
        {events.length === 0 ? (
          <p className="text-[14px] text-on-surface-variant">
            Belum ada event. Pantau terus untuk cat show, klinik kesehatan, dan
            festival adopsi terdekat.
          </p>
        ) : (
          <UpcomingEventsCarousel events={events} />
        )}
      </section>

      <section className="soft-panel relative mt-12 overflow-hidden rounded-[26px] p-7 shadow-soft md:p-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow mb-2">Mau pilih kucing baru?</p>
            <h2 className="font-headline text-[28px] md:text-[32px] font-bold text-on-surface tracking-tight">
              Bandingkan ras, biaya, dan kebutuhan makan
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-on-surface-variant">
              Dari artikel edukasi, user bisa lanjut ke galeri ras untuk melihat
              opsi adopt atau beli yang sesuai gaya hidup dan budget.
            </p>
          </div>
          <Link href="/breeds" className="shrink-0 mt-2 md:mt-0">
            <Button
              variant="warm"
              className="h-auto rounded-full px-8 py-4 text-[15px]"
            >
              <PawPrint className="h-5 w-5" aria-hidden="true" />
              Galeri ras
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
