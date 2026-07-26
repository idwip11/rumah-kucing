"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Info,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useCatStore } from "@/store/use-cat-store";
import { RecommendationFeedbackControls } from "@/components/recommendation-feedback-controls";
import type {
  CatLifeStage,
  CoatLength,
  CatLifestyle,
  RecommendationMatchLabel,
  RecommendationFeedbackResponse,
} from "@/lib/recommendations/types";

type ProductRecommendationResponse = {
  cat: {
    id: string;
    name: string;
  };
  profile: {
    lifeStage: CatLifeStage;
    breedName: string | null;
    coatLength: CoatLength;
    isSterilized: boolean;
    lifestyle: CatLifestyle;
    weightKg: number | null;
    dietaryAvoidances: string[];
  };
  match: {
    label: RecommendationMatchLabel;
    reasons: string[];
    benefits: string[];
    suitableFor: string[];
    cautions: string[];
    safetyWarning?: string;
  };
  feedback: {
    id: string;
    response: RecommendationFeedbackResponse;
    note: string | null;
    updatedAt: string;
  } | null;
};

type ProductRecommendationPanelProps = {
  productId: string;
};

const MATCH_STYLES: Record<RecommendationMatchLabel, string> = {
  "Sangat cocok": "bg-emerald-100 text-emerald-800",
  Cocok: "bg-primary/10 text-primary",
  "Cukup cocok": "bg-sky-100 text-sky-800",
  "Kurang sesuai": "bg-amber-100 text-amber-800",
  "Tidak direkomendasikan": "bg-rose-100 text-rose-800",
};

function ProfileSummary({
  data,
}: {
  data: ProductRecommendationResponse;
}) {
  const lifeStageLabel =
    data.profile.lifeStage === "adult"
      ? "dewasa"
      : data.profile.lifeStage;
  const facts = [
    data.profile.lifeStage !== "unknown"
      ? lifeStageLabel
      : null,
    data.profile.breedName,
    data.profile.isSterilized ? "sudah steril" : null,
    data.profile.lifestyle !== "unknown"
      ? data.profile.lifestyle
      : null,
  ].filter(Boolean);

  return (
    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
      Penilaian menggunakan profil {data.cat.name}
      {facts.length > 0 ? `: ${facts.join(", ")}` : ""} serta catatan Timeline
      terbaru.
    </p>
  );
}

