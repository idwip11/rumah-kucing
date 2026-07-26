import { getLifeStageLabel } from "@/lib/recommendations/profile";
import { getProductFlavorLabels } from "@/lib/recommendations/feedback-rules";
import type {
  DerivedCatProfile,
  ProductMatch,
  ProductRecommendationPersonalization,
  ProductRecommendationRankingContext,
  RecommendationMatchLabel,
  RecommendationProduct,
  TimelineCareSignals,
} from "@/lib/recommendations/types";

const MEDICAL_IDENTITY_TERMS = [
  "medicines/obat",
  "medical",
  "medis",
  "obat",
  "prescription",
  "recovery",
  "renal",
  "suplemen",
  "supplement",
  "urinary",
  "veterinary",
  "vitamin",
  "vet-required",
];

const MEDICAL_CONTENT_TERMS = [
  "diet resep",
  "diet renal",
  "makanan medis",
  "pasca operasi",
  "pemulihan kucing sakit",
  "prescription diet",
  "veterinary diet",
];

const DIETARY_AVOIDANCE_ALIASES: Record<string, string[]> = {
  gandum: ["gandum", "wheat"],
  gluten: ["gluten"],
  jagung: ["jagung", "corn"],
  kedelai: ["kedelai", "soy"],
  ayam: ["ayam", "chicken"],
  ikan: ["ikan", "fish"],
  salmon: ["salmon"],
  tuna: ["tuna"],
  "daging sapi": ["daging sapi", "beef"],
  "susu atau laktosa": ["susu", "dairy", "laktosa"],
};

