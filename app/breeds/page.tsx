import { HeartHandshake, Search, ShoppingBag } from "lucide-react";
import { BreedCard } from "@/components/breed-card";
import { Button } from "@/components/ui/button";
import { catBreedGuides } from "@/lib/mock-data";

export default function BreedsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <p className="text-sm font-bold text-primary">Galeri ras kucing</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            Bandingkan ras sebelum adopt atau beli
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Setiap ras punya karakter, kebutuhan makan, harga awal, dan biaya perawatan yang
            berbeda. Bandingkan pilihan yang paling cocok untuk rumahmu, lalu lanjut cek
            ketersediaan kucing, opsi adopsi, atau kebutuhan awalnya.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <label className="flex h-12 items-center gap-3 rounded-md border border-input bg-background px-3">
            <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Cari British Shorthair, Persian, biaya murah..."
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {["First-time owner", "Budget ramah", "Bulu panjang", "Indoor", "Anak aktif"].map((tag) => (
              <button
                type="button"
                key={tag}
                className="rounded-md bg-muted px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {catBreedGuides.map((breed) => (
          <BreedCard key={breed.name} {...breed} />
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold text-primary">Siap pilih kucing?</p>
            <h2 className="mt-2 text-2xl font-bold">Temukan ras yang cocok sebelum adopt atau beli</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Bandingkan karakter dan gaya hidupnya",
              "Cek estimasi harga serta biaya bulanan",
              "Tanya stok, adopsi, atau perlengkapan awal"
            ].map((item) => (
              <div key={item} className="rounded-md bg-muted p-3">
                <ShoppingBag className="mb-2 h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-sm font-bold leading-5">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button>
            <HeartHandshake className="h-4 w-4" aria-hidden="true" />
            Konsultasi pilihan ras
          </Button>
          <Button variant="outline">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Cek kucing tersedia
          </Button>
        </div>
      </section>
    </div>
  );
}
