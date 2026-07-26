import type {
  CatLifestyle,
  CatLifeStage,
  CoatLength,
  DerivedCatProfile,
  RecommendationCat,
} from "@/lib/recommendations/types";

const LONG_HAIR_BREEDS = [
  "birman",
  "himalayan",
  "maine coon",
  "norwegian forest",
  "persia",
  "persian",
  "ragdoll",
  "siberian",
  "turkish angora",
];

const SHORT_HAIR_BREEDS = [
  "abyssinian",
  "american shorthair",
  "bengal",
  "british shorthair",
  "burmese",
  "domestic shorthair",
  "exotic shorthair",
  "russian blue",
  "savannah",
  "siamese",
  "sphynx",
];

const DIETARY_AVOIDANCE_TERMS = [
  { label: "gandum", aliases: ["gandum", "wheat"] },
  { label: "gluten", aliases: ["gluten"] },
  { label: "jagung", aliases: ["jagung", "corn"] },
  { label: "kedelai", aliases: ["kedelai", "soy"] },
  { label: "ayam", aliases: ["ayam", "chicken"] },
  { label: "ikan", aliases: ["ikan", "fish"] },
  { label: "salmon", aliases: ["salmon"] },
  { label: "tuna", aliases: ["tuna"] },
  { label: "daging sapi", aliases: ["daging sapi", "beef"] },
  { label: "susu atau laktosa", aliases: ["susu", "dairy", "laktosa"] },
] as const;

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function getAgeMonths(dateOfBirth: Date | string | null | undefined) {
  if (!dateOfBirth) return null;

  const birthDate =
    dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    today.getMonth() -
    birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

function getLifeStage(
  ageMonths: number | null,
  ageLabel: string | null | undefined,
): CatLifeStage {
  if (ageMonths !== null) {
    if (ageMonths < 12) return "kitten";
    if (ageMonths >= 84) return "senior";
    return "adult";
  }

  const label = normalize(ageLabel);
  if (label.includes("senior")) return "senior";
  if (label.includes("tahun") || label.includes("adult")) return "adult";
  if (label.includes("kitten") || label.includes("bulan")) return "kitten";
  return "unknown";
}

function getCoatLength(cat: RecommendationCat): CoatLength {
  const breedName = normalize(cat.breed?.name);
  const breedSlug = normalize(cat.breed?.slug).replace(/-/g, " ");
  const characteristics = (cat.breed?.characteristics ?? [])
    .map((item) => normalize(item.label))
    .join(" ");
  const breedText = `${breedName} ${breedSlug}`.trim();

  if (
    characteristics.includes("bulu panjang") ||
    characteristics.includes("longhair") ||
    LONG_HAIR_BREEDS.some((breed) => breedText.includes(breed))
  ) {
    return "long";
  }

  if (
    characteristics.includes("bulu pendek") ||
    characteristics.includes("shorthair") ||
    SHORT_HAIR_BREEDS.some((breed) => breedText.includes(breed))
  ) {
    return "short";
  }

  if (characteristics.includes("bulu sedang")) return "medium";
  return "unknown";
}

function getLifestyle(value: string | null | undefined): CatLifestyle {
  const lifestyle = normalize(value);
  if (!lifestyle) return "unknown";
  if (lifestyle.includes("campuran")) return "mixed";
  if (lifestyle.includes("indoor")) return "indoor";
  if (lifestyle.includes("outdoor")) return "outdoor";
  return "unknown";
}

function getWeight(value: RecommendationCat["weightKg"]) {
  if (value === null || value === undefined) return null;
  const weight = Number(value.toString());
  return Number.isFinite(weight) && weight > 0 ? weight : null;
}

function getDietaryAvoidances(notes: string | null | undefined) {
  const normalizedNotes = normalize(notes);
  if (
    !normalizedNotes ||
    !["alergi", "hindari", "sensitif", "tidak cocok"].some((marker) =>
      normalizedNotes.includes(marker),
    )
  ) {
    return [];
  }

  return DIETARY_AVOIDANCE_TERMS.filter(({ aliases }) =>
    aliases.some((alias) => normalizedNotes.includes(alias)),
  ).map(({ label }) => label);
}

export function deriveCatProfile(cat: RecommendationCat): DerivedCatProfile {
  const ageMonths = getAgeMonths(cat.estimatedDateOfBirth);
  const lifeStage = getLifeStage(ageMonths, cat.ageLabel);
  const coatLength = getCoatLength(cat);
  const lifestyle = getLifestyle(cat.lifestyle);
  const priorities: DerivedCatProfile["priorities"] = ["hydration"];

  if (lifeStage !== "unknown") priorities.push("life-stage");
  if (cat.sterilized || lifestyle === "indoor") priorities.push("weight");
  if (coatLength === "long") priorities.push("coat");
  if (lifestyle === "indoor") priorities.push("activity");

  return {
    id: cat.id,
    name: cat.name,
    ageMonths,
    lifeStage,
    breedName: cat.breed?.name ?? null,
    breedSlug: cat.breed?.slug ?? null,
    coatLength,
    isSterilized: Boolean(cat.sterilized),
    lifestyle,
    weightKg: getWeight(cat.weightKg),
    dietaryAvoidances: getDietaryAvoidances(cat.notes),
    priorities,
  };
}

export function getLifeStageLabel(stage: CatLifeStage) {
  if (stage === "kitten") return "kitten";
  if (stage === "adult") return "dewasa";
  if (stage === "senior") return "senior";
  return "sesuai tahap usia";
}
