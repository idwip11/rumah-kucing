import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brush,
  Droplets,
  HeartPulse,
  Utensils,
} from "lucide-react";
import type { DashboardRecommendationCard } from "@/lib/recommendations/types";

type PersonalizedRecommendationsProps = {
  catName: string;
  summary: string;
  cards: DashboardRecommendationCard[];
};

const CARD_STYLES = {
  nutrition: {
    icon: Utensils,
    iconClassName: "bg-primary/10 text-primary",
    eyebrow: "Nutrisi",
  },
  care: {
    icon: Brush,
    iconClassName: "bg-secondary/10 text-secondary",
    eyebrow: "Perawatan",
  },
  activity: {
    icon: Activity,
    iconClassName: "bg-success/10 text-success",
    eyebrow: "Aktivitas",
  },
  hydration: {
    icon: Droplets,
    iconClassName: "bg-sky-100 text-sky-700",
    eyebrow: "Hidrasi",
  },
  health: {
    icon: HeartPulse,
    iconClassName: "bg-rose-100 text-rose-700",
    eyebrow: "Perhatian",
  },
} as const;

export function PersonalizedRecommendations({
  catName,
  summary,
  cards,
}: PersonalizedRecommendationsProps) {
  if (cards.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline text-[22px] font-bold text-primary sm:text-[24px] md:text-[26px]">
            Rekomendasi untuk {catName}
          </h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            {summary}
          </p>
        </div>
        <Link
          href="/explore/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          Lihat pilihan produk
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const style = CARD_STYLES[card.type];
          const Icon = style.icon;

          return (
            <article
              key={card.id}
              className="premium-card card-hover flex min-h-[230px] flex-col rounded-[20px] p-5 sm:p-6"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconClassName}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase text-on-surface-variant">
                {style.eyebrow}
              </p>
              <h3 className="mt-1.5 font-headline text-lg font-bold leading-snug text-on-surface">
                {card.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-on-surface-variant">
                {card.description}
              </p>
              <Link
                href={card.href}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                {card.actionLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