function productText(product: RecommendationProduct) {
  return [
    product.name,
    product.category,
    product.reason,
    product.description,
    product.badge,
    ...(product.tags ?? []).map((tag) => tag.tag),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function productIdentityText(product: RecommendationProduct) {
  return [
    product.name,
    product.category,
    ...(product.tags ?? []).map((tag) => tag.tag),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function containsAvoidedIngredient(text: string, aliases: string[]) {
  return aliases.some((alias) => {
    if (!text.includes(alias)) return false;

    return ![
      `bebas ${alias}`,
      `free from ${alias}`,
      `${alias}-free`,
      `tanpa ${alias}`,
      `tidak mengandung ${alias}`,
    ].some((negated) => text.includes(negated));
  });
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

function cleanSentence(value: string | null | undefined) {
  if (!value) return null;

  const cleaned = value
    .replace(/[*_#>`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;

  const firstSentence = cleaned.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  const sentence = firstSentence ?? cleaned;
  return sentence.length > 180
    ? `${sentence.slice(0, 177).trimEnd()}...`
    : sentence;
}

function buildProductBenefits(
  product: RecommendationProduct,
  text: string,
) {
  const benefits: string[] = [];
  const statedReason = cleanSentence(product.reason);
  if (statedReason) benefits.push(statedReason);

  if (includesAny(text, ["protein", "high-protein", "tinggi protein"])) {
    benefits.push("Memberikan dukungan protein sesuai informasi produk.");
  }
  if (includesAny(text, ["digestive", "digestion", "pencernaan", "prebiotik"])) {
    benefits.push("Mendukung kesehatan dan kenyamanan pencernaan.");
  }
  if (includesAny(text, ["hairball", "bola bulu"])) {
    benefits.push("Membantu pengelolaan hairball dan bulu tertelan.");
  }
  if (
    includesAny(text, [
      "bulu",
      "coat",
      "omega-3",
      "omega-6",
      "skin",
      "kulit",
    ])
  ) {
    benefits.push("Mendukung kesehatan kulit dan kondisi bulu.");
  }
  if (
    includesAny(text, [
      "air mancur",
      "fountain",
      "hidrasi",
      "hydration",
      "tinggi air",
      "wet food",
    ])
  ) {
    benefits.push("Membantu mendukung asupan cairan harian.");
  }
  if (
    includesAny(text, [
      "catnip",
      "interactive",
      "mainan",
      "stimulasi",
      "toy",
    ])
  ) {
    benefits.push("Mendukung aktivitas fisik dan stimulasi mental.");
  }
  if (includesAny(text, ["dental", "gigi", "plak", "karang gigi"])) {
    benefits.push("Mendukung kebersihan gigi sesuai fungsi produk.");
  }
  if (
    includesAny(text, [
      "low calorie",
      "rendah kalori",
      "weight control",
      "weight management",
    ])
  ) {
    benefits.push("Mendukung pengelolaan berat badan.");
  }

  const descriptionBenefit = cleanSentence(product.description);
  if (benefits.length === 0 && descriptionBenefit) {
    benefits.push(descriptionBenefit);
  }
  if (benefits.length === 0 && product.category) {
    benefits.push(`Dirancang untuk kebutuhan kategori ${product.category}.`);
  }
  if (benefits.length === 0) {
    benefits.push(
      "Manfaat spesifik mengikuti informasi penggunaan yang tersedia pada produk.",
    );
  }

  return unique(benefits).slice(0, 5);
}

function ensureRecommendationReasons(
  reasons: string[],
  benefits: string[],
  profile: DerivedCatProfile,
  product: RecommendationProduct,
) {
  const completed = [...reasons];

  for (const benefit of benefits) {
    if (completed.length >= 2) break;
    completed.push(benefit);
  }

  if (completed.length < 2 && product.category) {
    completed.push(
      `Produk ini dinilai dalam kategori ${product.category} berdasarkan data produk yang tersedia.`,
    );
  }

  if (completed.length < 2) {
    const profileFacts = [
      profile.lifeStage !== "unknown"
        ? `usia ${getLifeStageLabel(profile.lifeStage)}`
        : null,
      profile.breedName ? `ras ${profile.breedName}` : null,
      profile.lifestyle !== "unknown"
        ? `gaya hidup ${profile.lifestyle}`
        : null,
    ].filter(Boolean);

    completed.push(
      `Penilaian mempertimbangkan profil ${profile.name}${profileFacts.length > 0 ? `: ${profileFacts.join(", ")}` : ""}.`,
    );
  }

  return unique(completed).slice(0, 5);
}

export function isMedicalProduct(product: RecommendationProduct) {
  return (
    includesAny(productIdentityText(product), MEDICAL_IDENTITY_TERMS) ||
    includesAny(productText(product), MEDICAL_CONTENT_TERMS)
  );
}

function labelForScore(score: number): RecommendationMatchLabel {
  if (score <= -50) return "Tidak direkomendasikan";
  if (score < 0) return "Kurang sesuai";
  if (score >= 50) return "Sangat cocok";
  if (score >= 20) return "Cocok";
  return "Cukup cocok";
}

export function evaluateProductMatch(
  profile: DerivedCatProfile,
  product: RecommendationProduct,
  careSignals?: TimelineCareSignals,
  personalization?: ProductRecommendationPersonalization,
): ProductMatch {
  const text = productText(product);
  const identityText = productIdentityText(product);
  const reasons: string[] = [];
  const cautions: string[] = [];
  let score = 0;

  const isMedical = isMedicalProduct(product);

  const isKitten = includesAny(text, [
    "anak kucing",
    "junior",
    "kitten",
    "mother & baby",
    "pertumbuhan",
  ]);
  const isAdult = includesAny(text, ["adult", "dewasa"]);
  const isSenior = includesAny(text, ["senior", "7+"]);
  const isFoodProduct = includesAny(identityText, [
    "cat food",
    "dry food",
    "food/makanan",
    "makanan",
    "nutrition",
    "pakan",
    "wet food",
  ]);
  const isKittenCareProduct =
    isKitten &&
    includesAny(identityText, [
      "botol",
      "dot",
      "feeding",
      "kitten",
      "nursing",
      "susu",
    ]) &&
    includesAny(text, [
      "anak kucing",
      "baru lahir",
      "masa sapih",
      "menyusui",
      "susu formula",
    ]);
  const usesLifeStageRules = isFoodProduct || isKittenCareProduct;

  if (usesLifeStageRules && profile.lifeStage === "kitten") {
    if (isKitten) {
      score += 38;
      reasons.push(`Diformulasikan untuk tahap usia kitten ${profile.name}.`);
    } else if (isAdult || isSenior) {
      score -= 55;
      cautions.push(
        `${profile.name} masih kitten, sedangkan produk ini ditujukan untuk kucing yang lebih dewasa.`,
      );
    }
  }

  if (usesLifeStageRules && profile.lifeStage === "adult") {
    if (isAdult) {
      score += 30;
      reasons.push(`Sesuai untuk ${profile.name} yang sudah dewasa.`);
    }
    if (isKitten) {
      score -= isKittenCareProduct ? 80 : 65;
      cautions.push(
        `Produk ini diformulasikan untuk kitten, sedangkan ${profile.name} sudah dewasa.`,
      );
    }
    if (isSenior) {
      score -= 35;
      cautions.push(
        `Formula senior belum sesuai dengan tahap usia ${profile.name}.`,
      );
    }
  }

  if (usesLifeStageRules && profile.lifeStage === "senior") {
    if (isSenior) {
      score += 38;
      reasons.push(`Sesuai untuk tahap usia senior ${profile.name}.`);
    } else if (isKitten) {
      score -= 65;
      cautions.push(
        `Formula kitten tidak sesuai dengan tahap usia senior ${profile.name}.`,
      );
    }
  }

  const supportsSterilized = includesAny(text, [
    "neutered",
    "kucing steril",
    "setelah steril",
    "sterilised",
    "sterilized",
  ]);
  const supportsWeight = includesAny(text, [
    "light",
    "low calorie",
    "rendah kalori",
    "weight control",
    "weight management",
  ]);
  if (profile.isSterilized && supportsSterilized) {
    score += 24;
    reasons.push(`Mendukung kebutuhan kucing yang sudah steril seperti ${profile.name}.`);
  }
  if (profile.isSterilized && supportsWeight) {
    score += 14;
    reasons.push("Membantu mendukung pengelolaan berat badan setelah steril.");
  }

  const supportsIndoor = text.includes("indoor");
  const supportsActivity = includesAny(text, [
    "catnip",
    "interactive",
    "mainan",
    "stimulasi",
    "toy",
  ]);
  if (profile.lifestyle === "indoor" && supportsIndoor) {
    score += 16;
    reasons.push(`Cocok dengan gaya hidup indoor ${profile.name}.`);
  }
  if (profile.lifestyle === "indoor" && supportsActivity) {
    score += 18;
    reasons.push(`Membantu menjaga aktivitas dan stimulasi ${profile.name} di dalam rumah.`);
  }

  const supportsHairball = text.includes("hairball");
  const supportsCoat = includesAny(text, [
    "bulu",
    "coat",
    "grooming",
    "omega-3",
    "omega-6",
    "skin",
    "sisir",
  ]);
  if (profile.coatLength === "long" && supportsHairball) {
    score += 30;
    reasons.push(`Membantu kebutuhan hairball pada bulu panjang ${profile.name}.`);
  }
  if ((careSignals?.hairballEvents30d ?? 0) >= 2 && supportsHairball) {
    score += 18;
    reasons.push(
      `Relevan dengan catatan hairball ${profile.name} dalam 30 hari terakhir.`,
    );
  }
  if (profile.coatLength === "long" && supportsCoat) {
    score += 24;
    reasons.push(
      `Mendukung perawatan kulit dan bulu panjang ${profile.name}${profile.breedName ? ` sebagai ${profile.breedName}` : ""}.`,
    );
  }

  const supportsHydration = includesAny(text, [
    "air mancur",
    "fountain",
    "hidrasi",
    "hydration",
    "tinggi air",
    "wet food",
  ]);
  if (supportsHydration) {
    score += 12;
    reasons.push(`Membantu memenuhi kebutuhan cairan harian ${profile.name}.`);
  }
  if (
    supportsHydration &&
    (careSignals?.hydrationConcern ||
      (careSignals?.recentDryFoodNotes45d ?? 0) > 0)
  ) {
    score += 18;
    reasons.push(
      `Sesuai dengan catatan hidrasi atau makanan kering terbaru ${profile.name}.`,
    );
  }

  if (
    (careSignals?.weightChangeKg ?? 0) >= 0.3 &&
    supportsWeight
  ) {
    score += 18;
    reasons.push(
      `Mendukung perhatian terhadap kenaikan berat yang tercatat untuk ${profile.name}.`,
    );
  }

  const supportsSensitiveDigestion = includesAny(text, [
    "digestive",
    "digestion",
    "pencernaan",
    "sensitive",
  ]);
  if (careSignals?.recentFoodChange && supportsSensitiveDigestion) {
    score += 12;
    reasons.push(
      `Mendukung pencernaan saat ${profile.name} memiliki catatan transisi makanan terbaru.`,
    );
  }

  const directResponse = personalization?.directResponse;
  if (!isMedical) {
    if (directResponse === "liked") {
      score += 28;
      reasons.push(
        `${profile.name} sebelumnya diberi feedback suka untuk produk ini.`,
      );
    } else if (directResponse === "saved") {
      score += 18;
      reasons.push(
        `Produk ini telah disimpan sebagai favorit untuk ${profile.name}.`,
      );
    } else if (directResponse === "disliked") {
      score = Math.min(score - 80, -20);
      cautions.push(
        `${profile.name} sebelumnya diberi feedback tidak suka untuk produk ini.`,
      );
    } else if (directResponse === "caused_issue") {
      score = -200;
      cautions.push(
        `Produk ini sebelumnya ditandai menimbulkan masalah pada ${profile.name} dan tidak diprioritaskan kembali.`,
      );
    }
  }

  const productFlavors = getProductFlavorLabels(product);
  const preferredFlavors =
    personalization?.tastePreferences?.preferredFlavors ?? [];
  const avoidedFlavors =
    personalization?.tastePreferences?.avoidedFlavors ?? [];
  const matchedPreferredFlavors = productFlavors.filter((flavor) =>
    preferredFlavors.includes(flavor),
  );
  const matchedAvoidedFlavors = productFlavors.filter((flavor) =>
    avoidedFlavors.includes(flavor),
  );

  if (
    !isMedical &&
    directResponse !== "disliked" &&
    directResponse !== "caused_issue" &&
    matchedPreferredFlavors.length > 0
  ) {
    score += 12;
    reasons.push(
      `Rasa ${matchedPreferredFlavors.join(" dan ")} sesuai dengan pola produk yang disukai ${profile.name}.`,
    );
  }
  if (!isMedical && matchedAvoidedFlavors.length > 0) {
    score -= 24;
    cautions.push(
      `Feedback sebelumnya menunjukkan ${profile.name} cenderung kurang menyukai rasa ${matchedAvoidedFlavors.join(" dan ")}.`,
    );
  }

  for (const avoidance of profile.dietaryAvoidances) {
    const aliases = DIETARY_AVOIDANCE_ALIASES[avoidance] ?? [avoidance];
    if (containsAvoidedIngredient(text, aliases)) {
      score -= 100;
      cautions.push(
        `Catatan profil ${profile.name} menyebut alergi atau sensitivitas terhadap ${avoidance}, sedangkan data produk memuat bahan tersebut.`,
      );
    }
  }

  const isGeneralDailyFood = isFoodProduct;
  if (
    isGeneralDailyFood &&
    !isKitten &&
    !isAdult &&
    !isSenior &&
    profile.lifeStage !== "unknown"
  ) {
    cautions.push(
      `Tahap usia produk belum tercantum jelas; pastikan cocok untuk kucing ${getLifeStageLabel(profile.lifeStage)}.`,
    );
  }
  if (
    isGeneralDailyFood &&
    (careSignals?.recentIllnessEvents30d ?? 0) > 0
  ) {
    cautions.push(
      `Ada riwayat kondisi kesehatan terbaru untuk ${profile.name}; lakukan perubahan makanan secara bertahap dan ikuti arahan dokter hewan bila masih dalam perawatan.`,
    );
  }

  const suitableFor: string[] = [];
  const lifeStages = [
    isKitten ? "kitten" : null,
    isAdult ? "adult" : null,
    isSenior ? "senior" : null,
  ].filter((value): value is string => Boolean(value));

  if (usesLifeStageRules && lifeStages.length > 0) {
    suitableFor.push(
      lifeStages.length === 3
        ? "Kitten, adult, dan senior"
        : `Kucing tahap usia ${lifeStages.join(" dan ")}`,
    );
  }
  if (supportsIndoor) suitableFor.push("Kucing dengan gaya hidup indoor");
  if (supportsSterilized) suitableFor.push("Kucing yang sudah steril");
  if (
    supportsCoat &&
    includesAny(text, [
      "bulu panjang",
      "longhair",
      "maine coon",
      "persia",
      "persian",
      "ragdoll",
    ])
  ) {
    suitableFor.push("Kucing atau ras berbulu panjang");
  }
  if (supportsSensitiveDigestion) {
    suitableFor.push("Kucing dengan pencernaan sensitif");
  }
  if (supportsHydration) {
    suitableFor.push("Kucing yang membutuhkan dukungan hidrasi");
  }
  if (supportsActivity) {
    suitableFor.push("Kucing yang membutuhkan aktivitas dan stimulasi");
  }
  if (
    profile.breedName &&
    text.includes(profile.breedName.toLowerCase())
  ) {
    suitableFor.push(`Ras ${profile.breedName}`);
  }
  if (isMedical) {
    suitableFor.push(
      "Kucing dengan kondisi medis yang telah dievaluasi dokter hewan",
    );
  }
  if (suitableFor.length === 0 && product.category) {
    suitableFor.push(`Kucing dengan kebutuhan kategori ${product.category}`);
  }
  if (suitableFor.length === 0) {
    suitableFor.push("Kucing dengan kebutuhan perawatan umum");
  }

  const benefits = buildProductBenefits(product, text);
  const completedReasons = ensureRecommendationReasons(
    reasons,
    benefits,
    profile,
    product,
  );

  if (isMedical) {
    return {
      productId: product.id,
      label: "Tidak direkomendasikan",
      reasons: completedReasons,
      benefits,
      suitableFor: unique(suitableFor),
      cautions: unique([
        "Produk ini ditujukan untuk kebutuhan kesehatan tertentu dan tidak dinilai seperti produk harian.",
        ...cautions,
      ]),
      safetyWarning:
        "Konsultasikan dengan dokter hewan sebelum menggunakan produk ini. Jangan menggunakan produk medis, veterinary diet, obat, vitamin, atau suplemen sebagai pengobatan mandiri.",
      sortScore: -100,
    };
  }

  return {
    productId: product.id,
    label: labelForScore(score),
    reasons: completedReasons,
    benefits,
    suitableFor: unique(suitableFor),
    cautions: unique(cautions),
    sortScore: score,
  };
}

export function rankProductsForCat(
  profile: DerivedCatProfile,
  products: RecommendationProduct[],
  careSignals?: TimelineCareSignals,
  personalization?: ProductRecommendationRankingContext,
) {
  return products
    .map((product) => ({
      product,
      match: evaluateProductMatch(profile, product, careSignals, {
        directResponse:
          personalization?.feedbackByProductId?.[product.id] ?? null,
        tastePreferences: personalization?.tastePreferences,
      }),
    }))
    .sort((a, b) => {
      if (b.match.sortScore !== a.match.sortScore) {
        return b.match.sortScore - a.match.sortScore;
      }
      return a.product.name.localeCompare(b.product.name, "id");
    });
}
