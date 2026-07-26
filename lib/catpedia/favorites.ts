export const BREED_FAVORITE_LIST_TYPES = [
  "favorite",
  "learn_later",
  "adoption_consideration",
  "had_before",
] as const;

export type BreedFavoriteListType =
  (typeof BREED_FAVORITE_LIST_TYPES)[number];

export const BREED_FAVORITE_LIST_META: Record<
  BreedFavoriteListType,
  { label: string; description: string }
> = {
  favorite: {
    label: "Favorit",
    description: "Ras yang paling menarik perhatianmu.",
  },
  learn_later: {
    label: "Ingin dipelajari",
    description: "Simpan untuk dibaca lebih lengkap nanti.",
  },
  adoption_consideration: {
    label: "Pertimbangan adopsi",
    description: "Ras yang sedang masuk pertimbanganmu.",
  },
  had_before: {
    label: "Pernah dipelihara",
    description: "Catat ras yang pernah menjadi bagian keluargamu.",
  },
};

export function isBreedFavoriteListType(
  value: unknown,
): value is BreedFavoriteListType {
  return BREED_FAVORITE_LIST_TYPES.includes(
    value as BreedFavoriteListType,
  );
}
