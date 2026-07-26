export type BreedCompareInput = {
  name: string;
  careLevel?: string | null;
  activityLevel?: string | null;
  vocalLevel?: string | null;
  indoorFit?: string | null;
  beginnerFitScore?: number | null;
  activityScore?: number | null;
  groomingScore?: number | null;
  vocalScore?: number | null;
  coatLength?: string | null;
  monthlyCareLabel?: string | null;
  matchLabel?: string | null;
  nutritionGuide?: {
    obesityRisk?: string | null;
  } | null;
};

export function scoreLabel(score?: number | null) {
  if (score == null) return "Belum dinilai";
  if (score >= 8) return "Tinggi";
  if (score >= 5) return "Sedang";
  return "Rendah";
}

export function numericScore(score?: number | null) {
  if (score == null) return 0;
  return Math.max(1, Math.min(10, score));
}

export function activitySummary(breed: BreedCompareInput) {
  return breed.activityLevel?.trim() || scoreLabel(breed.activityScore);
}

export function groomingSummary(breed: BreedCompareInput) {
  const care = breed.careLevel?.trim();
  const coat = breed.coatLength?.trim();
  if (care && coat) return `${care} · ${coat}`;
  return care || coat || scoreLabel(breed.groomingScore);
}

export function beginnerSummary(breed: BreedCompareInput) {
  const label = scoreLabel(breed.beginnerFitScore);
  return breed.matchLabel?.trim() || label;
}

export function vocalSummary(breed: BreedCompareInput) {
  return breed.vocalLevel?.trim() || scoreLabel(breed.vocalScore);
}

export function indoorSummary(breed: BreedCompareInput) {
  return breed.indoorFit?.trim() || "Perlu dilihat dari individu";
}

export function costSummary(breed: BreedCompareInput) {
  return breed.monthlyCareLabel?.trim() || "Belum dicatat";
}

export function obesitySummary(breed: BreedCompareInput) {
  return (
    breed.nutritionGuide?.obesityRisk?.trim() ||
    "Pantau sesuai berat dan aktivitas"
  );
}

export function playtimeSummary(breed: BreedCompareInput) {
  const score = breed.activityScore;
  if (score == null) return "Sesuaikan dengan energi harian";
  if (score >= 8) return "45-60 menit/hari";
  if (score >= 5) return "20-30 menit/hari";
  return "15-20 menit/hari";
}

export function compareEaseScore(breed: BreedCompareInput) {
  const beginner = numericScore(breed.beginnerFitScore);
  const indoor = /sangat|cocok|indoor/i.test(breed.indoorFit ?? "") ? 8 : 5;
  const grooming = breed.groomingScore == null ? 5 : 11 - numericScore(breed.groomingScore);
  const activity = breed.activityScore == null ? 5 : 11 - numericScore(breed.activityScore);
  const vocal = breed.vocalScore == null ? 5 : 11 - numericScore(breed.vocalScore);

  return beginner * 1.6 + indoor + grooming + activity * 0.8 + vocal * 0.6;
}

export function compareRecommendationReason(breed: BreedCompareInput) {
  const reasons: string[] = [];

  if ((breed.beginnerFitScore ?? 0) >= 7 || /pemula|first-time/i.test(breed.matchLabel ?? "")) {
    reasons.push("cenderung ramah untuk pemilik yang masih belajar");
  }

  if (/indoor|apartemen|rumah kecil|sangat cocok/i.test(breed.indoorFit ?? "")) {
    reasons.push("punya kecocokan yang baik untuk gaya hidup indoor");
  }

  if ((breed.groomingScore ?? 10) <= 5 || /rendah|mudah|ringan/i.test(breed.careLevel ?? "")) {
    reasons.push("kebutuhan grooming relatif lebih mudah dikelola");
  }

  if ((breed.activityScore ?? 10) <= 6) {
    reasons.push("aktivitas hariannya tidak terlalu tinggi dibanding ras yang sangat aktif");
  }

  return reasons.slice(0, 2);
}
