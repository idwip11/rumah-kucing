"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CatProfileCard } from "@/components/cat-profile-card";
import { PersonalizedRecommendations } from "@/components/personalized-recommendations";
import { ProductCard } from "@/components/product-card";
import { useCatStore } from "@/store/use-cat-store";
import { getUpcomingWeekEvents } from "@/app/actions/timeline";
import type { DashboardRecommendationCard } from "@/lib/recommendations/types";

// Shape of an article card on the dashboard. Mirrors the Article model so the
// UI is ready to consume real data once the articles backend is connected.
type DashboardArticle = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  readTime: string | null;
  summary: string | null;
  heroImage: string | null;
  updatedAt: string;
};

async function fetchLatestArticles(limit = 4): Promise<DashboardArticle[]> {
  const res = await fetch(`/api/articles?limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const body = (await res.json()) as { articles?: DashboardArticle[] };
  return body.articles ?? [];
}

function formatArticleDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getBirthdayHeadline(
  catName: string,
  estimatedDateOfBirth?: string | null,
) {
  if (!estimatedDateOfBirth) return null;

  const birthDate = new Date(estimatedDateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  const isBirthdayToday =
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() === birthDate.getDate();

  if (!isBirthdayToday) return null;

  let years = today.getFullYear() - birthDate.getFullYear();
  const hasReachedBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasReachedBirthdayThisYear) {
    years -= 1;
  }

  if (years >= 1) {
    return `Selamat ulang tahun ${catName} ke-${years} tahun!`;
  }

  const months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());

  return `Selamat ulang tahun ${catName} ke-${Math.max(months, 0)} bulan!`;
}

// Shape of a recommended product card on the dashboard. Mirrors the Product
// model so the UI is ready to consume real data once the backend exists.
type DashboardProduct = {
  id: string;
  name: string;
  category: string;
  reason: string;
  price: string;
  priceIdr: number;
  badge: string;
  imageUrl?: string | null;
  href: string;
  matchLabel?: string;
  matchReasons?: string[];
  matchCautions?: string[];
  safetyWarning?: string;
};

type ProductApiItem = {
  id: string;
  name: string;
  category: string | null;
  priceIdr: number;
  reason: string | null;
  description: string | null;
  badge: string | null;
  imageUrl: string | null;
  match?: {
    label: string;
    reasons: string[];
    benefits: string[];
    suitableFor: string[];
    cautions: string[];
    safetyWarning?: string;
  };
};

type DashboardRecommendationResponse = {
  cat: {
    id: string;
    name: string;
  };
  summary: string;
  cards: DashboardRecommendationCard[];
};

function formatProductPrice(priceIdr: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(priceIdr)
    .replace(/\s/g, "");
}

async function fetchRecommendedProducts(
  catId?: string,
): Promise<DashboardProduct[]> {
  const endpoint = catId
    ? `/api/recommendations/products?catId=${encodeURIComponent(catId)}&limit=3`
    : "/api/products?limit=3";
  const res = await fetch(endpoint, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const body = (await res.json()) as { products?: ProductApiItem[] };
  return (body.products ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category ?? "Produk",
    reason:
      product.match?.reasons[0] ??
      product.reason ??
      product.description ??
      "Lihat detail produk untuk informasi lengkap.",
    price: formatProductPrice(product.priceIdr),
    priceIdr: product.priceIdr,
    badge: product.badge ?? "Rekomendasi",
    imageUrl: product.imageUrl,
    href: `/explore/products/${product.id}`,
    matchLabel: product.match?.label,
    matchReasons: product.match?.reasons,
    matchCautions: product.match?.cautions,
    safetyWarning: product.match?.safetyWarning,
  }));
}

async function fetchDashboardRecommendations(
  catId: string,
): Promise<DashboardRecommendationResponse | null> {
  const res = await fetch(
    `/api/recommendations/dashboard?catId=${encodeURIComponent(catId)}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  return (await res.json()) as DashboardRecommendationResponse;
}

export default function DashboardPage() {
  const activeCat = useCatStore((state) => state.activeCat());
  const catName = activeCat?.name ?? "Anabul";
  const heroCatImage =
    activeCat?.photoUrl || "/images/cat-silhouette-placeholder.svg";
  const birthdayHeadline = getBirthdayHeadline(
    catName,
    activeCat?.estimatedDateOfBirth,
  );

  const [weekEvents, setWeekEvents] = useState<any[]>([]);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);

  const [latestArticles, setLatestArticles] = useState<DashboardArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

  const [recommendedProducts, setRecommendedProducts] = useState<
    DashboardProduct[]
  >([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [recommendationSummary, setRecommendationSummary] = useState("");
  const [recommendationCards, setRecommendationCards] = useState<
    DashboardRecommendationCard[]
  >([]);

  useEffect(() => {
    if (!activeCat?.id) {
      setWeekEvents([]);
      return;
    }

    const loadWeek = async () => {
      try {
        setIsLoadingWeek(true);
        const events = await getUpcomingWeekEvents(activeCat.id);
        setWeekEvents(events);
      } catch (err) {
        console.error("Gagal memuat jadwal minggu ini:", err);
        setWeekEvents([]);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    loadWeek();
  }, [activeCat?.id]);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoadingArticles(true);
        const articles = await fetchLatestArticles(4);
        setLatestArticles(articles);
      } catch (err) {
        console.error("Gagal memuat artikel:", err);
        setLatestArticles([]);
      } finally {
        setIsLoadingArticles(false);
      }
    };
    loadArticles();
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const products = await fetchRecommendedProducts(activeCat?.id);
        if (isCurrent) setRecommendedProducts(products);
      } catch (err) {
        console.error("Gagal memuat produk rekomendasi:", err);
        if (isCurrent) setRecommendedProducts([]);
      } finally {
        if (isCurrent) setIsLoadingProducts(false);
      }
    };

    loadProducts();
    return () => {
      isCurrent = false;
    };
  }, [activeCat?.id]);

  useEffect(() => {
    let isCurrent = true;

    if (!activeCat?.id) {
      setRecommendationSummary("");
      setRecommendationCards([]);
      return;
    }

    const loadRecommendations = async () => {
      try {
        const recommendations = await fetchDashboardRecommendations(
          activeCat.id,
        );
        if (!isCurrent) return;

        setRecommendationSummary(recommendations?.summary ?? "");
        setRecommendationCards(recommendations?.cards ?? []);
      } catch (err) {
        console.error("Gagal memuat rekomendasi dashboard:", err);
        if (isCurrent) {
          setRecommendationSummary("");
          setRecommendationCards([]);
        }
      }
    };

    loadRecommendations();
    return () => {
      isCurrent = false;
    };
  }, [activeCat?.id]);

  const calculateProfileCompletion = () => {
    if (!activeCat) return 0;
    const fields = [
      activeCat.name,
      activeCat.breed,
      activeCat.age,
      activeCat.weight,
      activeCat.gender,
      activeCat.lifestyle,
      activeCat.note,
    ];
    const filledFields = fields.filter((field) => field && field !== "");
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const isProfileComplete = profileCompletion === 100;

  return (
    <div className="pt-[80px] pb-[80px] sm:pt-[100px] sm:pb-[100px] md:pt-[120px] md:pb-[80px] px-4 sm:px-6 md:px-8 lg:px-10 max-w-[1440px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6 sm:gap-8">
          {/* Hero Section */}
          <section className="soft-panel relative overflow-hidden rounded-[28px] p-4 sm:p-7 md:p-10 lg:p-12">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-10">
              <div className="relative aspect-square w-full overflow-hidden rounded-[22px] border-4 border-white/75 shadow-[0_20px_48px_hsl(var(--secondary)/0.15)] md:aspect-[4/3] md:w-[45%]">
                <Image
                  src={heroCatImage}
                  alt={`Foto ${catName}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="w-full md:w-[55%] flex flex-col justify-center">
                <h1 className="font-headline text-[28px] font-extrabold leading-[1.15] tracking-tight text-gradient-brand sm:text-[34px] md:text-[40px] md:leading-[1.1] lg:text-[46px]">
                  {birthdayHeadline ?? (
                    <>
                      Apa kabar
                      <br />
                      {catName} hari ini?
                    </>
                  )}
                </h1>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] leading-[1.5] text-on-surface-variant mb-6 sm:mb-8 max-w-[95%]">
                  Cek jadwal, catatan kesehatan, dan kebutuhan {catName} agar
                  hari-harinya tetap nyaman dan bahagia.
                </p>

                {/* Quick Progress Tracker */}
                <div className="premium-card rounded-[20px] p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[14px] sm:text-[16px] font-semibold text-on-surface">
                      Kelengkapan Profil
                    </span>
                    <span className="text-[13px] sm:text-[14px] text-primary font-bold">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-brand-gradient shadow-[0_2px_8px_hsl(var(--primary)/0.22)] transition-all duration-1000 ease-out"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <p className="text-[13px] sm:text-[14px] text-on-surface-variant">
                    {isProfileComplete
                      ? `Profil ${catName} sudah lengkap. Sekarang kami bisa memberikan saran yang lebih sesuai untuknya.`
                      : "Tinggal menambahkan beberapa data profil terakhir."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Weekly Schedule Section */}
          <section>
            <div className="flex justify-between items-end mb-4 sm:mb-6">
              <h2 className="font-headline text-[22px] sm:text-[24px] md:text-[26px] font-bold text-primary">
                Jadwal Minggu ini
              </h2>
              <Link
                href="/timeline"
                className="text-[14px] sm:text-[15px] font-bold text-primary hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            {isLoadingWeek ? (
              <p className="text-[14px] text-on-surface-variant">
                Memuat jadwal...
              </p>
            ) : weekEvents.length === 0 ? (
              <div className="premium-card rounded-[20px] p-4 sm:p-6">
                <p className="text-[14px] text-on-surface-variant">
                  Tidak ada jadwal untuk {catName} dalam 7 hari ke depan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {weekEvents.slice(0, 6).map((event) => (
                  <div
                    key={event.id}
                    className="premium-card card-hover flex flex-col rounded-[20px] p-4 sm:p-6"
                  >
                    <div className="flex justify-between items-start mb-4 sm:mb-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose text-secondary sm:h-12 sm:w-12">
                        <span className="material-symbols-outlined text-[20px] sm:text-[unset]">
                          event
                        </span>
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-honey/70 px-2.5 py-1 text-[11px] font-bold text-warning sm:px-3 sm:py-1.5 sm:text-[12px]">
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "short",
                        }).format(new Date(event.eventDate))}
                      </span>
                    </div>
                    <h3 className="font-headline text-[16px] sm:text-[18px] font-bold text-on-surface mb-1">
                      {event.title}
                    </h3>
                    <p className="text-[13px] sm:text-[14px] text-on-surface-variant flex-grow mb-4 sm:mb-6 line-clamp-2">
                      {event.description || event.category}
                    </p>
                    <Link
                      href="/timeline"
                      className="btn-bounce touch-target-min w-full rounded-xl border border-primary/20 bg-white py-2.5 text-center text-[13px] font-bold text-primary hover:bg-primary/5 sm:py-3 sm:text-[14px]"
                    >
                      Lihat di Timeline
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
          <CatProfileCard />

          {/* Insight Card */}
          <section className="soft-panel relative overflow-hidden rounded-[26px] p-6 shadow-soft sm:p-8">
            <div className="absolute -right-6 -bottom-8 opacity-[0.04]">
              <span className="material-symbols-outlined text-[150px]">
                info
              </span>
            </div>
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-2 text-secondary sm:mb-4 sm:gap-3">
                <span
                  className="material-symbols-outlined text-[20px] sm:text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
                <h3 className="font-headline text-[16px] sm:text-[18px] font-bold">
                  Tips hidrasi untuk {catName}
                </h3>
              </div>
              <p className="text-[14px] sm:text-[15px] text-on-surface-variant mb-4 sm:mb-6 leading-relaxed">
                Kucing cenderung tidak banyak minum. Pastikan {catName} selalu
                memiliki akses ke air bersih dan pertimbangkan makanan basah
                sebagai bagian dari kebutuhan cairan hariannya.
              </p>
              <Link
                href="/explore/products?tag=hydration"
                className="flex items-center gap-1.5 text-[13px] font-bold text-secondary hover:text-secondary/80 sm:text-[14px]"
              >
                Lihat pilihan hidrasi{" "}
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {activeCat && recommendationCards.length > 0 && (
        <div className="mt-8 sm:mt-10">
          <PersonalizedRecommendations
            catName={activeCat.name}
            summary={recommendationSummary}
            cards={recommendationCards}
          />
        </div>
      )}

      {/* Articles & Products row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mt-8 sm:mt-10">
        {/* Articles & Tips - left */}
        <section className="lg:col-span-7">
          <div className="flex justify-between items-end mb-4 sm:mb-6">
            <h2 className="font-headline text-[22px] sm:text-[24px] md:text-[26px] font-bold text-primary">
              Artikel & Edukasi
            </h2>
            <Link
              href="/explore"
              className="text-[14px] sm:text-[15px] font-bold text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          {isLoadingArticles ? (
            <div className="premium-card rounded-[20px] p-4 sm:p-6">
              <p className="text-[14px] text-on-surface-variant">
                Memuat artikel terbaru...
              </p>
            </div>
          ) : latestArticles.length === 0 ? (
            <div className="premium-card rounded-[20px] p-4 sm:p-6">
              <p className="text-[14px] text-on-surface-variant">
                Belum ada artikel. Konten edukasi akan muncul di sini setelah
                ditambahkan dari Admin Panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {latestArticles.map((article) => (
                <article
                  key={article.id}
                  className="premium-card card-hover flex flex-col overflow-hidden rounded-[22px]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-soft-gradient">
                    {article.heroImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.heroImage}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#fcfaf5] text-primary">
                        <span className="material-symbols-outlined text-[40px]">
                          article
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] sm:text-[13px] font-bold text-on-surface-variant">
                      <span>{article.category ?? "Edukasi"}</span>
                      {article.readTime && (
                        <>
                          <span>·</span>
                          <span>{article.readTime}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{formatArticleDate(article.updatedAt)}</span>
                    </div>
                    <h3 className="font-headline text-[17px] sm:text-[19px] font-bold text-on-surface mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-[13px] sm:text-[14px] leading-relaxed text-on-surface-variant flex-grow mb-4 sm:mb-6 line-clamp-3">
                      {article.summary ?? "Baca panduan lengkapnya di sini."}
                    </p>
                    <Link
                      href={`/explore/${article.slug}`}
                      className="btn-bounce touch-target-min mt-auto w-full rounded-xl border border-primary/20 bg-white py-2.5 text-center text-[13px] font-bold text-primary hover:bg-primary/5 sm:py-3 sm:text-[14px]"
                    >
                      Read More
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Recommended Products - far right */}
        <section className="lg:col-span-5">
          <div className="flex justify-between items-end mb-4 sm:mb-6">
            <h2 className="font-headline text-[22px] sm:text-[24px] md:text-[26px] font-bold text-primary">
              Produk Rekomendasi Untuk {catName}
            </h2>
            <Link
              href="/explore/products"
              className="text-[14px] sm:text-[15px] font-bold text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="premium-card rounded-[20px] p-4 sm:p-6">
              <p className="text-[14px] text-on-surface-variant">
                Menyiapkan pilihan untuk {catName}...
              </p>
            </div>
          ) : recommendedProducts.length === 0 ? (
            <div className="premium-card rounded-[20px] p-4 sm:p-6">
              <p className="text-[14px] text-on-surface-variant">
                Belum ada produk rekomendasi yang tersedia.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  matchCatName={activeCat?.name}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
