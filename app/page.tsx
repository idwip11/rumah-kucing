import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, MessageCircle, ShieldCheck } from "lucide-react";
import { CatProfileCard } from "@/components/cat-profile-card";
import { ProductCard } from "@/components/product-card";
import { SolutionCard } from "@/components/solution-card";
import { Button } from "@/components/ui/button";
import { recommendedProducts, solutionActions } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="grid min-h-[360px] gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex flex-col justify-between p-5 sm:p-7">
              <div>
                <p className="text-sm font-bold text-primary">Dashboard hari ini</p>
                <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
                  Apa yang ingin kamu lakukan untuk Mochi?
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                  Mulai dari cek gejala, belajar perawatan, mencatat momen, sampai belanja
                  kebutuhan yang relevan dengan kondisi kucing.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-teal-50 p-3 text-teal-900">
                  <ShieldCheck className="mb-2 h-5 w-5" aria-hidden="true" />
                  <p className="text-sm font-bold">Triage dulu</p>
                  <p className="mt-1 text-xs leading-5">Bantu putuskan perlu dokter atau pantau.</p>
                </div>
                <div className="rounded-md bg-rose-50 p-3 text-rose-900">
                  <MessageCircle className="mb-2 h-5 w-5" aria-hidden="true" />
                  <p className="text-sm font-bold">Personal</p>
                  <p className="mt-1 text-xs leading-5">Jawaban mengikuti profil dan riwayat.</p>
                </div>
                <div className="rounded-md bg-amber-50 p-3 text-amber-950">
                  <CalendarClock className="mb-2 h-5 w-5" aria-hidden="true" />
                  <p className="text-sm font-bold">Tercatat</p>
                  <p className="mt-1 text-xs leading-5">Vaksin, berat, makanan, dan memori.</p>
                </div>
              </div>
            </div>
            <div className="relative min-h-[280px] lg:min-h-full">
              <Image
                src="/images/cat-care-dashboard.png"
                alt="Ilustrasi dashboard perawatan kucing di rumah"
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <CatProfileCard />
          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-primary">Langkah cepat</p>
                <h2 className="mt-1 text-lg font-bold">Profil belum lengkap?</h2>
              </div>
              <Link href="/onboarding">
                <Button variant="warm" size="sm">
                  Lengkapi
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
            <div className="mt-4 h-2 rounded-full bg-muted">
              <div className="h-2 w-3/4 rounded-full bg-accent" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Tambahkan riwayat vaksin dan makanan agar rekomendasi makin presisi.
            </p>
          </section>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-primary">Aksi berbasis solusi</p>
            <h2 className="text-2xl font-bold">Pilih kebutuhan hari ini</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {solutionActions.map((action) => (
            <SolutionCard key={action.title} {...action} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-sm font-bold text-primary">Kontekstual, bukan hard selling</p>
          <h2 className="mt-2 text-2xl font-bold">Rekomendasi muncul setelah ada alasan</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Produk di bawah ini diposisikan sebagai tindak lanjut dari kebutuhan Mochi, misalnya
            riwayat hairball, hidrasi, atau rutinitas preventif.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}
