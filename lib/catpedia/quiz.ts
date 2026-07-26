export type BreedQuizAnswers = {
  home: "apartment" | "house";
  away: "short" | "medium" | "long";
  energy: "calm" | "balanced" | "active";
  grooming: "low" | "medium" | "high";
  children: "yes" | "no";
  pets: "yes" | "no";
  budget: "low" | "medium" | "high";
  firstCat: "yes" | "no";
};

export type BreedQuizInput = {
  id: string;
  slug: string;
  name: string;
  origin: string | null;
  imageSrc: string | null;
  shortDescription: string | null;
  profileSummary: string | null;
  careLevel: string | null;
  activityLevel: string | null;
  indoorFit: string | null;
  coatLength: string | null;
  monthlyCareLabel: string | null;
  matchLabel: string | null;
  beginnerFitScore: number | null;
  activityScore: number | null;
  groomingScore: number | null;
  vocalScore: number | null;
  childFriendlyScore: number | null;
  petFriendlyScore: number | null;
  characteristics: string[];
  suitabilities: Array<{
    type: "good_for" | "consider_if";
    label: string;
    description: string | null;
  }>;
  nutritionGuide: {
    obesityRisk: string | null;
  } | null;
  costEstimates: Array<{
    monthlyCostLabel: string | null;
  }>;
};

export type BreedQuizResult = {
  breed: BreedQuizInput;
  score: number;
  reasons: string[];
  cautions: string[];
};

