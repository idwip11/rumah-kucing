import assert from "node:assert/strict";
import test from "node:test";
import {
  buildKettyProductRecommendationReply,
  isMedicalProductQuestion,
  isProductRecommendationQuestion,
  productMatchesKettyQuestion,
} from "@/lib/recommendations/ketty-product-replies";
import type {
  DerivedCatProfile,
  ProductMatch,
  RecommendationProduct,
  TimelineCareSignals,
} from "@/lib/recommendations/types";

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

const careSignals: TimelineCareSignals = {
  lastGroomingAt: null,
  daysSinceGrooming: null,
  lastWeightAt: null,
  daysSinceWeight: null,
  latestWeightKg: null,
  previousWeightKg: null,
  weightChangeKg: null,
  weightChangeDays: null,
  hairballEvents30d: 1,
  recentIllnessEvents30d: 0,
  recentFoodNotes45d: 0,
  recentDryFoodNotes45d: 0,
  recentFoodChange: false,
  hydrationConcern: false,
  urinaryConcern: false,
  hasRecordedVaccine: true,
};

function product(overrides: Partial<RecommendationProduct>): RecommendationProduct {
  return {
    id: overrides.id ?? "product-1",
    name: overrides.name ?? "Adult Indoor Hairball Chicken",
    category: overrides.category ?? "Makanan",
    priceIdr: overrides.priceIdr ?? 120000,
    reason: overrides.reason ?? "Makanan adult untuk kucing indoor.",
    description: overrides.description ?? null,
    tags: overrides.tags ?? [{ tag: "adult" }, { tag: "indoor" }],
  };
}

function match(overrides: Partial<ProductMatch> = {}): ProductMatch {
  return {
    productId: overrides.productId ?? "product-1",
    label: overrides.label ?? "Sangat cocok",
    reasons: overrides.reasons ?? [
      "Sesuai untuk Snowy yang sudah dewasa.",
      "Cocok dengan gaya hidup indoor Snowy.",
    ],
    benefits: overrides.benefits ?? [
      "Mendukung kesehatan kulit dan kondisi bulu.",
    ],
    suitableFor: overrides.suitableFor ?? ["Kucing tahap usia adult"],
    cautions: overrides.cautions ?? [
      "Tahap usia produk perlu dicek ulang pada label kemasan.",
    ],
    safetyWarning: overrides.safetyWarning,
    sortScore: overrides.sortScore ?? 70,
  };
}

test("detects personalized product recommendation questions", () => {
  assert.equal(
    isProductRecommendationQuestion("Makanan apa yang cocok untuk Snowy?"),
    true,
  );
  assert.equal(
    isProductRecommendationQuestion("Berapa harga produk ini?"),
    false,
  );
});

test("filters products by question intent", () => {
  const food = product({ name: "Adult Indoor Cat Food" });
  const toy = product({
    name: "Interactive Feather Toy",
    category: "Mainan",
    reason: "Mainan interaktif untuk stimulasi kucing indoor.",
    tags: [{ tag: "interactive" }],
  });

  assert.equal(productMatchesKettyQuestion(food, "makanan apa yang cocok?"), true);
  assert.equal(productMatchesKettyQuestion(toy, "makanan apa yang cocok?"), false);
  assert.equal(productMatchesKettyQuestion(toy, "mainan apa yang cocok?"), true);
});

test("does not treat feeding equipment as food unless the question asks for it", () => {
  const feedingKit = product({
    name: "Feeding Kit - Set Botol Dot Susu Kucing",
    category: "Food/Makanan",
    reason: "Untuk kitten yang masih membutuhkan susu botol.",
    tags: [{ tag: "kitten" }],
  });

  assert.equal(
    productMatchesKettyQuestion(feedingKit, "makanan apa yang cocok?"),
    false,
  );
  assert.equal(
    productMatchesKettyQuestion(feedingKit, "botol susu apa yang cocok?"),
    true,
  );
});

test("builds a natural rule-engine based recommendation without percentages", () => {
  const reply = buildKettyProductRecommendationReply({
    profile,
    gender: "Betina",
    ageLabel: "3,5 tahun",
    notes: "Tidak ada alergi tercatat.",
    healthConditions: [],
    previousProductNames: ["Adult Indoor Hairball Chicken"],
    careSignals,
    rankedProducts: [
      {
        product: product({ id: "product-1" }),
        match: match({ productId: "product-1" }),
        previouslyOrdered: true,
      },
    ],
    unsafeProductCount: 0,
    availableProductCount: 1,
    medicalIntent: false,
  });

  assert.match(reply, /Snowy/);
  assert.match(reply, /rule engine rekomendasi Rumah Kucing/);
  assert.match(reply, /Mengapa cocok/);
  assert.match(reply, /Sesuai untuk Snowy yang sudah dewasa/);
  assert.match(reply, /Cocok dengan gaya hidup indoor Snowy/);
  assert.match(reply, /Perlu diperhatikan/);
  assert.doesNotMatch(reply, /\d+%/);
});

test("medical product questions return a veterinarian guardrail", () => {
  assert.equal(isMedicalProductQuestion("Suplemen apa yang cocok?"), true);

  const reply = buildKettyProductRecommendationReply({
    profile,
    gender: "Betina",
    ageLabel: "3,5 tahun",
    notes: null,
    healthConditions: ["Pernah muntah"],
    previousProductNames: [],
    careSignals,
    rankedProducts: [
      {
        product: product({ name: "Urinary Supplement", category: "Suplemen" }),
        match: match({
          safetyWarning:
            "Konsultasikan dengan dokter hewan sebelum menggunakan produk ini.",
        }),
      },
    ],
    unsafeProductCount: 1,
    availableProductCount: 1,
    medicalIntent: true,
  });

  assert.match(reply, /Konsultasikan dengan dokter hewan/);
  assert.match(reply, /tidak mendiagnosis/);
  assert.doesNotMatch(reply, /Urinary Supplement/);
});
