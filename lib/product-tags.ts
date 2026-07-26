const ACRONYM_WORDS = new Set(["id", "kg", "ml"]);
const TAG_ALIASES: Record<string, string> = {
  dryfood: "dry food",
  wetfood: "wet food",
};

export function normalizeProductTag(value: unknown) {
  const tag = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  return TAG_ALIASES[tag] ?? tag;
}

export function normalizeProductTags(values: unknown[], limit = 20) {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const value of values) {
    const tag = normalizeProductTag(value);
    if (!tag || seen.has(tag)) {
      continue;
    }

    seen.add(tag);
    tags.push(tag);

    if (tags.length >= limit) {
      break;
    }
  }

  return tags;
}

export function displayProductTag(value: string) {
  return normalizeProductTag(value)
    .split(" ")
    .map((word) =>
      word
        .split("/")
        .map((part) => {
          if (!part) return part;
          if (ACRONYM_WORDS.has(part)) return part.toUpperCase();
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join("/"),
    )
    .join(" ");
}

export function uniqueDisplayProductTags(values: string[]) {
  return normalizeProductTags(values, Number.POSITIVE_INFINITY).map(displayProductTag);
}

export type ProductTagOption = {
  value: string;
  label: string;
};

export function buildProductTagOptions(values: string[]): ProductTagOption[] {
  return normalizeProductTags(values, Number.POSITIVE_INFINITY).map((value) => ({
    value,
    label: displayProductTag(value),
  }));
}
