import Link from "next/link";
import { ArrowRight, PawPrint, Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { articles, recommendedProducts } from "@/lib/mock-data";

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold text-primary">Pusat edukasi</p>
          <h1 className="mt-2 text-3xl font-bold">Belajar dari masalah yang sedang dihadapi</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Konten disusun agar mudah ditemukan mesin pencari, tetapi tetap terasa personal ketika
            pengguna sudah punya profil kucing aktif.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <label className="flex h-12 items-center gap-3 rounded-md border border-input bg-background px-3">
            <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Cari ras, gejala, makanan, atau perawatan..."
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Hairball", "Kitten", "Steril", "British Shorthair", "Vaksin"].map((tag) => (
              <button
                type="button"
                className="rounded-md bg-muted px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                key={tag}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => {
          const Icon = article.icon;
          return (
            <article key={article.title} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-800">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <span>{article.category}</span>
                <span>·</span>
                <span>{article.readTime}</span>
              </div>
              <h2 className="mt-2 text-lg font-bold leading-snug">{article.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{article.summary}</p>
              <Link href={`/explore/${article.slug}`}>
                <Button variant="ghost" className="mt-4 px-0 text-primary hover:bg-transparent">
                  Baca
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-sm font-bold text-primary">Contoh sisipan produk</p>
          <h2 className="mt-2 text-2xl font-bold">Setelah membaca artikel hairball</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Area ini mensimulasikan e-commerce kontekstual: rekomendasi muncul sebagai kelanjutan
            dari edukasi, bukan pop-up.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-primary">Mau pilih kucing baru?</p>
            <h2 className="mt-1 text-2xl font-bold">Bandingkan ras, biaya, dan kebutuhan makan</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Dari artikel edukasi, user bisa lanjut ke galeri ras untuk melihat opsi adopt atau
              beli yang sesuai gaya hidup dan budget.
            </p>
          </div>
          <Link href="/breeds">
            <Button>
              <PawPrint className="h-4 w-4" aria-hidden="true" />
              Galeri ras
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
