import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { normalizeProductTag } from "@/lib/product-tags";
import { analyzeTimelineCareSignals } from "@/lib/recommendations/care-rules";
import { buildTastePreferenceSignals } from "@/lib/recommendations/feedback-rules";
import {
  buildKettyProductRecommendationReply,
  isMedicalProductQuestion,
  isProductRecommendationQuestion,
  productMatchesKettyQuestion,
} from "@/lib/recommendations/ketty-product-replies";
import { deriveCatProfile } from "@/lib/recommendations/profile";
import { rankProductsForCat } from "@/lib/recommendations/product-rules";
import type { RecommendationFeedbackResponse } from "@/lib/recommendations/types";
import { RecommendationType } from "@prisma/client";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `Kamu adalah "Ketty AI", asisten cerdas untuk aplikasi Rumah Kucing (perawatan kucing).

Backend Rumah Kucing selalu mengambil data PostgreSQL terlebih dahulu dan mengirimkannya kepadamu sebagai DATABASE_CONTEXT_JSON. Gunakan data tersebut sebagai sumber utama. Jangan mengarang data di luar context database.

FORMAT JAWABAN (WAJIB RAPI & TERSTRUKTUR):
- Gunakan format Markdown yang bersih, rapi, dan nyaman dibaca (mirip asisten AI modern).
- Gunakan paragraf-paragraf pendek dengan jeda baris kosong antar paragraf.
- Gunakan Judul (misal ### Header) untuk membagi bagian jika jawaban panjang atau memiliki beberapa aspek.
- Gunakan Bullet Points ('- ') atau List Angka ('1. ') untuk daftar poin, rekomendasi, langkah-langkah, atau ringkasan data. JANGAN menggabungkan banyak poin dalam satu baris paragraf panjang.
- Gunakan Teks Tebal (**teks**) untuk menyorot kata kunci penting, nama kucing, harga, tanggal, atau nama produk.
- Gunakan Catatan/Blockquote (> Catatan: ...) untuk penjelasan penting atau peringatan medis.

DATA YANG TERSEDIA (semua read-only):
1. **Profil Kucing** — nama, ras, usia, berat, gender, status steril, gaya hidup, catatan. Termasuk karakteristik ras.
2. **Timeline / Jadwal Kesehatan** — vaksin, berat badan, riwayat sakit, makanan, grooming, momen foto.
3. **Prestasi (Achievements)** — juara, lomba, pencapaian kucing.
4. **Katalog Produk** — makanan, snack, aksesori, mainan, suplemen (harga, kategori, tag, deskripsi, stok).
5. **Riwayat Pesanan** — produk, jumlah, harga, total, tanggal, status pesanan pengguna.
6. **Event Anabul** — acara/kompetisi/pameran kucing mendatang.
7. **Ras Kucing (Breeds)** — karakteristik, asal, level perawatan, ketersediaan.
8. **Artikel Edukasi** — artikel perawatan kucing per ras.

ATURAN PENTING (WAJIB DIPATUHI):
- Kamu HANYA boleh MEMBACA data dan memberikan jawaban (informasi/edukasi). Kamu TIDAK BOLEH melakukan tindakan apa pun: tidak boleh mengeksekusi perintah, tidak boleh mengubah, menghapus, membuat, atau memperbarui data apa pun.
- Jika pengguna meminta melakukan aksi (misal "hapus catatan", "tambahkan jadwal", "ubah profil", "buat pesanan", "checkout"), tolak dengan sopan dan arahkan mereka untuk melakukannya lewat menu di aplikasi.
- Jawab dalam Bahasa Indonesia yang ramah dan mudah dipahami.
- Untuk kondisi darurat medis, sarankan menghubungi dokter hewan.
- Untuk rekomendasi produk personal, gunakan hasil rule engine rekomendasi Rumah Kucing jika tersedia. Jangan membuat ranking produk sendiri, jangan menampilkan persentase kecocokan, dan jangan merekomendasikan produk yang ditandai tidak aman atau tidak sesuai.
- Untuk obat, suplemen, veterinary diet, prescription diet, urinary/renal diet, vitamin, atau produk medis, jangan mendiagnosis, jangan menjanjikan penyembuhan, dan selalu sarankan konsultasi dokter hewan.
- Gunakan HANYA data dari DATABASE_CONTEXT_JSON. Jika data tidak tersedia (mis. belum ada pesanan/prestasi), katakan dengan jujur bahwa data tersebut belum ada.
- Untuk harga produk, gunakan format Rupiah (Rp).
- Jika DATABASE_CONTEXT_JSON hanya berisi counts dan data relevan yang kosong, jelaskan bahwa data cocok belum ditemukan, lalu sarankan menu atau kata kunci yang bisa dicoba.`;

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
};

type GroqTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

type KettyDatabaseContext = Awaited<ReturnType<typeof buildKettyDatabaseContext>>;

const TIMELINE_CATEGORY_ALIASES: Record<string, string> = {
  vaksin: "Vaksin",
  "berat badan": "Berat_badan",
  berat_badan: "Berat_badan",
  "riwayat sakit": "Riwayat_sakit",
  riwayat_sakit: "Riwayat_sakit",
  sakit: "Riwayat_sakit",
  penyakit: "Riwayat_sakit",
  makanan: "Makanan",
  grooming: "Grooming",
  "momen foto": "Momen_foto",
  momen_foto: "Momen_foto",
  lainnya: "Lainnya",
};

function normalizeTimelineCategory(category: unknown) {
  if (typeof category !== "string" || !category.trim()) {
    return undefined;
  }

  const key = category.trim().toLowerCase().replace(/\s+/g, " ");
  return TIMELINE_CATEGORY_ALIASES[key] ?? category.trim().replace(/\s+/g, "_");
}

