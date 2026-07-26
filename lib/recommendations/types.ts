export type CatLifeStage = "kitten" | "adult" | "senior" | "unknown";
export type CoatLength = "short" | "medium" | "long" | "unknown";
export type CatLifestyle = "indoor" | "outdoor" | "mixed" | "unknown";

export type RecommendationMatchLabel =
  | "Sangat cocok"
  | "Cocok"
  | "Cukup cocok"
  | "Kurang sesuai"
  | "Tidak direkomendasikan";

export type RecommendationFeedbackResponse =
  | "liked"
  | "disliked"
  | "not_tried"
  | "caused_issue"
  | "saved";

export type TastePreferenceSignals = {
  preferredFlavors: string[];
  avoidedFlavors: string[];
};

export type ProductRecommendationPersonalization = {
  directResponse?: RecommendationFeedbackResponse | null;
  tastePreferences?: TastePreferenceSignals;
};

export type ProductRecommendationRankingContext = {
  feedbackByProductId?: Record<
    string,
    RecommendationFeedbackResponse | undefined
  >;
  tastePreferences?: TastePreferenceSignals;
};

export type RecommendationCat = {
  id: string;
  name: string;
  estimatedDateOfBirth?: Date | string | null;
  ageLabel?: string | null;
  weightKg?: number | string | { toString(): string } | null;
  sterilized?: boolean | null;
  lifestyle?: string | null;
  notes?: string | null;
  breed?: {
    name?: string | null;
    slug?: string | null;
    characteristics?: Array<{ label: string }>;
  } | null;
};

export type DerivedCatProfile = {
  id: string;
  name: string;
  ageMonths: number | null;
  lifeStage: CatLifeStage;
  breedName: string | null;
  breedSlug: string | null;
  coatLength: CoatLength;
  isSterilized: boolean;
  lifestyle: CatLifestyle;
  weightKg: number | null;
  dietaryAvoidances: string[];
  priorities: Array<
    "life-stage" | "weight" | "coat" | "activity" | "hydration"
  >;
};

export type RecommendationProduct = {
  id: string;
  name: string;
  category?: string | null;
  priceIdr: number | string | { toString(): string };
  reason?: string | null;
  description?: string | null;
  badge?: string | null;
  imageUrl?: string | null;
  stock?: number | null;
  tags?: Array<{ tag: string }>;
};

export type ProductMatch = {
  productId: string;
  label: RecommendationMatchLabel;
  reasons: string[];
  benefits: string[];
  suitableFor: string[];
  cautions: string[];
  safetyWarning?: string;
  sortScore: number;
};

export type RecommendedProduct = {
  id: string;
  name: string;
  category: string | null;
  priceIdr: number;
  reason: string | null;
  description: string | null;
  badge: string | null;
  imageUrl: string | null;
  stock: number | null;
  tags: string[];
  match: Omit<ProductMatch, "productId" | "sortScore">;
};

export type DashboardRecommendationCard = {
  id: string;
  type:
    | "nutrition"
    | "care"
    | "activity"
    | "hydration"
    | "health";
  title: string;
  description: string;
  actionLabel: string;
  href: string;
};

export type RecommendationTimelineEvent = {
  id: string;
  title: string;
  eventDate: Date | string;
  description?: string | null;
  category: string;
  status?: string | null;
};

export type CareInsightCategory =
  | "grooming"
  | "weight"
  | "hairball"
  | "health"
  | "nutrition"
  | "hydration"
  | "vaccination";

export type CareInsight = {
  id: string;
  category: CareInsightCategory;
  tone: "info" | "attention" | "safety";
  title: string;
  description: string;
  reason: string;
  actionLabel: string;
  href: string;
  priority: number;
};

export type TimelineCareSignals = {
  lastGroomingAt: string | null;
  daysSinceGrooming: number | null;
  lastWeightAt: string | null;
  daysSinceWeight: number | null;
  latestWeightKg: number | null;
  previousWeightKg: number | null;
  weightChangeKg: number | null;
  weightChangeDays: number | null;
  hairballEvents30d: number;
  recentIllnessEvents30d: number;
  recentFoodNotes45d: number;
  recentDryFoodNotes45d: number;
  recentFoodChange: boolean;
  hydrationConcern: boolean;
  urinaryConcern: boolean;
  hasRecordedVaccine: boolean;
};
