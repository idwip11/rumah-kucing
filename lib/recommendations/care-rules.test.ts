import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeTimelineCareSignals,
  buildCareInsights,
} from "@/lib/recommendations/care-rules";
import { evaluateProductMatch } from "@/lib/recommendations/product-rules";
import type {
  DerivedCatProfile,
  RecommendationTimelineEvent,
} from "@/lib/recommendations/types";

const NOW = new Date("2026-07-26T12:00:00+08:00");

const profile: DerivedCatProfile = {
  id: "cat-1",
  name: "Snowy",
  ageMonths: 42,
  lifeStage: "adult",
  breedName: "Persia",
  breedSlug: "persia",
  coatLength: "long",
  isSterilized: true,
  lifestyle: "indoor",
  weightKg: 3.5,
  dietaryAvoidances: [],
  priorities: ["hydration", "life-stage", "weight", "coat", "activity"],
};

function event(
  overrides: Partial<RecommendationTimelineEvent>,
): RecommendationTimelineEvent {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Catatan",
    eventDate: overrides.eventDate ?? "2026-07-20T00:00:00.000Z",
    description: overrides.description ?? null,
    category: overrides.category ?? "Lainnya",
    status: overrides.status ?? "Tercatat",
  };
}

test("creates grooming and weight reminders from stale timeline records", () => {
  const signals = analyzeTimelineCareSignals(
    [
      event({
        id: "grooming",
        category: "Grooming",
        eventDate: "2026-07-10T00:00:00.000Z",
      }),
      event({
        id: "weight",
        category: "Berat_badan",
        title: "Berat 3,5 kg",
        eventDate: "2026-06-01T00:00:00.000Z",
      }),
    ],
    NOW,
  );
  const insights = buildCareInsights(profile, signals);

  assert.equal(signals.daysSinceGrooming, 16);
  assert.equal(signals.daysSinceWeight, 55);
  assert.ok(insights.some((item) => item.id === "grooming-due"));
  assert.ok(insights.some((item) => item.id === "weight-check-due"));
});

test("detects repeated hairball without treating it as a general illness", () => {
  const signals = analyzeTimelineCareSignals(
    [
      event({
        id: "hairball-1",
        title: "Muntah hairball",
        eventDate: "2026-07-22T00:00:00.000Z",
      }),
      event({
        id: "hairball-2",
        title: "Hairball kembali",
        eventDate: "2026-07-12T00:00:00.000Z",
      }),
    ],
    NOW,
  );
  const insights = buildCareInsights(profile, signals);

  assert.equal(signals.hairballEvents30d, 2);
  assert.equal(signals.recentIllnessEvents30d, 0);
  assert.equal(insights[0]?.id, "repeated-hairball");
});

test("extracts weight change from a single structured note", () => {
  const signals = analyzeTimelineCareSignals(
    [
      event({
        id: "weight-change",
        category: "Berat_badan",
        title: "Berat badan naik",
        description: "Snowy naik dari 3,2 kg ke 3,6 kg dalam dua bulan.",
        eventDate: "2026-07-20T00:00:00.000Z",
      }),
    ],
    NOW,
  );
  const insights = buildCareInsights(profile, signals);

  assert.equal(signals.previousWeightKg, 3.2);
  assert.equal(signals.latestWeightKg, 3.6);
  assert.equal(signals.weightChangeKg, 0.4);
  assert.ok(insights.some((item) => item.id === "weight-change"));
});

test("ignores future events and marks recent health history as safety context", () => {
  const signals = analyzeTimelineCareSignals(
    [
      event({
        id: "future-grooming",
        category: "Grooming",
        status: "Mendatang",
        eventDate: "2026-08-02T00:00:00.000Z",
      }),
      event({
        id: "illness",
        category: "Riwayat_sakit",
        title: "Nafsu makan berkurang",
        eventDate: "2026-07-24T00:00:00.000Z",
      }),
    ],
    NOW,
  );
  const insights = buildCareInsights(profile, signals);

  assert.equal(signals.lastGroomingAt, null);
  assert.equal(signals.recentIllnessEvents30d, 1);
  assert.equal(
    insights.find((item) => item.id === "recent-health-history")?.tone,
    "safety",
  );
});