function displayCategory(category: string | null | undefined) {
  return category ? category.replace(/_/g, " ") : null;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function isCountQuestion(text: string) {
  const normalized = normalizeText(text);
  return (
    includesAny(normalized, [
      "ada berapa",
      "berapa banyak",
      "jumlah",
      "total",
      "banyak",
      "seberapa banyak",
    ]) ||
    /\bberapa\s+(?:ekor\s+)?(?:kucing|anabul)\b/.test(normalized) ||
    /\b(?:kucing|anabul)\b.*\bberapa\b/.test(normalized)
  );
}

function isCatProfileQuestion(text: string) {
  const normalized = normalizeText(text);
  const hasCatSignal = includesAny(normalized, [
    "anabul",
    "kucing",
    "meng",
    "meong",
  ]);
  const hasOwnerSignal = includesAny(normalized, [
    "aku",
    "gw",
    "gue",
    "ku",
    "punyaku",
    "saya",
    "sy",
    "sya",
  ]);
  const hasProfileSignal = includesAny(normalized, [
    "daftar",
    "nama",
    "profil",
    "profile",
    "punya",
    "terdaftar",
    "umur",
    "usia",
    "berat",
    "steril",
  ]);

  return (
    (hasCatSignal && hasOwnerSignal && isCountQuestion(normalized)) ||
    (hasCatSignal && (isCountQuestion(normalized) || hasProfileSignal))
  );
}

function buildCatProfileReply(
  context: KettyDatabaseContext,
  prefix = "",
  countOnly = false,
) {
  if (context.cats.length === 0) {
    return `${prefix}Ketty AI belum menemukan profil kucing di database akun ini.`;
  }

  const countLine = `Di akun Anda saat ini ada **${context.cats.length} profil kucing**.`;

  if (countOnly && context.cats.length > 0) {
    return `${prefix}### Kucing di akun Anda\n\n${countLine}\n\n${context.cats
      .map(
        (cat, index) =>
          `${index + 1}. **${cat.name}**${cat.breed?.name ? ` — ${cat.breed.name}` : ""}${
            cat.ageLabel ? `, ${cat.ageLabel}` : ""
          }${cat.weightKg ? `, ${cat.weightKg} kg` : ""}`,
      )
      .join("\n")}`;
  }

  return `${prefix}### Profil kucing yang ditemukan\n\n${countLine}\n\n${context.cats
    .map(
      (cat) =>
        `- **${cat.name}**: ${cat.breed?.name ?? "Ras belum diisi"}, usia ${
          cat.ageLabel ?? "-"
        }, berat ${cat.weightKg ?? "-"} kg, ${cat.gender ?? "gender belum diisi"}, steril: ${
          cat.sterilized ? "sudah" : "belum"
        }, gaya hidup ${cat.lifestyle ?? "-"}.`,
    )
    .join("\n")}`;
}

function extractMonthlyBudget(text: string) {
  const normalized = normalizeText(text).replace(/,/g, ".");
  const patterns = [
    /(?:penghasilan|gaji|income|budget|anggaran)\s*(?:saya|ku|perbulan|per bulan|bulanan)?\s*(?:rp\.?\s*)?(\d+(?:\.\d+)?)\s*(juta|jt|ribu|rb)?/i,
    /(?:rp\.?\s*)?(\d+(?:\.\d+)?)\s*(juta|jt|ribu|rb)\s*(?:perbulan|per bulan|\/bulan|sebulan|bulanan)/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match) continue;

    const amount = Number(match[1]);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    const unit = match[2] ?? "";
    if (unit === "juta" || unit === "jt") return amount * 1_000_000;
    if (unit === "ribu" || unit === "rb") return amount * 1_000;

    return amount;
  }

  return null;
}

function extractRupiahNumbers(label: string | null | undefined) {
  const normalized = normalizeText(label)
    .replace(/rp\.?/g, "")
    .replace(/idr/g, "")
    .replace(/,/g, ".");
  const matches = Array.from(
    normalized.matchAll(/(\d+(?:\.\d+)?)\s*(juta|jt|ribu|rb)?/g),
  );
  const values: number[] = [];

  for (const match of matches) {
    const amount = Number(match[1]);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    const unit = match[2] ?? "";
    if (unit === "juta" || unit === "jt") {
      values.push(amount * 1_000_000);
    } else if (unit === "ribu" || unit === "rb") {
      values.push(amount * 1_000);
    } else {
      values.push(amount);
    }
  }

  return values;
}

function getMonthlyCareRange(label: string | null | undefined) {
  const values = extractRupiahNumbers(label);
  if (values.length === 0) return null;
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((total, value) => total + value, 0) / values.length,
  };
}

function isBreedRecommendationQuestion(text: string) {
  const normalized = normalizeText(text);
  const wantsNewCat = includesAny(normalized, [
    "tambah kucing",
    "adopsi",
    "beli kucing",
    "kucing apa",
    "ras apa",
    "ras yang cocok",
    "kucing yang cocok",
    "pelihara kucing",
  ]);
  const hasBudgetSignal = includesAny(normalized, [
    "penghasilan",
    "gaji",
    "budget",
    "anggaran",
    "perbulan",
    "per bulan",
    "juta",
    "ribu",
  ]);

  return wantsNewCat && includesAny(normalized, ["kucing", "ras"]) && hasBudgetSignal;
}

function careLevelScore(careLevel: string | null | undefined) {
  const normalized = normalizeText(careLevel);
  if (includesAny(normalized, ["rendah", "low", "mudah"])) return 18;
  if (includesAny(normalized, ["sedang", "medium", "menengah"])) return 10;
  if (includesAny(normalized, ["tinggi", "high", "intensif"])) return -10;
  return 0;
}

function buildBreedRecommendationReply(
  question: string,
  context: KettyDatabaseContext,
) {
  if (context.breeds.length === 0) {
    return "Ketty AI belum menemukan data ras kucing di database, jadi belum bisa memberi rekomendasi ras yang cocok.";
  }

  const monthlyIncome = extractMonthlyBudget(question);
  const monthlyCareTarget = monthlyIncome ? monthlyIncome * 0.15 : null;
  const scoredBreeds = context.breeds
    .map((breed) => {
      const monthlyCareRange = getMonthlyCareRange(breed.monthlyCareLabel);
      const characteristicsText = normalizeText(breed.characteristics.join(" "));
      let score = 50 + careLevelScore(breed.careLevel);

      if (monthlyCareTarget && monthlyCareRange) {
        if (monthlyCareRange.max <= monthlyCareTarget) score += 30;
        else if (monthlyCareRange.average <= monthlyCareTarget) score += 22;
        else if (monthlyCareRange.min <= monthlyCareTarget) score += 12;
        else if (monthlyCareRange.min <= monthlyCareTarget * 1.4) score += 4;
        else score -= 24;
      }

      if (includesAny(characteristicsText, ["ramah", "tenang", "adaptif", "sosial"])) {
        score += 8;
      }
      if (includesAny(characteristicsText, ["aktif", "enerjik", "butuh stimulasi"])) {
        score -= 4;
      }

      return { breed, score, monthlyCareRange };
    })
    .sort((a, b) => b.score - a.score);

  const recommended = scoredBreeds.slice(0, 4);
  const cautious = scoredBreeds
    .filter((item) => item.score < 50)
    .slice(0, 3);

  const budgetLine = monthlyIncome
    ? `Dengan penghasilan sekitar **${formatRupiah(monthlyIncome)} per bulan**, Ketty AI memakai patokan awal biaya rutin sekitar **maksimal 15% penghasilan** untuk makanan, pasir, grooming dasar, dan kebutuhan harian.`
    : "Ketty AI belum menangkap angka budget yang pasti, jadi rekomendasi diurutkan dari biaya/perawatan yang cenderung lebih ringan berdasarkan data ras.";

  const recommendationLines = recommended
    .map(({ breed, monthlyCareRange }) => {
      const reasons = [
        breed.careLevel ? `level perawatan **${breed.careLevel}**` : null,
        breed.monthlyCareLabel
          ? `estimasi rutin **${breed.monthlyCareLabel}**`
          : null,
        breed.availability ? `ketersediaan **${breed.availability}**` : null,
      ].filter(Boolean);

      return `- **${breed.name}**${breed.origin ? ` (${breed.origin})` : ""}: ${
        breed.profileSummary ?? "Profil ringkas belum diisi."
      }\n  ${reasons.join(", ") || "Data biaya/perawatan belum lengkap."}${
        monthlyCareRange && monthlyCareTarget
          ? monthlyCareRange.average <= monthlyCareTarget
            ? "\n  **Alasan cocok:** estimasi biaya rutin masih masuk patokan budget konservatif."
            : monthlyCareRange.min <= monthlyCareTarget
              ? "\n  **Masih realistis:** pilih pengeluaran di sisi hemat dari range biaya rutin."
              : "\n  **Perlu dipertimbangkan:** biaya rutin cenderung melewati patokan budget awal."
          : ""
      }`;
    })
    .join("\n");

  const cautiousLines =
    cautious.length > 0
      ? `\n\n### Perlu pertimbangan ekstra\n\n${cautious
          .map(
            ({ breed }) =>
              `- **${breed.name}**: ${
                breed.monthlyCareLabel
                  ? `biaya rutin ${breed.monthlyCareLabel}`
                  : "data biaya rutin belum lengkap"
              }${
                breed.careLevel ? `, level perawatan ${breed.careLevel}` : ""
              }.`,
          )
          .join("\n")}`
      : "";

  return `### Rekomendasi ras dari database Rumah Kucing\n\n${budgetLine}\n\n### Pilihan yang paling masuk akal\n\n${recommendationLines}${cautiousLines}\n\n> Catatan: Ini bukan keputusan final. Sebelum adopsi atau membeli kucing, tetap siapkan dana awal untuk vaksin, steril, pasir, makanan, grooming, dan dana darurat dokter hewan.`;
}