export function ProductRecommendationPanel({
  productId,
}: ProductRecommendationPanelProps) {
  const activeCat = useCatStore((state) => state.activeCat());
  const [data, setData] = useState<ProductRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeCat?.id) {
      setData(null);
      setError("");
      return;
    }

    let isCurrent = true;
    const loadExplanation = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetch(
          `/api/recommendations/products/${encodeURIComponent(productId)}?catId=${encodeURIComponent(activeCat.id)}`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.error || "Gagal memuat penjelasan rekomendasi");
        }

        if (isCurrent) setData(body as ProductRecommendationResponse);
      } catch (loadError) {
        console.error("Gagal memuat penjelasan rekomendasi:", loadError);
        if (isCurrent) {
          setData(null);
          setError("Penjelasan rekomendasi belum dapat dimuat.");
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadExplanation();
    return () => {
      isCurrent = false;
    };
  }, [activeCat?.id, feedbackVersion, productId]);

  if (!activeCat) {
    return (
      <section className="mt-8 border-y border-border/70 py-6 sm:mt-10 sm:py-8">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Penjelasan rekomendasi personal
            </h2>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              Masuk dan pilih profil kucing untuk melihat alasan kecocokan,
              manfaat, perhatian khusus, dan tipe kucing yang sesuai.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading && !data) {
    return (
      <section className="mt-8 border-y border-border/70 py-8 sm:mt-10">
        <p className="text-sm text-on-surface-variant">
          Menilai produk untuk {activeCat.name}...
        </p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="mt-8 border-y border-border/70 py-6 sm:mt-10">
        <p className="text-sm text-rose-700">{error}</p>
      </section>
    );
  }

  const isMedical = Boolean(data.match.safetyWarning);

  return (
    <section className="soft-panel mt-8 overflow-hidden rounded-[20px] sm:mt-10">
      <div className="border-b border-border/70 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Penjelasan personal
            </p>
            <h2 className="mt-2 font-headline text-xl font-extrabold text-on-surface sm:text-2xl">
              {isMedical
                ? `Penilaian khusus untuk ${data.cat.name}`
                : `Mengapa produk ini dinilai untuk ${data.cat.name}?`}
            </h2>
            <ProfileSummary data={data} />
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${MATCH_STYLES[data.match.label]}`}
          >
            {data.match.label}
          </span>
        </div>
      </div>

      {data.match.safetyWarning && (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-5 text-rose-900 sm:px-7">
          <div className="flex items-start gap-3">
            <ShieldAlert
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-bold">Perlu rekomendasi dokter hewan</h3>
              <p className="mt-1 text-sm leading-6">
                {data.match.safetyWarning}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="border-b border-border/70 px-5 py-6 sm:px-7 lg:border-b-0 lg:border-r">
          <h3 className="flex items-center gap-2 font-headline text-base font-bold text-on-surface">
            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
            Alasan penilaian
          </h3>
          <ul className="mt-4 space-y-3">
            {data.match.reasons.map((reason) => (
              <li
                key={reason}
                className="flex gap-2.5 text-sm leading-6 text-on-surface-variant"
              >
                <CheckCircle2
                  className="mt-1 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-b border-border/70 px-5 py-6 sm:px-7 lg:border-b-0">
          <h3 className="flex items-center gap-2 font-headline text-base font-bold text-on-surface">
            <HeartPulse className="h-5 w-5 text-secondary" aria-hidden="true" />
            Manfaat utama
          </h3>
          <ul className="mt-4 space-y-3">
            {data.match.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex gap-2.5 text-sm leading-6 text-on-surface-variant"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid border-t border-border/70 lg:grid-cols-2">
        <div className="border-b border-border/70 px-5 py-6 sm:px-7 lg:border-b-0 lg:border-r">
          <h3 className="flex items-center gap-2 font-headline text-base font-bold text-on-surface">
            <AlertTriangle
              className="h-5 w-5 text-amber-700"
              aria-hidden="true"
            />
            Perlu diperhatikan
          </h3>
          {data.match.cautions.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {data.match.cautions.map((caution) => (
                <li
                  key={caution}
                  className="flex gap-2.5 text-sm leading-6 text-on-surface-variant"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                  <span>{caution}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-on-surface-variant">
              Tidak ada batasan khusus yang tercatat dari profil dan data
              produk saat ini. Tetap ikuti petunjuk penggunaan pada kemasan.
            </p>
          )}
        </div>

        <div className="px-5 py-6 sm:px-7">
          <h3 className="flex items-center gap-2 font-headline text-base font-bold text-on-surface">
            <Info className="h-5 w-5 text-primary" aria-hidden="true" />
            Cocok untuk
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.match.suitableFor.map((item) => (
              <span
                key={item}
                className="rounded-full border border-primary/20 bg-white px-3 py-1.5 text-xs font-semibold text-primary"
              >
                {item}
              </span>
            ))}
          </div>
          {data.profile.dietaryAvoidances.length > 0 && (
            <p className="mt-4 text-xs leading-5 text-on-surface-variant">
              Catatan sensitivitas {data.cat.name}:{" "}
              {data.profile.dietaryAvoidances.join(", ")}.
            </p>
          )}
        </div>
      </div>

      <RecommendationFeedbackControls
        catId={data.cat.id}
        catName={data.cat.name}
        productId={productId}
        currentFeedback={data.feedback}
        onChanged={() => setFeedbackVersion((current) => current + 1)}
      />
    </section>
  );
}
