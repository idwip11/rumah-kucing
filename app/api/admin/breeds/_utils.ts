import { BreedGalleryImageType, BreedSuitabilityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const breedAdminInclude = {
  characteristics: { orderBy: { label: "asc" as const } },
  careGuide: true,
  nutritionGuide: true,
  healthNotes: { orderBy: { sortOrder: "asc" as const } },
  costEstimates: { orderBy: { updatedAt: "desc" as const } },
  galleryImages: { orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }] },
  colorPatterns: { orderBy: { sortOrder: "asc" as const } },
  similarBreeds: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      similarBreed: {
        select: { id: true, slug: true, name: true },
      },
    },
  },
  suitabilities: { orderBy: [{ type: "asc" as const }, { sortOrder: "asc" as const }] },
  _count: { select: { cats: true, articles: true } },
};

export function cleanString(value: unknown) {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function cleanBoolean(value: unknown) {
  return Boolean(value);
}

export function cleanInt(value: unknown) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(1, Math.min(10, Math.round(number)));
}

export function cleanDate(value: unknown) {
  const text = cleanString(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeSlug(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  return value
    .map((item) => String(item ?? "").trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeGalleryType(value: unknown) {
  const text = cleanString(value);
  if (
    text &&
    Object.values(BreedGalleryImageType).includes(
      text as BreedGalleryImageType,
    )
  ) {
    return text as BreedGalleryImageType;
  }
  return BreedGalleryImageType.other;
}

function normalizeSuitabilityType(value: unknown) {
  return cleanString(value) === BreedSuitabilityType.consider_if
    ? BreedSuitabilityType.consider_if
    : BreedSuitabilityType.good_for;
}

export function buildBreedScalarData(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  const stringFields = [
    "origin",
    "imageSrc",
    "profileSummary",
    "foodType",
    "kittenPriceLabel",
    "monthlyCareLabel",
    "careLevel",
    "availability",
    "matchLabel",
    "shortDescription",
    "backdropImageSrc",
    "history",
    "personalityDescription",
    "sizeLabel",
    "maleWeightRange",
    "femaleWeightRange",
    "lifeExpectancy",
    "coatLength",
    "coatPatterns",
    "activityLevel",
    "vocalLevel",
    "indoorFit",
    "sourceNotes",
  ];
  const scoreFields = [
    "beginnerFitScore",
    "activityScore",
    "friendlinessScore",
    "groomingScore",
    "vocalScore",
    "adaptabilityScore",
    "childFriendlyScore",
    "petFriendlyScore",
  ];

  for (const field of stringFields) {
    if (body[field] !== undefined) data[field] = cleanString(body[field]);
  }
  for (const field of scoreFields) {
    if (body[field] !== undefined) data[field] = cleanInt(body[field]);
  }
  if (body.alternativeNames !== undefined) {
    data.alternativeNames = normalizeStringArray(body.alternativeNames);
  }
  if (body.contentUpdatedAt !== undefined) {
    data.contentUpdatedAt = cleanDate(body.contentUpdatedAt);
  }
  if (body.commercialUpdatedAt !== undefined) {
    data.commercialUpdatedAt = cleanDate(body.commercialUpdatedAt);
  }
  if (body.isPublished !== undefined) {
    data.isPublished = cleanBoolean(body.isPublished);
  }
  if (body.isFeatured !== undefined) {
    data.isFeatured = cleanBoolean(body.isFeatured);
  }

  return data;
}

function hasAnyValue(record: Record<string, unknown>) {
  return Object.values(record).some((value) => {
    if (value == null) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  });
}

export async function syncBreedRelations(
  breedId: string,
  body: Record<string, unknown>,
) {
  const writes: Promise<unknown>[] = [];

  if (body.characteristics !== undefined) {
    writes.push(
      prisma.breedCharacteristic.deleteMany({ where: { breedId } }).then(() =>
        prisma.breedCharacteristic.createMany({
          data: normalizeStringArray(body.characteristics).map((label) => ({
            breedId,
            label,
          })),
        }),
      ),
    );
  }

  if (body.careGuide !== undefined) {
    const careBody = (body.careGuide ?? {}) as Record<string, unknown>;
    const careData = {
      brushingFrequency: cleanString(careBody.brushingFrequency),
      bathing: cleanString(careBody.bathing),
      eyeCare: cleanString(careBody.eyeCare),
      earCare: cleanString(careBody.earCare),
      nailCare: cleanString(careBody.nailCare),
      dentalCare: cleanString(careBody.dentalCare),
      sheddingLevel: cleanString(careBody.sheddingLevel),
      hairballRisk: cleanString(careBody.hairballRisk),
      notes: cleanString(careBody.notes),
    };
    writes.push(
      hasAnyValue(careData)
        ? prisma.breedCareGuide.upsert({
            where: { breedId },
            create: { breedId, ...careData },
            update: careData,
          })
        : prisma.breedCareGuide.deleteMany({ where: { breedId } }),
    );
  }

  if (body.nutritionGuide !== undefined) {
    const nutritionBody = (body.nutritionGuide ?? {}) as Record<string, unknown>;
    const nutritionData = {
      lifeStageNotes: cleanString(nutritionBody.lifeStageNotes),
      proteinNotes: cleanString(nutritionBody.proteinNotes),
      hydrationNotes: cleanString(nutritionBody.hydrationNotes),
      portionNotes: cleanString(nutritionBody.portionNotes),
      obesityRisk: cleanString(nutritionBody.obesityRisk),
      specialNeeds: cleanString(nutritionBody.specialNeeds),
    };
    writes.push(
      hasAnyValue(nutritionData)
        ? prisma.breedNutritionGuide.upsert({
            where: { breedId },
            create: { breedId, ...nutritionData },
            update: nutritionData,
          })
        : prisma.breedNutritionGuide.deleteMany({ where: { breedId } }),
    );
  }

  if (body.healthNotes !== undefined) {
    const notes = Array.isArray(body.healthNotes) ? body.healthNotes : [];
    writes.push(
      prisma.breedHealthNote.deleteMany({ where: { breedId } }).then(() =>
        prisma.breedHealthNote.createMany({
          data: notes
            .map((note, index) => {
              const item = (note ?? {}) as Record<string, unknown>;
              return {
                breedId,
                title: cleanString(item.title),
                description: cleanString(item.description),
                severityLabel: cleanString(item.severityLabel),
                monitoringTips: cleanString(item.monitoringTips),
                sortOrder: Number(item.sortOrder ?? index),
              };
            })
            .filter((note) => note.title && note.description)
            .map((note) => ({
              ...note,
              title: note.title!,
              description: note.description!,
            })),
        }),
      ),
    );
  }

  if (body.costEstimates !== undefined) {
    const costs = Array.isArray(body.costEstimates) ? body.costEstimates : [];
    writes.push(
      prisma.breedCostEstimate.deleteMany({ where: { breedId } }).then(() =>
        prisma.breedCostEstimate.createMany({
          data: costs
            .map((cost) => {
              const item = (cost ?? {}) as Record<string, unknown>;
              return {
                breedId,
                initialCostLabel: cleanString(item.initialCostLabel),
                monthlyCostLabel: cleanString(item.monthlyCostLabel),
                groomingCostLabel: cleanString(item.groomingCostLabel),
                vaccineCheckupLabel: cleanString(item.vaccineCheckupLabel),
                starterKitLabel: cleanString(item.starterKitLabel),
                cityLabel: cleanString(item.cityLabel),
                notes: cleanString(item.notes),
              };
            })
            .filter(hasAnyValue),
        }),
      ),
    );
  }

  if (body.galleryImages !== undefined) {
    const images = Array.isArray(body.galleryImages) ? body.galleryImages : [];
    writes.push(
      prisma.breedGalleryImage.deleteMany({ where: { breedId } }).then(() =>
        prisma.breedGalleryImage.createMany({
          data: images
            .map((image, index) => {
              const item = (image ?? {}) as Record<string, unknown>;
              return {
                breedId,
                url: cleanString(item.url),
                alt: cleanString(item.alt),
                type: normalizeGalleryType(item.type),
                credit: cleanString(item.credit),
                sourceUrl: cleanString(item.sourceUrl),
                sortOrder: Number(item.sortOrder ?? index),
              };
            })
            .filter((image) => image.url)
            .map((image) => ({ ...image, url: image.url! })),
        }),
      ),
    );
  }

  if (body.colorPatterns !== undefined) {
    const colors = Array.isArray(body.colorPatterns) ? body.colorPatterns : [];
    writes.push(
      prisma.breedColorPattern.deleteMany({ where: { breedId } }).then(() =>
        prisma.breedColorPattern.createMany({
          data: colors
            .map((color, index) => {
              const item = (color ?? {}) as Record<string, unknown>;
              return {
                breedId,
                name: cleanString(item.name),
                description: cleanString(item.description),
                imageUrl: cleanString(item.imageUrl),
                sortOrder: Number(item.sortOrder ?? index),
              };
            })
            .filter((color) => color.name)
            .map((color) => ({ ...color, name: color.name! })),
        }),
      ),
    );
  }

  if (body.similarBreeds !== undefined) {
    const similars = Array.isArray(body.similarBreeds) ? body.similarBreeds : [];
    writes.push(
      prisma.breedSimilar.deleteMany({ where: { breedId } }).then(() =>
        prisma.breedSimilar.createMany({
          data: similars
            .map((similar, index) => {
              const item = (similar ?? {}) as Record<string, unknown>;
              const similarBreedId = cleanString(item.similarBreedId);
              return {
                breedId,
                similarBreedId,
                reason: cleanString(item.reason),
                sortOrder: Number(item.sortOrder ?? index),
              };
            })
            .filter(
              (similar) =>
                similar.similarBreedId && similar.similarBreedId !== breedId,
            )
            .map((similar) => ({
              ...similar,
              similarBreedId: similar.similarBreedId!,
            })),
          skipDuplicates: true,
        }),
      ),
    );
  }

  if (body.suitabilities !== undefined) {
    const suitabilities = Array.isArray(body.suitabilities)
      ? body.suitabilities
      : [];
    writes.push(
      prisma.breedSuitability.deleteMany({ where: { breedId } }).then(() =>
        prisma.breedSuitability.createMany({
          data: suitabilities
            .map((suitability, index) => {
              const item = (suitability ?? {}) as Record<string, unknown>;
              return {
                breedId,
                type: normalizeSuitabilityType(item.type),
                label: cleanString(item.label),
                description: cleanString(item.description),
                sortOrder: Number(item.sortOrder ?? index),
              };
            })
            .filter((suitability) => suitability.label)
            .map((suitability) => ({
              ...suitability,
              label: suitability.label!,
            })),
        }),
      ),
    );
  }

  await Promise.all(writes);
}

export function serializeBreed(breed: any) {
  return {
    id: breed.id,
    slug: breed.slug,
    name: breed.name,
    origin: breed.origin,
    imageSrc: breed.imageSrc,
    profileSummary: breed.profileSummary,
    foodType: breed.foodType,
    kittenPriceLabel: breed.kittenPriceLabel,
    monthlyCareLabel: breed.monthlyCareLabel,
    careLevel: breed.careLevel,
    availability: breed.availability,
    matchLabel: breed.matchLabel,
    alternativeNames: Array.isArray(breed.alternativeNames)
      ? breed.alternativeNames
      : [],
    shortDescription: breed.shortDescription,
    backdropImageSrc: breed.backdropImageSrc,
    history: breed.history,
    personalityDescription: breed.personalityDescription,
    sizeLabel: breed.sizeLabel,
    maleWeightRange: breed.maleWeightRange,
    femaleWeightRange: breed.femaleWeightRange,
    lifeExpectancy: breed.lifeExpectancy,
    coatLength: breed.coatLength,
    coatPatterns: breed.coatPatterns,
    activityLevel: breed.activityLevel,
    vocalLevel: breed.vocalLevel,
    indoorFit: breed.indoorFit,
    beginnerFitScore: breed.beginnerFitScore,
    activityScore: breed.activityScore,
    friendlinessScore: breed.friendlinessScore,
    groomingScore: breed.groomingScore,
    vocalScore: breed.vocalScore,
    adaptabilityScore: breed.adaptabilityScore,
    childFriendlyScore: breed.childFriendlyScore,
    petFriendlyScore: breed.petFriendlyScore,
    sourceNotes: breed.sourceNotes,
    contentUpdatedAt: breed.contentUpdatedAt?.toISOString() ?? null,
    commercialUpdatedAt: breed.commercialUpdatedAt?.toISOString() ?? null,
    isPublished: breed.isPublished,
    isFeatured: breed.isFeatured,
    viewCount: breed.viewCount,
    characteristics: breed.characteristics.map((item: { label: string }) => item.label),
    careGuide: breed.careGuide,
    nutritionGuide: breed.nutritionGuide,
    healthNotes: breed.healthNotes,
    costEstimates: breed.costEstimates,
    galleryImages: breed.galleryImages,
    colorPatterns: breed.colorPatterns,
    similarBreeds: breed.similarBreeds.map((item: any) => ({
      id: item.id,
      similarBreedId: item.similarBreedId,
      similarBreedName: item.similarBreed?.name ?? null,
      similarBreedSlug: item.similarBreed?.slug ?? null,
      reason: item.reason,
      sortOrder: item.sortOrder,
    })),
    suitabilities: breed.suitabilities,
    catCount: breed._count?.cats ?? 0,
    articleCount: breed._count?.articles ?? 0,
  };
}
