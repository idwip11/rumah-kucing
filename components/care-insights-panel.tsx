import Link from "next/link";
import {
  Brush,
  ChevronRight,
  Droplets,
  HeartPulse,
  Scale,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { CareInsight } from "@/lib/recommendations/types";

type CareInsightsPanelProps = {
  catName: string;
  insights: CareInsight[];
  isLoading?: boolean;
};

const INSIGHT_STYLES = {
  grooming: {
    icon: Brush,
    iconClassName: "bg-secondary/10 text-secondary",
  },
  weight: {
    icon: Scale,
    iconClassName: "bg-primary/10 text-primary",
  },
  hairball: {
    icon: Sparkles,
    iconClassName: "bg-secondary/10 text-secondary",
  },
  health: {
    icon: HeartPulse,
    iconClassName: "bg-rose-100 text-rose-700",
  },
  nutrition: {
    icon: Utensils,
    iconClassName: "bg-amber-100 text-amber-700",
  },
  hydration: {
    icon: Droplets,
    iconClassName: "bg-sky-100 text-sky-700",
  },
  vaccination: {
    icon: ShieldCheck,
    iconClassName: "bg-emerald-100 text-emerald-700",
  },
} as const;

const TONE_LABELS = {
  info: "Pengingat",
  attention: "Perlu perhatian",
  safety: "Perlu kehati-hatian",
} as const;

export function CareInsightsPanel({
  catName,
  insights,
  isLoading = false,
}: CareInsightsPanelProps) {
  return (
    <section className="premium-card rounded-[20px] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase text-primary">
            Ketty AI memperhatikan sesuatu
          </p>
          <h2 className="mt-1 font-headline text-xl font-extrabold text-on-surface">
            Insight perawatan {catName}
          </h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            Dihitung dari profil dan catatan Timeline terbaru.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-5 border-t border-border/70 pt-5 text-sm text-on-surface-variant">
          Menganalisis catatan terbaru...
        </p>
      ) : insights.length === 0 ? (
        <p className="mt-5 border-t border-border/70 pt-5 text-sm leading-6 text-on-surface-variant">
          Belum ada pola yang perlu diperhatikan. Lanjutkan mencatat perubahan
          berat, grooming, makanan, dan kondisi kesehatan {catName}.
        </p>
      ) : (
        <div className="mt-5 divide-y divide-border/70 border-t border-border/70">
          {insights.slice(0, 4).map((insight) => {
            const style = INSIGHT_STYLES[insight.category];
            const Icon = style.icon;

            return (
              <article
                key={insight.id}
                className="grid gap-3 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-start"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.iconClassName}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-headline text-base font-bold text-on-surface">
                      {insight.title}
                    </h3>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-on-surface-variant">
                      {TONE_LABELS[insight.tone]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-on-surface-variant">
                    {insight.description}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {insight.reason}
                  </p>
                </div>
                <Link
                  href={insight.href}
                  className="inline-flex min-h-9 items-center gap-1 text-sm font-bold text-primary hover:underline sm:justify-self-end"
                >
                  {insight.actionLabel}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