function textForBreed(breed: BreedQuizInput) {
  return [
    breed.name,
    breed.origin,
    breed.shortDescription,
    breed.profileSummary,
    breed.careLevel,
    breed.activityLevel,
    breed.indoorFit,
    breed.coatLength,
    breed.monthlyCareLabel,
    breed.matchLabel,
    breed.nutritionGuide?.obesityRisk,
    ...breed.characteristics,
    ...breed.suitabilities.map((item) => item.label),
    ...breed.suitabilities.map((item) => item.description),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function scoreAtLeast(score: number | null, min: number) {
  return score != null && score >= min;
}

function scoreAtMost(score: number | null, max: number) {
  return score != null && score <= max;
}

function addUnique(items: string[], item: string) {
  if (!items.includes(item)) items.push(item);
}

function clampScore(score: number) {
  return Math.max(35, Math.min(98, Math.round(score)));
}

function costLooksHigh(value: string | null | undefined) {
  if (!value) return false;
  const text = value.toLowerCase();
  return text.includes("juta") || text.includes("tinggi") || text.includes("mahal");
}

function costLooksLow(value: string | null | undefined) {
  if (!value) return false;
  const text = value.toLowerCase();
  return (
    text.includes("budget") ||
    text.includes("hemat") ||
    text.includes("rendah") ||
    text.includes("500rb") ||
    text.includes("500 ribu")
  );
}

function monthlyCostLabel(breed: BreedQuizInput) {
  return breed.costEstimates[0]?.monthlyCostLabel ?? breed.monthlyCareLabel;
}

export function matchBreedForQuiz(
  breed: BreedQuizInput,
  answers: BreedQuizAnswers,
): BreedQuizResult {
  const text = textForBreed(breed);
  const reasons: string[] = [];
  const cautions: string[] = [];
  let score = 50;

  const domestic = includesAny(text, [
    "domestic",
    "domestik",
    "lokal",
    "campuran",
    "kucing kampung",
  ]);
  const indoorFriendly =
    includesAny(text, ["indoor", "apartemen", "rumah kecil", "tenang"]) ||
    scoreAtMost(breed.activityScore, 6);
  const highActivity =
    scoreAtLeast(breed.activityScore, 8) ||
    includesAny(text, ["sangat aktif", "aktif", "enerjik", "atletis"]);
  const lowGrooming =
    scoreAtMost(breed.groomingScore, 4) ||
    includesAny(text, ["perawatan rendah", "perawatan ringan", "bulu pendek"]);
  const highGrooming =
    scoreAtLeast(breed.groomingScore, 7) ||
    includesAny(text, ["bulu panjang", "bulu tebal", "grooming tinggi"]);

  if (answers.home === "apartment") {
    if (indoorFriendly) {
      score += 12;
      addUnique(reasons, "Cenderung cocok untuk gaya hidup indoor atau ruang yang lebih kecil.");
    }
    if (highActivity) {
      score -= 8;
      addUnique(cautions, "Butuh stimulasi harian agar tidak mudah bosan di ruang terbatas.");
    }
  } else {
    score += 4;
    addUnique(reasons, "Tidak terlalu dibatasi oleh kebutuhan ruang apartemen.");
  }

  if (answers.away === "long") {
    if (includesAny(text, ["mandiri", "tenang", "adaptif"]) || scoreAtMost(breed.vocalScore, 5)) {
      score += 10;
      addUnique(reasons, "Cenderung lebih mandiri untuk rumah yang sering kosong.");
    }
    if (highActivity) {
      score -= 8;
      addUnique(cautions, "Perlu waktu bermain dan enrichment saat pemilik pulang.");
    }
  } else if (answers.away === "short") {
    if (highActivity) {
      score += 8;
      addUnique(reasons, "Energinya lebih mudah terpenuhi saat pemilik banyak di rumah.");
    }
  } else {
    score += 3;
  }

  if (answers.energy === "calm") {
    if (scoreAtMost(breed.activityScore, 5) || includesAny(text, ["tenang", "kalem", "santai"])) {
      score += 14;
      addUnique(reasons, "Temperamen umumnya lebih tenang sesuai preferensi kamu.");
    }
    if (highActivity) {
      score -= 12;
      addUnique(cautions, "Ras ini cenderung aktif, jadi mungkin kurang pas jika kamu ingin kucing yang sangat kalem.");
    }
  } else if (answers.energy === "active") {
    if (highActivity) {
      score += 14;
      addUnique(reasons, "Cocok untuk pemilik yang ingin kucing aktif dan responsif.");
    } else {
      score -= 4;
    }
  } else if (scoreAtMost(breed.activityScore, 7)) {
    score += 7;
    addUnique(reasons, "Aktivitasnya terlihat cukup seimbang untuk rutinitas harian.");
  }

  if (answers.grooming === "low") {
    if (lowGrooming) {
      score += 14;
      addUnique(reasons, "Kebutuhan grooming relatif ringan.");
    }
    if (highGrooming) {
      score -= 14;
      addUnique(cautions, "Perawatan bulunya perlu komitmen lebih rutin.");
    }
  } else if (answers.grooming === "high") {
    if (highGrooming) {
      score += 8;
      addUnique(reasons, "Cocok jika kamu siap menyisir dan merawat bulu secara rutin.");
    }
  } else if (!highGrooming) {
    score += 5;
  }

  if (answers.children === "yes") {
    if (scoreAtLeast(breed.childFriendlyScore, 7) || includesAny(text, ["ramah keluarga", "anak"])) {
      score += 10;
      addUnique(reasons, "Punya kecenderungan ramah untuk lingkungan keluarga.");
    } else if (scoreAtMost(breed.childFriendlyScore, 4)) {
      score -= 8;
      addUnique(cautions, "Perkenalan dengan anak kecil perlu lebih pelan dan diawasi.");
    }
  }

  if (answers.pets === "yes") {
    if (scoreAtLeast(breed.petFriendlyScore, 7) || includesAny(text, ["sosial", "hewan lain", "adaptif"])) {
      score += 9;
      addUnique(reasons, "Cenderung lebih mudah dipertimbangkan untuk rumah dengan hewan lain.");
    } else if (scoreAtMost(breed.petFriendlyScore, 4)) {
      score -= 7;
      addUnique(cautions, "Butuh proses introduksi bertahap dengan hewan lain.");
    }
  }

  if (answers.budget === "low") {
    if (domestic || lowGrooming || costLooksLow(monthlyCostLabel(breed))) {
      score += 12;
      addUnique(reasons, "Lebih realistis untuk budget bulanan yang ingin dijaga.");
    }
    if (costLooksHigh(monthlyCostLabel(breed)) || highGrooming) {
      score -= 10;
      addUnique(cautions, "Biaya perawatan bulanan atau grooming bisa lebih tinggi.");
    }
  } else if (answers.budget === "high") {
    score += highGrooming ? 6 : 3;
  }

  if (answers.firstCat === "yes") {
    if (scoreAtLeast(breed.beginnerFitScore, 7) || includesAny(text, ["pemula", "first-time", "mudah dirawat"])) {
      score += 14;
      addUnique(reasons, "Cenderung cocok untuk pemilik kucing pertama.");
    } else if (scoreAtMost(breed.beginnerFitScore, 4) || highActivity) {
      score -= 9;
      addUnique(cautions, "Mungkin lebih cocok untuk pemilik yang sudah berpengalaman.");
    }
  } else {
    score += highActivity || highGrooming ? 5 : 2;
  }

  if (domestic) {
    score += 5;
    addUnique(
      reasons,
      "Kucing domestik atau campuran tetap sangat layak dipertimbangkan dan sering adaptif.",
    );
  }

  if (reasons.length < 2 && breed.shortDescription) {
    addUnique(reasons, breed.shortDescription);
  }

  if (reasons.length < 2) {
    addUnique(reasons, "Profilnya memiliki beberapa faktor yang selaras dengan jawaban kamu.");
  }

  if (cautions.length === 0 && breed.nutritionGuide?.obesityRisk) {
    addUnique(cautions, `Pantau nutrisi: ${breed.nutritionGuide.obesityRisk}.`);
  }

  if (cautions.length === 0) {
    addUnique(cautions, "Tetap kenali karakter individu kucing sebelum mengambil keputusan.");
  }

  return {
    breed,
    score: clampScore(score),
    reasons: reasons.slice(0, 3),
    cautions: cautions.slice(0, 2),
  };
}

export function getBreedQuizResults(
  breeds: BreedQuizInput[],
  answers: BreedQuizAnswers,
) {
  return breeds
    .map((breed) => matchBreedForQuiz(breed, answers))
    .sort((a, b) => b.score - a.score || a.breed.name.localeCompare(b.breed.name))
    .slice(0, 3);
}
