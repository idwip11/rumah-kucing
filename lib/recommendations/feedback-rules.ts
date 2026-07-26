import type {
  RecommendationFeedbackResponse,
  RecommendationProduct,
  TastePreferenceSignals,
} from "@/lib/recommendations/types";

type FeedbackProductRecord = {
  response: RecommendationFeedbackResponse;
  product: RecommendationProduct | null;
};

const FLAVOR_ALIASES = {
  ayam: ["ayam", "chicken"],
  salmon: ["salmon"],
  tuna: ["tuna"],
  "daging sapi": ["daging sapi", "beef"],
  ikan: ["ikan", "fish", "ocean"],
} as const;

function normalizedProductIdentity(product: RecommendationProduct) {
  return [
    product.name,
    product.category,
    ...(product.tags ?? []).map((tag) => tag.tag),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizedProductText(product: RecommendationProduct) {
  return [
    normalizedProductIdentity(product),
    product.reason,
    product.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isFoodProduct(product: RecommendationProduct) {
  const identity = normalizedProductIdentity(product);
  return [
    "cat food",
    "dry food",
    "food/makanan",
    "makanan",
    "nutrition",
    "pakan",
    "snack",
    "susu",
    "wet food",
  ].some((term) => identity.includes(term));
}

export function getProductFlavorLabels(product: RecommendationProduct) {
  if (!isFoodProduct(product)) return [];

  const text = normalizedProductText(product);
  const flavors: string[] = [];

  for (const [label, aliases] of Object.entries(FLAVOR_ALIASES)) {
    if (aliases.some((alias) => text.includes(alias))) {
      flavors.push(label);
    }
  }

  if (
    (flavors.includes("salmon") || flavors.includes("tuna")) &&
    flavors.includes("ikan")
  ) {
    return flavors.filter((flavor) => flavor !== "ikan");
  }

  return flavors;
}

export function buildTastePreferenceSignals(
  feedback: FeedbackProductRecord[],
): TastePreferenceSignals {
  const flavorScores = new Map<string, number>();
  const responseWeight: Record<RecommendationFeedbackResponse, number> = {
    liked: 2,
    saved: 1,
    disliked: -2,
    caused_issue: -3,
    not_tried: 0,
  };

  for (const item of feedback) {
    if (!item.product) continue;
    const weight = responseWeight[item.response];
    if (weight === 0) continue;

    for (const flavor of getProductFlavorLabels(item.product)) {
      flavorScores.set(flavor, (flavorScores.get(flavor) ?? 0) + weight);
    }
  }

  return {
    preferredFlavors: Array.from(flavorScores.entries())
      .filter(([, score]) => score > 0)
      .map(([flavor]) => flavor),
    avoidedFlavors: Array.from(flavorScores.entries())
      .filter(([, score]) => score < 0)
      .map(([flavor]) => flavor),
  };
}