function isIdealWeightQuestion(text: string) {
  const normalized = text.toLowerCase();
  return (
    includesAny(normalized, [
      "berat ideal",
      "ideal weight",
      "berat badan ideal",
      "ideal body weight",
    ]) &&
    includesAny(normalized, ["kucing", "cat", "anabul"])
  );
}

function extractBcsScore(text: string) {
  const normalized = text.toLowerCase().replace(",", ".");
  const patterns = [
    /bcs\s*(?:score)?\s*(\d)(?:\s*\/\s*9)?/i,
    /body condition score\s*(\d)(?:\s*\/\s*9)?/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const score = Number(match[1]);
      if (score >= 1 && score <= 9) {
        return score;
      }
    }
  }

  return null;
}

function formatKilograms(value: number) {
  return `${value.toFixed(2).replace(".", ",")} kg`;
}

function buildIdealWeightReply(
  question: string,
  context: KettyDatabaseContext,
  activeCatId?: string | null,
) {
  const targetCat =
    (activeCatId
      ? context.cats.find((cat) => cat.id === activeCatId)
      : null) ?? context.cats[0];

  if (!targetCat) {
    return "Ketty AI belum menemukan profil kucing di database akun ini, jadi berat ideal belum bisa dihitung.";
  }

  if (targetCat.weightKg == null) {
    return `Ketty AI butuh **berat sekarang** untuk **${targetCat.name}** agar bisa menghitung berat ideal.\n\nSilakan lengkapi dulu berat badan terbaru di profil atau timeline berat badan.`;
  }

  const bcsScore = extractBcsScore(question);

  if (bcsScore == null) {
    return `Ketty AI bisa menghitung **berat ideal ${targetCat.name}** dengan rumus BCS yang Anda minta, tetapi masih butuh **nilai Body Condition Score (BCS) 1-9**.\n\nData yang diperlukan:\n- **Berat sekarang**: ${formatKilograms(targetCat.weightKg)}\n- **BCS**: misalnya **5/9**, **6/9**, atau **7/9**\n\nRumus yang dipakai:\n- **Persentase kelebihan berat** = (BCS - 5) x 12,5%\n- **Berat ideal** = Berat sekarang / [1 + ((BCS - 5) x 0,125)]\n\nContoh pertanyaan yang bisa langsung dihitung:\n- **Berapa berat ideal kucing saya jika BCS ${targetCat.name} 7/9?**`;
  }

  if (bcsScore < 5) {
    return `Ketty AI menemukan **BCS ${bcsScore}/9** untuk **${targetCat.name}**.\n\nRumus yang Anda lampirkan dipakai untuk **BCS di atas 5** (kucing dengan kelebihan berat badan). Karena nilai BCS ${bcsScore}/9 berada di bawah ideal, Ketty AI tidak akan memakai rumus itu agar tidak menyesatkan.\n\nData yang tersedia:\n- **Berat sekarang**: ${formatKilograms(targetCat.weightKg)}\n- **BCS**: **${bcsScore}/9**\n\nSebaiknya evaluasi target berat dilakukan bersama dokter hewan atau gunakan acuan underweight khusus.`;
  }

  if (bcsScore === 5) {
    return `### Estimasi berat ideal ${targetCat.name}\n\nKarena **BCS ${targetCat.name} = 5/9**, kondisi ini sudah termasuk **ideal**.\n\nData yang dipakai:\n- **Berat sekarang**: ${formatKilograms(targetCat.weightKg)}\n- **BCS**: **5/9**\n\nHasil:\n- **Berat ideal ${targetCat.name}** ≈ **${formatKilograms(targetCat.weightKg)}**`;
  }

  const excessPercentage = (bcsScore - 5) * 12.5;
  const idealWeight = targetCat.weightKg / (1 + (bcsScore - 5) * 0.125);

  return `### Estimasi berat ideal ${targetCat.name}\n\nKetty AI menghitung berdasarkan rumus BCS yang Anda lampirkan.\n\nData yang dipakai:\n- **Berat sekarang**: ${formatKilograms(targetCat.weightKg)}\n- **BCS**: **${bcsScore}/9**\n\nRumus:\n- **Persentase kelebihan berat** = (BCS - 5) x 12,5%\n- **Berat ideal** = Berat sekarang / [1 + ((BCS - 5) x 0,125)]\n\nPerhitungan:\n1. **Kelebihan berat** = (${bcsScore} - 5) x 12,5% = **${excessPercentage.toFixed(1).replace(".", ",")}%**\n2. **Berat ideal** = ${targetCat.weightKg.toFixed(2).replace(".", ",")} / [1 + ((${bcsScore} - 5) x 0,125)]\n3. **Berat ideal ${targetCat.name}** ≈ **${formatKilograms(idealWeight)}**\n\n> Catatan: Ini adalah estimasi berbasis BCS. Untuk target penurunan berat yang aman, Ketty AI sarankan tetap memantau bersama dokter hewan.`;
}

