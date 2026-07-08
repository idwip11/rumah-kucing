import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, CalendarDays, Clock, ShieldAlert } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { articles, recommendedProducts } from "@/lib/mock-data";

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug
  }));
}

export function generateMetadata({ params }: ArticlePageProps) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    return {
      title: "Artikel tidak ditemukan"
    };
  }

  return {
    title: `${article.title} - Rumah Kucing`,
    description: article.summary
  };
}

export default function ArticleDetailPage({ params }: ArticlePageProps) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    notFound();
  }

  const Icon = article.icon;
  const contextualProducts =
    article.category === "Kesehatan" || article.title.toLowerCase().includes("hairball")
      ? recommendedProducts
      : recommendedProducts.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/explore">
        <Button variant="ghost" className="mb-4 px-0 text-primary hover:bg-transparent">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke Explore
        </Button>
      </Link>

      <article className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="relative aspect-[16/7] min-h-[260px] bg-muted">
            <Image
              src={article.heroImage}
              alt={article.heroAlt}
              fill
              priority
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {article.readTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Update {article.updatedAt}
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {article.summary}
            </p>

            <section className="mt-7 rounded-lg bg-muted p-4">
              <h2 className="text-lg font-bold">Ringkasan cepat</h2>
              <ul className="mt-3 grid gap-2">
                {article.quickTakeaways.map((takeaway) => (
                  <li key={takeaway} className="text-sm leading-6 text-muted-foreground">
                    {takeaway}
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-8 space-y-7">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-bold">{section.heading}</h2>
                  <p className="mt-3 text-base leading-8 text-muted-foreground">{section.body}</p>
                </section>
              ))}
            </div>

            <section className="mt-8 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-950">
              <div className="flex gap-3">
                <ShieldAlert className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-bold">Kapan perlu dokter hewan?</h2>
                  <p className="mt-2 text-sm leading-6">{article.vetWarning}</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-primary">Follow-up personal</p>
                <h2 className="mt-1 text-lg font-bold">Tanyakan kondisi kucingmu</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Setelah membaca artikel, kamu bisa lanjut bertanya ke Ketty AI dengan konteks
                  profil aktif seperti umur, ras, berat, dan riwayat.
                </p>
              </div>
            </div>
            <Link href="/chat">
              <Button className="mt-4 w-full">Tanya Ketty AI</Button>
            </Link>
          </section>

          <section>
            <p className="mb-3 text-sm font-bold text-primary">Rekomendasi terkait</p>
            <div className="space-y-3">
              {contextualProducts.slice(0, 2).map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          </section>
        </aside>
      </article>
    </div>
  );
}
