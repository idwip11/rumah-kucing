import { getLifeStageLabel } from "@/lib/recommendations/profile";
import type {
  CareInsight,
  DashboardRecommendationCard,
  DerivedCatProfile,
} from "@/lib/recommendations/types";

function insightCard(insight: CareInsight): DashboardRecommendationCard {
  const type: DashboardRecommendationCard["type"] =
    insight.category === "nutrition"
      ? "nutrition"
      : insight.category === "hydration"
        ? "hydration"
        : insight.category === "health" ||
            insight.category === "vaccination"
          ? "health"
          : "care";

  return {
    id: `timeline-${insight.id}`,
    type,
    title: insight.title,
    description: insight.description,
    actionLabel: insight.actionLabel,
    href: insight.href,
  };
}

export function buildDashboardRecommendations(
  profile: DerivedCatProfile,
  careInsights: CareInsight[] = [],
): DashboardRecommendationCard[] {
  const cards: DashboardRecommendationCard[] = careInsights
    .slice(0, 2)
    .map(insightCard);
  const stage = getLifeStageLabel(profile.lifeStage);

  const nutritionCard: DashboardRecommendationCard = {
    id: "profile-nutrition",
    type: "nutrition",
    title:
      profile.isSterilized && profile.lifeStage === "adult"
        ? "Nutrisi adult setelah steril"
        : profile.lifeStage === "unknown"
          ? "Nutrisi sesuai profil"
          : `Nutrisi untuk kucing ${stage}`,
    description: profile.isSterilized
      ? `Prioritaskan formula ${stage} yang membantu menjaga berat badan ${profile.name} setelah steril.`
      : `Pilih makanan yang sesuai dengan tahap usia ${profile.name} agar kebutuhan nutrisinya lebih tepat.`,
    actionLabel: "Lihat pilihan produk",
    href: "/explore/products",
  };

  const groomingCard: DashboardRecommendationCard = {
    id: "profile-grooming",
    type: "care",
    title:
      profile.coatLength === "long"
        ? "Rawat bulu secara rutin"
        : "Jaga rutinitas grooming",
    description:
      profile.coatLength === "long"
        ? `Sisir bulu panjang ${profile.name} 3-4 kali seminggu untuk membantu mengangkat bulu mati dan mengurangi hairball.`
        : `Periksa bulu, kuku, telinga, dan kebersihan ${profile.name} secara berkala.`,
    actionLabel: "Buka timeline",
    href: "/timeline",
  };

  const activityCard: DashboardRecommendationCard = {
    id: "profile-activity",
    type: "activity",
    title:
      profile.lifestyle === "indoor"
        ? "Bermain aktif hari ini"
        : "Aktivitas yang aman",
    description:
      profile.lifestyle === "indoor"
        ? `Ajak ${profile.name} bermain interaktif sekitar 15 menit untuk membantu menjaga aktivitas dan mengurangi kebosanan.`
        : `Sesuaikan aktivitas ${profile.name} dengan lingkungan yang aman dan pantau perubahan kebiasaannya.`,
    actionLabel: "Lihat kebutuhan aktivitas",
    href: "/explore/products?tag=aksesori",
  };

  const fallbackCards = [nutritionCard, groomingCard, activityCard];

  for (const card of fallbackCards) {
    if (cards.length >= 3) break;

    const hasSameType = cards.some((existing) => existing.type === card.type);
    if (!hasSameType || card.type === "activity") {
      cards.push(card);
    }
  }

  for (const card of fallbackCards) {
    if (cards.length >= 3) break;
    if (!cards.some((existing) => existing.id === card.id)) {
      cards.push(card);
    }
  }

  return cards.slice(0, 3);
}

export function buildRecommendationSummary(profile: DerivedCatProfile) {
  const facts: string[] = [];

  if (profile.lifeStage !== "unknown") {
    facts.push(`usia ${getLifeStageLabel(profile.lifeStage)}`);
  }
  if (profile.breedName) facts.push(`ras ${profile.breedName}`);
  if (profile.isSterilized) facts.push("status steril");
  if (profile.lifestyle !== "unknown") facts.push(`gaya hidup ${profile.lifestyle}`);

  if (facts.length === 0) {
    return `Lengkapi profil ${profile.name} agar rekomendasi bisa semakin personal.`;
  }

  return `Dipilih untuk ${profile.name} berdasarkan ${facts.join(", ")}.`;
}
