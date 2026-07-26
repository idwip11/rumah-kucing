import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTastePreferenceSignals,
  getProductFlavorLabels,
} from "@/lib/recommendations/feedback-rules";
import {
  evaluateProductMatch,
  rankProductsForCat,
} from "@/lib/recommendations/product-rules";
import type {
  DerivedCatProfile,
  RecommendationProduct,
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

function product(
  overrides: Partial<RecommendationProduct>,
): RecommendationProduct {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    name: overrides.name ?? "Adult Daily Food",
    category: overrides.category ?? "Dry food",
    priceIdr: overrides.priceIdr ?? 85000,
    reason: overrides.reason ?? "Makanan harian untuk kucing dewasa.",
    description: overrides.description ?? null,
    tags: overrides.tags ?? [{ tag: "adult" }],
  };
}

test("learns flavor preferences only from food products", () => {
  const chickenFood = product({
    id: "chicken-food",
    name: "Adult Chicken Formula",
  });
  const tunaFood = product({
    id: "tuna-food",
    name: "Adult Tuna Formula",
  });
  const fishToy = product({
    id: "fish-toy",
    name: "Interactive Fish Toy",
    category: "Mainan",
    reason: "Mainan ikan untuk stimulasi kucing indoor.",
    tags: [{ tag: "interactive" }],
  });

  const signals = buildTastePreferenceSignals([
    { response: "liked", product: chickenFood },
    { response: "disliked", product: tunaFood },
    { response: "liked", product: fishToy },
  ]);

  assert.deepEqual(getProductFlavorLabels(chickenFood), ["ayam"]);
  assert.deepEqual(getProductFlavorLabels(fishToy), []);
  assert.deepEqual(signals.preferredFlavors, ["ayam"]);
  assert.deepEqual(signals.avoidedFlavors, ["tuna"]);
});

test("a product marked as causing an issue is not recommended again", () => {
  const match = evaluateProductMatch(
    profile,
    product({
      id: "problem-food",
      name: "Adult Indoor Chicken",
      tags: [{ tag: "adult" }, { tag: "indoor" }],
    }),
    undefined,
    { directResponse: "caused_issue" },
  );

  assert.equal(match.label, "Tidak direkomendasikan");
  assert.equal(match.sortScore, -200);
  assert.ok(
    match.cautions.some((caution) =>
      caution.includes("menimbulkan masalah"),
    ),
  );
});

test("learned flavor preferences affect recommendation order", () => {
  const beefFood = product({
    id: "beef-food",
    name: "A Adult Beef Formula",
  });
  const chickenFood = product({
    id: "chicken-food",
    name: "Z Adult Chicken Formula",
  });

  const ranked = rankProductsForCat(
    profile,
    [beefFood, chickenFood],
    undefined,
    {
      tastePreferences: {
        preferredFlavors: ["ayam"],
        avoidedFlavors: [],
      },
    },
  );

  assert.equal(ranked[0]?.product.id, "chicken-food");
  assert.ok(
    ranked[0]?.match.reasons.some((reason) =>
      reason.includes("pola produk yang disukai"),
    ),
  );
});

test("negative direct feedback deprioritizes an otherwise strong match", () => {
  const dislikedFood = product({
    id: "disliked-food",
    name: "Adult Indoor Hairball Chicken",
    tags: [
      { tag: "adult" },
      { tag: "indoor" },
      { tag: "hairball" },
    ],
  });
  const alternativeFood = product({
    id: "alternative-food",
    name: "Adult Daily Beef",
  });

  const ranked = rankProductsForCat(
    profile,
    [dislikedFood, alternativeFood],
    undefined,
    {
      feedbackByProductId: {
        "disliked-food": "disliked",
      },
    },
  );

  assert.equal(ranked[0]?.product.id, "alternative-food");
  assert.equal(ranked[1]?.match.label, "Kurang sesuai");
});
