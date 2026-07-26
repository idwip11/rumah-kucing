import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, CalendarDays, Clock, ShieldAlert } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { prisma } from "@/lib/prisma";

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { sections: { orderBy: { sortOrder: "asc" } } },
  });

  if (!article) {
    return { title: "Artikel tidak ditemukan" };
  }

  return {
    title: `${article.title} - Rumah Kucing`,
    description: article.summary ?? undefined,
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
      takeaways: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!article) {
    notFound();
  }

  // Fetch some recommended products
  const recommendedProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 md:pb-16 md:pt-28 lg:px-8">
      <Link href="/explore">
        <Button
          variant="ghost"
          className="mb-4 px-0 text-primary hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke Explore
        </Button>
      </Link>

      <article className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="premium-card overflow-hidden rounded-[26px]">
          <div className="relative aspect-[16/7] min-h-[260px] bg-muted">
            {article.heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.heroImage}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-100 to-amber-50">
                <span className="text-2xl font-bold text-primary">🐱</span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-muted-foreground">
              {article.category && (
                <span className="inline-flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-primary">
                  {article.category}
                </span>
              )}
              {article.readTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {article.readTime}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Update{" "}
                {new Date(article.updatedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
              {article.title}
            </h1>

            {article.author && (
              <p className="mt-2 text-sm text-muted-foreground">
                Oleh {article.author}
              </p>
            )}

            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {article.summary}
            </p>

            {/* Quick Takeaways */}
            {article.takeaways.length > 0 && (
              <section className="mt-7 rounded-[18px] border border-honey/70 bg-honey/30 p-5">
                <h2 className="text-lg font-bold">Ringkasan cepat</h2>
                <ul className="mt-3 grid gap-2">
                  {article.takeaways.map((takeaway) => (
                    <li
                      key={takeaway.id}
                      className="text-sm leading-6 text-muted-foreground"
                    >
                      • {takeaway.point}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Article Sections */}
            <div className="mt-8 space-y-7">
              {article.sections.map((section) => (
                <section key={section.id}>
                  <h2 className="text-2xl font-bold">{section.heading}</h2>
                  <MarkdownRenderer content={section.body} />
                </section>
              ))}
            </div>

            {/* Vet Warning */}
            {article.vetWarning && (
              <section className="mt-8 rounded-[18px] border border-rose-200 bg-rose-50 p-5 text-rose-950">
                <div className="flex gap-3">
                  <ShieldAlert
                    className="mt-1 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="text-lg font-bold">
                      Kapan perlu dokter hewan?
                    </h2>
                    <p className="mt-2 text-sm leading-6">
                      {article.vetWarning}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Source URL */}
            {article.sourceUrl && (
              <div className="mt-4">
                <Link
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline"
                >
                  Sumber asli →
                </Link>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <section className="premium-card rounded-[20px] p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-primary">
                  Follow-up personal
                </p>
                <h2 className="mt-1 text-lg font-bold">
                  Tanyakan kondisi kucingmu
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Setelah membaca artikel, kamu bisa lanjut bertanya ke Ketty AI
                  dengan konteks profil aktif seperti umur, ras, berat, dan
                  riwayat.
                </p>
              </div>
            </div>
            <Link href="/chat">
              <Button className="mt-4 w-full">Tanya Ketty AI</Button>
            </Link>
          </section>

          {recommendedProducts.length > 0 && (
            <section>
              <p className="mb-3 text-sm font-bold text-primary">
                Rekomendasi terkait
              </p>
              <div className="space-y-3">
                {recommendedProducts.slice(0, 2).map((product) => (
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
            </section>
          )}
        </aside>
      </article>
    </div>
  );
}