async function buildProductRecommendationReplyFromRules(
  question: string,
  userId: string,
  activeCatId?: string | null,
) {
  const cats = await prisma.cat.findMany({
    where: { userId },
    include: {
      breed: {
        include: { characteristics: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (cats.length === 0) {
    return "Ketty AI belum menemukan profil kucing di database akun ini. Tambahkan profil kucing dulu agar rekomendasi produk bisa dipersonalisasi.";
  }

  const mentionedCat = cats.find((cat) =>
    normalizeText(question).includes(normalizeText(cat.name)),
  );
  const activeCat = activeCatId
    ? cats.find((cat) => cat.id === activeCatId)
    : null;
  const targetCat = activeCat ?? mentionedCat ?? cats[0];

  const [timelineEvents, products, feedbackRecords, orders] =
    await Promise.all([
      prisma.timelineEvent.findMany({
        where: {
          catId: targetCat.id,
          cat: { userId },
        },
        select: {
          id: true,
          title: true,
          eventDate: true,
          description: true,
          category: true,
          status: true,
        },
        orderBy: { eventDate: "desc" },
        take: 100,
      }),
      prisma.product.findMany({
        where: { isActive: true },
        include: { tags: true },
        orderBy: { createdAt: "desc" },
        take: 120,
      }),
      prisma.recommendationFeedback.findMany({
        where: {
          userId,
          catId: targetCat.id,
          recommendationType: RecommendationType.product,
          productId: { not: null },
        },
        include: {
          product: {
            include: { tags: true },
          },
        },
      }),
      prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

  const profile = deriveCatProfile(targetCat);
  const careSignals = analyzeTimelineCareSignals(timelineEvents);
  const feedbackByProductId = Object.fromEntries(
    feedbackRecords
      .filter(
        (
          feedback,
        ): feedback is typeof feedback & { productId: string } =>
          Boolean(feedback.productId),
      )
      .map((feedback) => [
        feedback.productId,
        feedback.response as RecommendationFeedbackResponse,
      ]),
  );
  const tastePreferences = buildTastePreferenceSignals(
    feedbackRecords.map((feedback) => ({
      response: feedback.response as RecommendationFeedbackResponse,
      product: feedback.product,
    })),
  );
  const previousProductIds = new Set(
    orders.flatMap((order) =>
      order.items
        .map((item) => item.productId)
        .filter((productId): productId is string => Boolean(productId)),
    ),
  );
  const previousProductNames = orders.flatMap((order) =>
    order.items.map((item) => item.name),
  );
  const previousProductNameKeys = new Set(
    previousProductNames.map((name) => normalizeText(name)),
  );
  const healthConditions = uniqueBy(
    timelineEvents
      .filter(
        (event) =>
          normalizeText(String(event.category)).replace(/_/g, " ") ===
            "riwayat sakit" ||
          includesAny(normalizeText(`${event.title} ${event.description ?? ""}`), [
            "diare",
            "muntah",
            "sakit",
            "urinary",
            "urin",
            "nafsu makan berkurang",
            "tidak mau makan",
          ]),
      )
      .map((event) => event.title)
      .slice(0, 8),
    (item) => normalizeText(item),
  );

  const candidateProducts = products.filter((product) =>
    productMatchesKettyQuestion(product, question),
  );
  const ranked = rankProductsForCat(
    profile,
    candidateProducts,
    careSignals,
    {
      feedbackByProductId,
      tastePreferences,
    },
  );
  const safeRanked = ranked
    .filter(({ match }) => match.label !== "Tidak direkomendasikan")
    .slice(0, 3)
    .map(({ product, match }) => {
      const productNameKey = normalizeText(product.name);

      return {
        product,
        match,
        previouslyOrdered:
          previousProductIds.has(product.id) ||
          previousProductNameKeys.has(productNameKey),
      };
    });

  return buildKettyProductRecommendationReply({
    profile,
    gender: targetCat.gender,
    ageLabel: targetCat.ageLabel,
    notes: targetCat.notes,
    healthConditions,
    previousProductNames,
    careSignals,
    rankedProducts: safeRanked,
    unsafeProductCount: ranked.filter(
      ({ match }) => match.label === "Tidak direkomendasikan",
    ).length,
    availableProductCount: candidateProducts.length,
    medicalIntent: isMedicalProductQuestion(question),
  });
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function buildKettyDatabaseContext(userId: string) {
  const now = new Date();
  const [
    cats,
    timelineEvents,
    achievements,
    products,
    orders,
    upcomingEvents,
    breeds,
    articles,
  ] = await Promise.all([
    prisma.cat.findMany({
      where: { userId },
      include: {
        breed: { include: { characteristics: true } },
        _count: { select: { timelineEvents: true, achievements: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.timelineEvent.findMany({
      where: { cat: { userId } },
      include: { cat: { select: { name: true } } },
      orderBy: { eventDate: "desc" },
      take: 80,
    }),
    prisma.achievement.findMany({
      where: { cat: { userId } },
      include: { cat: { select: { name: true } } },
      orderBy: [{ achievedAt: "desc" }, { rank: "asc" }],
      take: 80,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { tags: { select: { tag: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.event.findMany({
      where: { isActive: true, eventDate: { gte: now } },
      orderBy: { eventDate: "asc" },
      take: 30,
    }),
    prisma.catBreed.findMany({
      include: { characteristics: true },
      orderBy: { name: "asc" },
    }),
    prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        sections: { orderBy: { sortOrder: "asc" }, take: 3 },
        takeaways: { orderBy: { sortOrder: "asc" }, take: 5 },
      },
    }),
  ]);

  const serializedTimeline = uniqueBy(
    timelineEvents.map((event) => ({
      id: event.id,
      catName: event.cat.name,
      title: event.title,
      eventDate: formatDate(event.eventDate),
      eventDateIso: event.eventDate.toISOString().slice(0, 10),
      category: displayCategory(event.category),
      status: event.status,
      description: event.description,
    })),
    (event) => `${event.catName}:${event.title}:${event.eventDateIso}:${event.category}`,
  );

  const serializedAchievements = uniqueBy(
    achievements.map((achievement) => ({
      id: achievement.id,
      catName: achievement.cat.name,
      title: achievement.title,
      description: achievement.description,
      achievedAt: formatDate(achievement.achievedAt),
      achievedAtIso: achievement.achievedAt.toISOString().slice(0, 10),
      rank: achievement.rank,
      icon: achievement.icon,
    })),
    (achievement) =>
      `${achievement.catName}:${achievement.title}:${achievement.achievedAtIso}`,
  );

  return {
    generatedAt: now.toISOString(),
    userId,
    cats: cats.map((cat) => ({
      id: cat.id,
      name: cat.name,
      ageLabel: cat.ageLabel,
      weightKg: cat.weightKg ? Number(cat.weightKg) : null,
      gender: cat.gender,
      sterilized: cat.sterilized,
      lifestyle: cat.lifestyle,
      notes: cat.notes,
      photoUrl: cat.photoUrl,
      breed: cat.breed
        ? {
            id: cat.breed.id,
            slug: cat.breed.slug,
            name: cat.breed.name,
            origin: cat.breed.origin,
            careLevel: cat.breed.careLevel,
            foodType: cat.breed.foodType,
            kittenPriceLabel: cat.breed.kittenPriceLabel,
            monthlyCareLabel: cat.breed.monthlyCareLabel,
            characteristics: cat.breed.characteristics.map((c) => c.label),
          }
        : null,
      timelineCount: cat._count.timelineEvents,
      achievementCount: cat._count.achievements,
    })),
    timelineEvents: serializedTimeline,
    schedules: serializedTimeline.filter(
      (event) =>
        event.status === "Mendatang" ||
        (event.eventDateIso && new Date(`${event.eventDateIso}T00:00:00`) >= now),
    ),
    diseaseHistory: serializedTimeline.filter(
      (event) => event.category?.toLowerCase() === "riwayat sakit",
    ),
    achievements: serializedAchievements,
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      priceIdr: Number(product.priceIdr),
      priceLabel: formatRupiah(Number(product.priceIdr)),
      badge: product.badge,
      reason: product.reason,
      description: product.description,
      stock: product.stock,
      tags: product.tags.map((tag) => tag.tag),
    })),
    orders: orders.map((order) => ({
      id: order.id,
      orderDate: formatDate(order.createdAt),
      orderDateIso: order.createdAt.toISOString(),
      status: order.status,
      channel: order.channel,
      total: Number(order.total),
      totalLabel: formatRupiah(Number(order.total)),
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        priceLabel: formatRupiah(Number(item.price)),
        subtotal: Number(item.subtotal),
        subtotalLabel: formatRupiah(Number(item.subtotal)),
      })),
    })),
    upcomingEvents: upcomingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      type: event.type,
      eventDate: formatDate(event.eventDate),
      eventDateIso: event.eventDate.toISOString().slice(0, 10),
      location: event.location,
      description: event.description,
      sourceUrl: event.sourceUrl,
    })),
    breeds: breeds.map((breed) => ({
      id: breed.id,
      slug: breed.slug,
      name: breed.name,
      origin: breed.origin,
      profileSummary: breed.profileSummary,
      foodType: breed.foodType,
      kittenPriceLabel: breed.kittenPriceLabel,
      monthlyCareLabel: breed.monthlyCareLabel,
      careLevel: breed.careLevel,
      availability: breed.availability,
      matchLabel: breed.matchLabel,
      characteristics: breed.characteristics.map((c) => c.label),
    })),
    articles: articles.map((article) => ({
      title: article.title,
      slug: article.slug,
      category: article.category,
      readTime: article.readTime,
      summary: article.summary,
      vetWarning: article.vetWarning,
      takeaways: article.takeaways.map((takeaway) => takeaway.point),
      sections: article.sections.map((section) => ({
        heading: section.heading,
        body: section.body,
      })),
    })),
  };
}

function buildKettyPromptContext(question: string, context: KettyDatabaseContext) {
  const normalizedQuestion = normalizeText(question);
  const wantsAchievements = includesAny(normalizedQuestion, [
    "prestasi",
    "achievement",
    "pencapaian",
    "juara",
    "lomba",
  ]);
  const wantsProfile = isCatProfileQuestion(normalizedQuestion);
  const wantsDisease = includesAny(normalizedQuestion, [
    "penyakit",
    "sakit",
    "riwayat sakit",
    "disease",
  ]);
  const wantsTimeline = includesAny(normalizedQuestion, [
    "jadwal",
    "schedule",
    "timeline",
    "vaksin",
    "grooming",
    "catatan",
  ]);
  const wantsProducts = includesAny(normalizedQuestion, [
    "produk",
    "makanan",
    "food",
    "snack",
    "stok",
    "harga",
    "suplemen",
  ]);
  const wantsOrders = includesAny(normalizedQuestion, [
    "pesanan",
    "order",
    "riwayat belanja",
    "checkout",
    "dibeli",
  ]);
  const wantsBreeds = includesAny(normalizedQuestion, [
    "ras",
    "breed",
    "british",
    "persian",
    "maine",
    "bengal",
    "ragdoll",
  ]);
  const wantsEvents = includesAny(normalizedQuestion, [
    "event",
    "acara",
    "kompetisi",
    "pameran",
  ]);
  const wantsArticles = includesAny(normalizedQuestion, [
    "artikel",
    "edukasi",
    "panduan",
    "tips",
  ]);
  const noSpecificIntent = ![
    wantsAchievements,
    wantsProfile,
    wantsDisease,
    wantsTimeline,
    wantsProducts,
    wantsOrders,
    wantsBreeds,
    wantsEvents,
    wantsArticles,
  ].some(Boolean);

  return {
    generatedAt: context.generatedAt,
    counts: {
      cats: context.cats.length,
      timelineEvents: context.timelineEvents.length,
      schedules: context.schedules.length,
      diseaseHistory: context.diseaseHistory.length,
      achievements: context.achievements.length,
      products: context.products.length,
      orders: context.orders.length,
      upcomingEvents: context.upcomingEvents.length,
      breeds: context.breeds.length,
      articles: context.articles.length,
    },
    cats: context.cats,
    achievements:
      wantsAchievements || noSpecificIntent ? context.achievements.slice(0, 20) : [],
    timelineEvents:
      wantsTimeline || noSpecificIntent ? context.timelineEvents.slice(0, 20) : [],
    schedules: wantsTimeline || noSpecificIntent ? context.schedules.slice(0, 20) : [],
    diseaseHistory:
      wantsDisease || noSpecificIntent ? context.diseaseHistory.slice(0, 20) : [],
    products:
      wantsProducts || noSpecificIntent
        ? context.products.slice(0, 20).map((product) => ({
            name: product.name,
            category: product.category,
            priceLabel: product.priceLabel,
            stock: product.stock,
            tags: product.tags,
            badge: product.badge,
            reason: product.reason,
          }))
        : [],
    orders: wantsOrders || noSpecificIntent ? context.orders.slice(0, 12) : [],
    breeds:
      wantsBreeds || noSpecificIntent
        ? context.breeds.slice(0, 18).map((breed) => ({
            name: breed.name,
            origin: breed.origin,
            profileSummary: breed.profileSummary,
            careLevel: breed.careLevel,
            kittenPriceLabel: breed.kittenPriceLabel,
            monthlyCareLabel: breed.monthlyCareLabel,
            characteristics: breed.characteristics,
          }))
        : [],
    upcomingEvents:
      wantsEvents || noSpecificIntent ? context.upcomingEvents.slice(0, 12) : [],
    articles: wantsArticles || noSpecificIntent ? context.articles.slice(0, 8) : [],
  };
}

function buildDatabaseFallbackReply(question: string, context: KettyDatabaseContext, cause?: string) {
  const normalizedQuestion = normalizeText(question);
  const prefix = cause
    ? `> Catatan: ${cause}. Ketty AI tetap mengecek database Rumah Kucing terlebih dahulu.\n\n`
    : "";

  if (includesAny(normalizedQuestion, ["prestasi", "achievement", "pencapaian", "juara", "lomba"])) {
    if (context.achievements.length === 0) {
      return `${prefix}Ketty AI belum menemukan data prestasi kucing di database.`;
    }

    return `${prefix}### Prestasi kucing yang ditemukan\n\n${context.achievements
      .map(
        (achievement) =>
          `- **${achievement.catName}**: **${achievement.title}** (${achievement.achievedAt})${
            achievement.description ? ` — ${achievement.description}` : ""
          }`,
      )
      .join("\n")}`;
  }

  if (isCatProfileQuestion(normalizedQuestion)) {
    return buildCatProfileReply(
      context,
      prefix,
      isCountQuestion(normalizedQuestion),
    );
  }

  if (includesAny(normalizedQuestion, ["penyakit", "sakit", "riwayat sakit", "disease"])) {
    if (context.diseaseHistory.length === 0) {
      return `${prefix}Ketty AI belum menemukan data riwayat sakit di database untuk kucing akun ini.`;
    }

    return `${prefix}### Riwayat sakit yang ditemukan\n\n${context.diseaseHistory
      .map(
        (event) =>
          `- **${event.catName}**: **${event.title}** (${event.eventDate})${
            event.description ? ` — ${event.description}` : ""
          }`,
      )
      .join("\n")}`;
  }

  if (includesAny(normalizedQuestion, ["jadwal", "schedule", "timeline", "vaksin", "grooming", "catatan"])) {
    const events = context.schedules.length > 0 ? context.schedules : context.timelineEvents;

    if (events.length === 0) {
      return `${prefix}Ketty AI belum menemukan data jadwal atau timeline di database.`;
    }

    return `${prefix}### Timeline dan jadwal yang ditemukan\n\n${events
      .slice(0, 12)
      .map(
        (event) =>
          `- **${event.catName}**: **${event.title}** (${event.eventDate}) — ${
            event.category ?? "Kategori belum diisi"
          } / ${event.status}${event.description ? `\n  ${event.description}` : ""}`,
      )
      .join("\n")}`;
  }

  if (includesAny(normalizedQuestion, ["produk", "makanan", "food", "snack", "stok", "harga", "suplemen"])) {
    if (context.products.length === 0) {
      return `${prefix}Ketty AI belum menemukan produk aktif di database katalog.`;
    }

    return `${prefix}### Produk yang tersedia di database\n\n${context.products
      .slice(0, 12)
      .map(
        (product) =>
          `- **${product.name}** — ${product.priceLabel}, stok ${
            product.stock ?? 0
          }${product.category ? `, kategori ${product.category}` : ""}`,
      )
      .join("\n")}`;
  }

  if (includesAny(normalizedQuestion, ["pesanan", "order", "riwayat belanja", "checkout", "dibeli"])) {
    if (context.orders.length === 0) {
      return `${prefix}Ketty AI belum menemukan riwayat pesanan di database akun ini.`;
    }

    return `${prefix}### Riwayat pesanan yang ditemukan\n\n${context.orders
      .map(
        (order) =>
          `- **${order.orderDate}** — ${order.status}, total **${order.totalLabel}** (${order.items
            .map((item) => `${item.quantity}x ${item.name}`)
            .join(", ")})`,
      )
      .join("\n")}`;
  }

  if (includesAny(normalizedQuestion, ["ras", "breed", "british", "persian", "maine", "bengal", "ragdoll"])) {
    if (context.breeds.length === 0) {
      return `${prefix}Ketty AI belum menemukan data ras kucing di database.`;
    }

    if (isBreedRecommendationQuestion(question)) {
      return `${prefix}${buildBreedRecommendationReply(question, context)}`;
    }

    return `${prefix}### Ras kucing di database\n\n${context.breeds
      .slice(0, 12)
      .map(
        (breed) =>
          `- **${breed.name}**${breed.origin ? ` (${breed.origin})` : ""}: ${
            breed.profileSummary ?? "Belum ada ringkasan profil."
          }`,
      )
      .join("\n")}`;
  }

  if (includesAny(normalizedQuestion, ["event", "acara", "kompetisi", "pameran"])) {
    if (context.upcomingEvents.length === 0) {
      return `${prefix}Ketty AI belum menemukan event mendatang di database.`;
    }

    return `${prefix}### Event kucing mendatang\n\n${context.upcomingEvents
      .slice(0, 10)
      .map((event) => `- **${event.title}** (${event.eventDate}) — ${event.location}`)
      .join("\n")}`;
  }

  return `${prefix}Ketty AI sudah mengecek database, tetapi belum menemukan data yang cocok dengan pertanyaan tersebut. Coba sebutkan topik yang lebih spesifik, misalnya prestasi, jadwal, produk, pesanan, ras, atau profil kucing.`;
}

// ─────────────────────────────────────────────
// TOOL DEFINITIONS (OpenAI-compatible function schema)
// ─────────────────────────────────────────────
const TOOLS: GroqTool[] = [
  {
    type: "function",
    function: {
      name: "get_user_cats",
      description:
        "Ambil daftar profil kucing milik pengguna yang sedang login, termasuk informasi ras dan karakteristik rasnya. Gunakan untuk pertanyaan tentang profil kucing, ras, usia, berat, gender, status steril, gaya hidup, atau catatan kucing.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_cat_timeline",
      description:
        "Ambil riwayat timeline/jadwal kesehatan untuk kucing tertentu (vaksin, berat badan, riwayat sakit, makanan, grooming, momen foto). Butuh catId.",
      parameters: {
        type: "object",
        properties: {
          catId: {
            type: "string",
            description: "ID kucing yang ingin dilihat timelinenya.",
          },
          category: {
            type: "string",
            description:
              "Filter berdasarkan kategori: Vaksin, Berat badan, Riwayat sakit, Makanan, Grooming, Momen foto, Lainnya. Opsional.",
          },
          limit: {
            type: "number",
            description: "Jumlah maksimal hasil (default 20).",
          },
        },
        required: ["catId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_cat_achievements",
      description:
        "Ambil daftar prestasi/pencapaian untuk kucing tertentu (juara, lomba, dll). Butuh catId.",
      parameters: {
        type: "object",
        properties: {
          catId: {
            type: "string",
            description: "ID kucing yang ingin dilihat prestasinya.",
          },
          limit: {
            type: "number",
            description: "Jumlah maksimal hasil (default 20).",
          },
        },
        required: ["catId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_all_user_achievements",
      description:
        "Ambil semua prestasi dari semua kucing milik pengguna. Gunakan jika pengguna bertanya tentang prestasi secara umum tanpa menyebut kucing tertentu.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Jumlah maksimal hasil (default 30).",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Cari produk di katalog berdasarkan kata kunci, kategori, atau tag. Mengembalikan nama, harga, kategori, deskripsi, stok, badge, dan tag. Gunakan untuk pertanyaan tentang produk yang tersedia, rekomendasi makanan, aksesori, mainan, suplemen, dll.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Kata kunci pencarian untuk nama produk (opsional, bisa dikosongkan untuk melihat semua).",
          },
          category: {
            type: "string",
            description:
              "Filter kategori produk, misal: Makanan, Snack, Aksesori, Mainan, Suplemen, Grooming. Opsional.",
          },
          tag: {
            type: "string",
            description: "Filter berdasarkan tag produk. Opsional.",
          },
          sortBy: {
            type: "string",
            enum: ["newest", "cheapest", "most_expensive"],
            description: "Urutan hasil (default: newest).",
          },
          limit: {
            type: "number",
            description: "Jumlah maksimal hasil (default 12).",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_categories",
      description:
        "Ambil daftar kategori produk yang tersedia di katalog. Gunakan jika pengguna bertanya kategori apa saja yang ada.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_user_orders",
      description:
        "Ambil riwayat pesanan pengguna (order history) beserta item-itemnya. Gunakan untuk pertanyaan tentang pesanan sebelumnya, total belanja, status pesanan, produk yang pernah dibeli, dll.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Jumlah maksimal hasil (default 20).",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_upcoming_events",
      description:
        "Ambil daftar event/acara kucing mendatang (pameran, kompetisi, edukasi, adopsi). Gunakan untuk pertanyaan tentang event atau acara kucing.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Jumlah maksimal hasil (default 10).",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_breeds",
      description:
        "Ambil daftar ras kucing yang tersedia di database beserta karakteristik, asal, level perawatan, dan ketersediaan. Gunakan untuk pertanyaan tentang ras kucing, perbandingan ras, atau karakteristik ras tertentu.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description:
              "Slug ras spesifik (opsional). Jika dikosongkan, kembalikan semua ras.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_articles",
      description:
        "Ambil artikel edukasi tentang perawatan kucing. Gunakan jika pengguna bertanya tentang tips, panduan, atau artikel edukasi.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Filter kategori artikel. Opsional.",
          },
          limit: {
            type: "number",
            description: "Jumlah maksimal hasil (default 10).",
          },
        },
      },
    },
  },
];

// ─────────────────────────────────────────────
// TOOL EXECUTORS (all strictly read-only Prisma queries)
// ─────────────────────────────────────────────
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
): Promise<string> {
  try {
    switch (toolName) {
      case "get_user_cats": {
        const cats = await prisma.cat.findMany({
          where: { userId },
          include: {
            breed: { include: { characteristics: true } },
            _count: {
              select: { timelineEvents: true, achievements: true },
            },
          },
          orderBy: { createdAt: "asc" },
        });
        return JSON.stringify(
          cats.map((cat) => ({
            id: cat.id,
            name: cat.name,
            breed: cat.breed?.name ?? null,
            breedOrigin: cat.breed?.origin ?? null,
            breedCareLevel: cat.breed?.careLevel ?? null,
            breedCharacteristics:
              cat.breed?.characteristics.map((c) => c.label) ?? [],
            ageLabel: cat.ageLabel,
            weightKg: cat.weightKg ? Number(cat.weightKg) : null,
            gender: cat.gender,
            sterilized: cat.sterilized,
            lifestyle: cat.lifestyle,
            notes: cat.notes,
            timelineCount: cat._count.timelineEvents,
            achievementCount: cat._count.achievements,
          })),
        );
      }

      case "get_cat_timeline": {
        const catId = args.catId as string;
        const category = normalizeTimelineCategory(args.category);
        const limit = (args.limit as number) ?? 20;

        // Verify the cat belongs to the user (security)
        const cat = await prisma.cat.findFirst({
          where: { id: catId, userId },
          select: { id: true, name: true },
        });
        if (!cat) {
          return JSON.stringify({
            error: "Kucing tidak ditemukan atau bukan milik pengguna.",
          });
        }

        const events = await prisma.timelineEvent.findMany({
          where: {
            catId,
            ...(category ? { category: category as never } : {}),
          },
          orderBy: { eventDate: "desc" },
          take: Math.min(limit, 100),
        });
        return JSON.stringify({
          catName: cat.name,
          events: events.map((e) => ({
            title: e.title,
            date: e.eventDate,
            category: e.category,
            status: e.status,
            description: e.description,
          })),
        });
      }

      case "get_cat_achievements": {
        const catId = args.catId as string;
        const limit = (args.limit as number) ?? 20;

        const cat = await prisma.cat.findFirst({
          where: { id: catId, userId },
          select: { id: true, name: true },
        });
        if (!cat) {
          return JSON.stringify({
            error: "Kucing tidak ditemukan atau bukan milik pengguna.",
          });
        }

        const achievements = await prisma.achievement.findMany({
          where: { catId },
          orderBy: { achievedAt: "desc" },
          take: Math.min(limit, 100),
        });
        return JSON.stringify({
          catName: cat.name,
          achievements: achievements.map((a) => ({
            title: a.title,
            description: a.description,
            date: a.achievedAt,
            rank: a.rank,
          })),
        });
      }

      case "get_all_user_achievements": {
        const limit = (args.limit as number) ?? 30;
        const achievements = await prisma.achievement.findMany({
          where: { cat: { userId } },
          orderBy: { achievedAt: "desc" },
          take: Math.min(limit, 100),
          include: { cat: { select: { name: true } } },
        });
        return JSON.stringify(
          achievements.map((a) => ({
            cat: a.cat.name,
            title: a.title,
            description: a.description,
            date: a.achievedAt,
            rank: a.rank,
          })),
        );
      }

      case "search_products": {
        const query = args.query as string | undefined;
        const category = args.category as string | undefined;
        const tag = normalizeProductTag(args.tag);
        const sortBy = (args.sortBy as string) ?? "newest";
        const limit = (args.limit as number) ?? 12;

        const orderBy =
          sortBy === "cheapest"
            ? { priceIdr: "asc" as const }
            : sortBy === "most_expensive"
              ? { priceIdr: "desc" as const }
              : { createdAt: "desc" as const };

        const products = await prisma.product.findMany({
          where: {
            isActive: true,
            ...(category ? { category } : {}),
            ...(tag ? { tags: { some: { tag } } } : {}),
            ...(query
              ? {
                  OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          orderBy,
          take: Math.min(limit, 100),
          select: {
            id: true,
            name: true,
            category: true,
            priceIdr: true,
            badge: true,
            description: true,
            stock: true,
            tags: { select: { tag: true } },
          },
        });
        return JSON.stringify(
          products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            priceIdr: Number(p.priceIdr),
            badge: p.badge,
            description: p.description,
            stock: p.stock,
            tags: p.tags.map((t) => t.tag),
          })),
        );
      }

      case "get_product_categories": {
        const grouped = await prisma.product.groupBy({
          by: ["category"],
          where: { isActive: true },
        });
        return JSON.stringify(grouped.map((g) => g.category).filter(Boolean));
      }

      case "get_user_orders": {
        const limit = (args.limit as number) ?? 20;
        const orders = await prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: Math.min(limit, 100),
          include: { items: true },
        });
        return JSON.stringify(
          orders.map((o) => ({
            id: o.id,
            orderDate: o.createdAt,
            status: o.status,
            channel: o.channel,
            total: Number(o.total),
            items: o.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              price: Number(i.price),
              subtotal: Number(i.subtotal),
            })),
          })),
        );
      }

      case "get_upcoming_events": {
        const limit = (args.limit as number) ?? 10;
        const events = await prisma.event.findMany({
          where: { isActive: true, eventDate: { gte: new Date() } },
          orderBy: { eventDate: "asc" },
          take: Math.min(limit, 50),
        });
        return JSON.stringify(
          events.map((e) => ({
            title: e.title,
            type: e.type,
            date: e.eventDate,
            location: e.location,
            description: e.description,
          })),
        );
      }

      case "get_breeds": {
        const slug = args.slug as string | undefined;
        const breeds = await prisma.catBreed.findMany({
          where: slug ? { slug } : {},
          include: { characteristics: true },
          orderBy: { name: "asc" },
        });
        return JSON.stringify(
          breeds.map((b) => ({
            name: b.name,
            slug: b.slug,
            origin: b.origin,
            profileSummary: b.profileSummary,
            foodType: b.foodType,
            careLevel: b.careLevel,
            availability: b.availability,
            kittenPriceLabel: b.kittenPriceLabel,
            monthlyCareLabel: b.monthlyCareLabel,
            characteristics: b.characteristics.map((c) => c.label),
          })),
        );
      }

      case "get_articles": {
        const category = args.category as string | undefined;
        const limit = (args.limit as number) ?? 10;
        const articles = await prisma.article.findMany({
          where: {
            ...(category ? { category } : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: Math.min(limit, 50),
          include: {
            sections: { orderBy: { sortOrder: "asc" } },
            takeaways: { orderBy: { sortOrder: "asc" } },
          },
        });
        return JSON.stringify(
          articles.map((a) => ({
            title: a.title,
            slug: a.slug,
            category: a.category,
            readTime: a.readTime,
            summary: a.summary,
            vetWarning: a.vetWarning,
            sections: a.sections.map((s) => ({
              heading: s.heading,
              body: s.body,
            })),
            takeaways: a.takeaways.map((t) => t.point),
          })),
        );
      }

      default:
        return JSON.stringify({
          error: `Tool "${toolName}" tidak dikenal.`,
        });
    }
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);
    return JSON.stringify({
      error: "Terjadi kesalahan saat mengambil data dari database.",
    });
  }
}

// ─────────────────────────────────────────────
// HELPER: Call Groq API with database context
// ─────────────────────────────────────────────
async function callGroq(messages: ChatMessage[]): Promise<Response> {
  return fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 2048,
    }),
  });
}

