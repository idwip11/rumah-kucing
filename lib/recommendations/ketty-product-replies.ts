import { getLifeStageLabel } from "@/lib/recommendations/profile";
import type {
  DerivedCatProfile,
  ProductMatch,
  RecommendationProduct,
  TimelineCareSignals,
} from "@/lib/recommendations/types";

type KettyProductIntent =
  | "food"
  | "snack"
  | "grooming"
  | "hydration"
  | "toy"
  | "medical"
  | "any";

export type KettyRankedProduct = {
  product: RecommendationProduct;
  match: ProductMatch;
  previouslyOrdered?: boolean;
};

export type KettyProductReplyContext = {
  profile: DerivedCatProfile;
  gender?: string | null;
  ageLabel?: string | null;
  notes?: string | null;
  healthConditions: string[];
  previousProductNames: string[];
  careSignals: TimelineCareSignals;
  rankedProducts: KettyRankedProduct[];
  unsafeProductCount: number;
  availableProductCount: number;
  medicalIntent: boolean;
};

function normalize(value: string | null | undefined) {
  return value
    ?.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase() ?? "";
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function productText(product: RecommendationProduct) {
  return normalize(
    [
      product.name,
      product.category,
      product.reason,
      product.description,
      product.badge,
      ...(product.tags ?? []).map((tag) => tag.tag),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function formatRupiah(value: RecommendationProduct["priceIdr"]) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function getProductIntent(question: string): KettyProductIntent {
  const text = normalize(question);

  if (
    includesAny(text, [
      "obat",
      "medicine",
      "medis",
      "medical",
      "prescription",
      "resep",
      "renal",
      "suplemen",
      "supplement",
      "urinary",
      "veterinary",
      "vitamin",
    ])
  ) {
    return "medical";
  }

  if (
    includesAny(text, [
      "makanan",
      "pakan",
      "cat food",
      "dry food",
      "wet food",
      "kibble",
      "nutrisi",
    ])
  ) {
    return "food";
  }

  if (includesAny(text, ["snack", "treat", "cemilan", "camilan"])) {
    return "snack";
  }

  if (includesAny(text, ["grooming", "sisir", "shampoo", "sampo", "bulu"])) {
    return "grooming";
  }

  if (
    includesAny(text, [
      "hidrasi",
      "minum",
      "air mancur",
      "fountain",
      "water fountain",
    ])
  ) {
    return "hydration";
  }

  if (includesAny(text, ["mainan", "toy", "bermain", "aktivitas"])) {
    return "toy";
  }

  return "any";
}

export function isProductRecommendationQuestion(question: string) {
  const text = normalize(question);
  const productSignal = includesAny(text, [
    "produk",
    "makanan",
    "pakan",
    "cat food",
    "dry food",
    "wet food",
    "snack",
    "treat",
    "mainan",
    "toy",
    "grooming",
    "sisir",
    "fountain",
    "hidrasi",
    "suplemen",
    "vitamin",
    "obat",
  ]);
  const recommendationSignal = includesAny(text, [
    "apa yang cocok",
    "cocok",
    "rekomendasi",
    "recommend",
    "pilihan",
    "saran",
    "sarankan",
    "yang bagus",
    "bagus untuk",
    "sesuai untuk",
  ]);

  return productSignal && recommendationSignal;
}

export function isMedicalProductQuestion(question: string) {
  return getProductIntent(question) === "medical";
}

export function productMatchesKettyQuestion(
  product: RecommendationProduct,
  question: string,
) {
  const intent = getProductIntent(question);
  const questionText = normalize(question);
  if (intent === "any") return true;

  const text = productText(product);

  if (intent === "medical") {
    return includesAny(text, [
      "obat",
      "medical",
      "medis",
      "prescription",
      "renal",
      "suplemen",
      "supplement",
      "urinary",
      "veterinary",
      "vitamin",
    ]);
  }

  if (intent === "food") {
    const feedingEquipment = includesAny(text, [
      "botol dot",
      "dot susu",
      "feeding kit",
      "nursing bottle",
      "set botol",
    ]);
    if (
      feedingEquipment &&
      !includesAny(questionText, [
        "botol",
        "dot",
        "feeding kit",
        "susu",
        "menyusui",
        "baru lahir",
      ])
    ) {
      return false;
    }

    return includesAny(text, [
      "cat food",
      "dry food",
      "food/makanan",
      "makanan",
      "nutrition",
      "pakan",
      "wet food",
    ]);
  }

  if (intent === "snack") {
    return includesAny(text, ["snack", "treat", "cemilan", "camilan"]);
  }

  if (intent === "grooming") {
    return includesAny(text, [
      "bulu",
      "coat",
      "grooming",
      "shampoo",
      "sampo",
      "sisir",
    ]);
  }

  if (intent === "hydration") {
    return includesAny(text, [
      "air mancur",
      "fountain",
      "hidrasi",
      "hydration",
      "tinggi air",
      "wet food",
    ]);
  }

  if (intent === "toy") {
    return includesAny(text, [
      "catnip",
      "interactive",
      "mainan",
      "stimulasi",
      "toy",
    ]);
  }

  return true;
}

function buildProfileFacts(context: KettyProductReplyContext) {
  const { profile, gender, ageLabel, healthConditions, careSignals } = context;
  const facts = [
    ageLabel
      ? `usia **${ageLabel}**`
      : profile.lifeStage !== "unknown"
        ? `tahap usia **${getLifeStageLabel(profile.lifeStage)}**`
        : null,
    profile.breedName ? `ras **${profile.breedName}**` : null,
    gender ? `jenis kelamin **${gender}**` : null,
    profile.isSterilized ? "**sudah steril**" : null,
    profile.lifestyle !== "unknown" ? `gaya hidup **${profile.lifestyle}**` : null,
    profile.weightKg ? `berat **${profile.weightKg.toString().replace(".", ",")} kg**` : null,
    profile.coatLength === "long" ? "bulu panjang" : null,
    careSignals.hairballEvents30d > 0
      ? `${careSignals.hairballEvents30d} catatan hairball dalam 30 hari terakhir`
      : null,
    careSignals.hydrationConcern ? "ada sinyal perhatian hidrasi" : null,
    healthConditions.length > 0
      ? `riwayat kesehatan: ${healthConditions.slice(0, 3).join(", ")}`
      : null,
  ].filter(Boolean);

  return facts.join(", ");
}

function buildMissingData(profile: DerivedCatProfile, notes?: string | null) {
  const missing = [
    profile.lifeStage === "unknown" ? "tanggal lahir atau usia" : null,
    !profile.breedName ? "ras" : null,
    !profile.weightKg ? "berat badan terbaru" : null,
    profile.lifestyle === "unknown" ? "gaya hidup indoor/outdoor" : null,
    !notes ? "catatan alergi, sensitivitas, atau bahan yang perlu dihindari" : null,
  ].filter(Boolean);

  return missing;
}

function medicalGuardrailReply(context: KettyProductReplyContext) {
  const { profile } = context;
  const missing = buildMissingData(profile, context.notes);

  return `### Rekomendasi aman untuk ${profile.name}

Untuk **obat, suplemen, vitamin, urinary/renal diet, prescription diet, atau produk veterinary**, Ketty AI tidak akan memberi rekomendasi pemakaian langsung dari katalog.

> Catatan: Konsultasikan dengan dokter hewan sebelum menggunakan produk medis atau suplemen. Ketty AI tidak mendiagnosis, tidak menentukan dosis, dan tidak menjamin produk dapat mengobati kondisi tertentu.

Ketty bisa membantu menyiapkan konteks untuk konsultasi: berat ${profile.weightKg ? `**${profile.weightKg.toString().replace(".", ",")} kg**` : "belum tercatat"}, gaya hidup ${profile.lifestyle !== "unknown" ? `**${profile.lifestyle}**` : "belum tercatat"}, dan riwayat kesehatan terbaru dari timeline.
${missing.length > 0 ? `\n\nData yang sebaiknya dilengkapi agar saran perawatan lebih akurat:\n${missing.map((item) => `- ${item}`).join("\n")}` : ""}`;
}

export function buildKettyProductRecommendationReply(
  context: KettyProductReplyContext,
) {
  const { profile, rankedProducts, medicalIntent } = context;

  if (medicalIntent) {
    return medicalGuardrailReply(context);
  }

  if (context.availableProductCount === 0) {
    return "Ketty AI belum menemukan produk aktif di database katalog, jadi belum bisa membuat rekomendasi produk personal.";
  }

  if (rankedProducts.length === 0) {
    const unsafeNote =
      context.unsafeProductCount > 0
        ? "\n\nKetty juga menemukan beberapa produk yang tidak dimasukkan karena rule engine menandainya kurang aman atau tidak sesuai untuk profil kucing saat ini."
        : "";

    return `Ketty AI sudah mengecek profil **${profile.name}** dan katalog produk, tetapi belum menemukan pilihan yang cukup sesuai untuk direkomendasikan.${unsafeNote}`;
  }

  const profileFacts = buildProfileFacts(context);
  const missing = buildMissingData(profile, context.notes);
  const previousProducts =
    context.previousProductNames.length > 0
      ? unique(context.previousProductNames).slice(0, 4).join(", ")
      : null;

  const productLines = rankedProducts.slice(0, 3).map((item, index) => {
    const reasons = item.match.reasons.slice(0, 3);
    const benefits = item.match.benefits.slice(0, 2);
    const cautions =
      item.match.cautions.length > 0
        ? item.match.cautions
        : ["Belum ada catatan perhatian khusus dari data profil dan produk."];
    const safety = item.match.safetyWarning
      ? `\n  > Catatan: ${item.match.safetyWarning}`
      : "";
    const orderedNote = item.previouslyOrdered
      ? "\n  Riwayat: produk ini pernah muncul di riwayat pesanan akun Anda."
      : "";

    return `${index + 1}. **${item.product.name}** — ${formatRupiah(item.product.priceIdr)} (${item.match.label})
   Mengapa cocok untuk **${profile.name}**:
${reasons.map((reason) => `   - ${reason}`).join("\n")}
   Manfaat utama:
${benefits.map((benefit) => `   - ${benefit}`).join("\n")}
   Perlu diperhatikan:
${cautions.map((caution) => `   - ${caution}`).join("\n")}${orderedNote}${safety}`;
  });

  return `### Pilihan yang cocok untuk ${profile.name}

Ketty AI mencocokkan profil **${profile.name}** dengan rule engine rekomendasi Rumah Kucing, bukan memilih produk secara acak.

Data yang dipakai: ${profileFacts || "profil dasar kucing yang tersedia di akun ini"}.${previousProducts ? ` Ketty juga melihat riwayat produk: ${previousProducts}.` : ""}

${productLines.join("\n\n")}
${missing.length > 0 ? `\n\n### Data yang masih bisa dilengkapi\n\n${missing.map((item) => `- ${item}`).join("\n")}` : ""}

> Catatan: Untuk obat, suplemen, prescription diet, urinary/renal diet, atau kondisi medis tertentu, konsultasikan dulu dengan dokter hewan.`;
}