test("does not apply food life-stage cautions to hydration products", () => {
  const match = evaluateProductMatch(profile, {
    id: "fountain",
    name: "Water Fountain 2L",
    category: "Hydration",
    priceIdr: 219000,
    description: "Cocok untuk kitten, adult, dan senior yang hidup indoor.",
    tags: [{ tag: "hydration" }, { tag: "indoor" }],
  });

  assert.equal(match.cautions.length, 0);
  assert.ok(
    match.reasons.some((reason) => reason.includes("kebutuhan cairan")),
  );
});

test("rejects kitten feeding equipment for an adult and ignores cleaning instructions", () => {
  const match = evaluateProductMatch(profile, {
    id: "feeding-kit",
    name: "Feeding Kit - Set Botol Dot Susu Kucing",
    category: "Aksesori",
    priceIdr: 43000,
    description:
      "Untuk anak kucing baru lahir hingga masa sapih. Sterilkan botol sebelum digunakan.",
    tags: [{ tag: "kitten" }, { tag: "indoor" }],
  });

  assert.equal(match.label, "Tidak direkomendasikan");
  assert.ok(match.cautions.some((caution) => caution.includes("kitten")));
  assert.ok(
    !match.reasons.some((reason) => reason.includes("sudah steril")),
  );
});

test("every non-medical personalized match contains at least two reasons", () => {
  const match = evaluateProductMatch(profile, {
    id: "generic-grooming",
    name: "Sisir Harian",
    category: "Grooming",
    priceIdr: 45000,
    reason: "Membantu mengangkat bulu mati.",
    description: "Sisir untuk perawatan bulu harian.",
    tags: [{ tag: "grooming" }],
  });

  assert.ok(match.reasons.length >= 2);
  assert.equal(match.safetyWarning, undefined);
  assert.ok(match.benefits.length > 0);
  assert.ok(match.suitableFor.length > 0);
});

test("medical products receive a veterinary warning only", () => {
  const medicalMatch = evaluateProductMatch(profile, {
    id: "medical",
    name: "Recovery Diet",
    category: "Suplemen",
    priceIdr: 185000,
    reason: "Mendukung pemulihan setelah sakit.",
    description: "Produk pemulihan pasca operasi.",
    tags: [{ tag: "medical" }, { tag: "vet-required" }],
  });
  const dailyMatch = evaluateProductMatch(profile, {
    id: "daily",
    name: "Adult Indoor Chicken",
    category: "Dry food",
    priceIdr: 85000,
    reason: "Makanan harian untuk kucing dewasa indoor.",
    tags: [{ tag: "adult" }, { tag: "indoor" }],
  });

  assert.equal(medicalMatch.label, "Tidak direkomendasikan");
  assert.ok(medicalMatch.safetyWarning?.includes("dokter hewan"));
  assert.ok(medicalMatch.reasons.length >= 2);
  assert.equal(dailyMatch.safetyWarning, undefined);
});

test("profile food sensitivities become explicit cautions", () => {
  const sensitiveProfile: DerivedCatProfile = {
    ...profile,
    dietaryAvoidances: ["gandum"],
  };
  const match = evaluateProductMatch(sensitiveProfile, {
    id: "wheat-food",
    name: "Adult Wheat Formula",
    category: "Dry food",
    priceIdr: 75000,
    reason: "Makanan adult dengan gandum.",
    tags: [{ tag: "adult" }],
  });

  assert.equal(match.label, "Tidak direkomendasikan");
  assert.ok(match.cautions.some((caution) => caution.includes("gandum")));
});

test("ingredient-free claims do not trigger a false allergy caution", () => {
  const sensitiveProfile: DerivedCatProfile = {
    ...profile,
    dietaryAvoidances: ["gandum"],
  };
  const match = evaluateProductMatch(sensitiveProfile, {
    id: "grain-free-food",
    name: "Adult Grain-Free Formula",
    category: "Dry food",
    priceIdr: 95000,
    reason: "Makanan dewasa tanpa gandum.",
    description: "Tidak mengandung gandum dan gluten.",
    tags: [{ tag: "adult" }],
  });

  assert.ok(!match.cautions.some((caution) => caution.includes("gandum")));
});