// ─────────────────────────────────────────────
// MAIN ROUTE HANDLER
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const history: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : [];
    const activeCatId =
      typeof body.activeCatId === "string" ? body.activeCatId : null;

    const lastUserMessage = [...history]
      .reverse()
      .find((m) => m.role === "user");

    if (!lastUserMessage) {
      return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 });
    }

    const databaseContext = await buildKettyDatabaseContext(user.id);

    if (isIdealWeightQuestion(lastUserMessage.content ?? "")) {
      const reply = buildIdealWeightReply(
        lastUserMessage.content ?? "",
        databaseContext,
        activeCatId,
      );

      return NextResponse.json({ reply });
    }

    if (isCatProfileQuestion(lastUserMessage.content ?? "")) {
      const reply = buildCatProfileReply(
        databaseContext,
        "",
        isCountQuestion(lastUserMessage.content ?? ""),
      );

      return NextResponse.json({ reply });
    }

    if (isBreedRecommendationQuestion(lastUserMessage.content ?? "")) {
      const reply = buildBreedRecommendationReply(
        lastUserMessage.content ?? "",
        databaseContext,
      );

      return NextResponse.json({ reply });
    }

    if (isProductRecommendationQuestion(lastUserMessage.content ?? "")) {
      const reply = await buildProductRecommendationReplyFromRules(
        lastUserMessage.content ?? "",
        user.id,
        activeCatId,
      );

      return NextResponse.json({ reply });
    }

    const promptContext = buildKettyPromptContext(
      lastUserMessage.content ?? "",
      databaseContext,
    );
    console.info("[KettyAI][chat]", {
      requestId,
      userId: user.id,
      cats: databaseContext.cats.length,
      timelineEvents: databaseContext.timelineEvents.length,
      achievements: databaseContext.achievements.length,
      products: databaseContext.products.length,
      orders: databaseContext.orders.length,
      breeds: databaseContext.breeds.length,
    });

    // Build the message array for Groq
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: `Nama pengguna: ${user.name}. Email: ${user.email}. Saat ini login di aplikasi Rumah Kucing.`,
      },
      {
        role: "system",
        content:
          `DATABASE_CONTEXT_JSON (hasil query PostgreSQL terbaru; gunakan data ini terlebih dahulu sebelum tool call tambahan):\n` +
          JSON.stringify(promptContext, null, 2),
      },
      // Keep last 20 messages of conversation history
      ...history.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // ── First call to Groq with tools ──
    let groqRes = await callGroq(messages);

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("[KettyAI][groq_error]", { requestId, status: groqRes.status, errText });
      const reply = buildDatabaseFallbackReply(
        lastUserMessage.content ?? "",
        databaseContext,
        "Layanan model Ketty AI sedang tidak tersedia",
      );
      return NextResponse.json({
        reply,
        degraded: true,
        debug:
          process.env.NODE_ENV === "development"
            ? { requestId, cause: "groq_error", status: groqRes.status, detail: errText }
            : { requestId },
      });
    }

    let data = await groqRes.json();
    let assistantMessage = data?.choices?.[0]?.message;

    // ── Handle tool calls (up to 3 rounds) ──
    let toolRound = 0;
    const MAX_TOOL_ROUNDS = 3;

    while (
      assistantMessage?.tool_calls &&
      assistantMessage.tool_calls.length > 0 &&
      toolRound < MAX_TOOL_ROUNDS
    ) {
      toolRound++;

      // Add the assistant's tool-call message to conversation
      messages.push({
        role: "assistant",
        content: assistantMessage.content ?? null,
        tool_calls: assistantMessage.tool_calls,
      });

      // Execute each tool call and add results
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          args = {};
        }

        const result = await executeTool(toolName, args, user.id);

        messages.push({
          role: "tool",
          content: result,
          tool_call_id: toolCall.id,
        });
      }

      // Call Groq again with the tool results
      groqRes = await callGroq(messages);

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        console.error("[KettyAI][groq_tool_round_error]", {
          requestId,
          status: groqRes.status,
          errText,
        });
        const reply = buildDatabaseFallbackReply(
          lastUserMessage.content ?? "",
          databaseContext,
          "Layanan model Ketty AI bermasalah setelah membaca data database",
        );
        return NextResponse.json({
          reply,
          degraded: true,
          debug:
            process.env.NODE_ENV === "development"
              ? { requestId, cause: "groq_tool_round_error", status: groqRes.status, detail: errText }
              : { requestId },
        });
      }

      data = await groqRes.json();
      assistantMessage = data?.choices?.[0]?.message;
    }

    const reply: string =
      assistantMessage?.content?.trim() ||
      buildDatabaseFallbackReply(
        lastUserMessage.content ?? "",
        databaseContext,
        "Model tidak mengembalikan jawaban final",
      );

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[KettyAI][chat_route_error]", { requestId, error });
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Ketty AI belum bisa mengambil data dari database atau layanan chat.",
        code: "KETTY_CHAT_ROUTE_ERROR",
        debug:
          process.env.NODE_ENV === "development"
            ? { requestId, message, name: error instanceof Error ? error.name : "UnknownError" }
            : { requestId },
      },
      { status: 500 },
    );
  }
}
