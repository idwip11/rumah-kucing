export type OrderStatus = "Menunggu" | "Dikonfirmasi" | "Selesai" | "Batal";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  catCount: number;
  orderCount: number;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  cats: {
    id: string;
    name: string;
    breed: string | null;
    weightKg: number | null;
    gender: string | null;
    sterilized: boolean;
    estimatedDateOfBirth: string | null;
  }[];
  orders: {
    id: string;
    status: string;
    total: number;
    channel: string | null;
    createdAt: string;
  }[];
}

export interface AdminCat {
  id: string;
  name: string;
  weightKg: number | null;
  gender: string | null;
  sterilized: boolean;
  ageLabel: string | null;
  estimatedDateOfBirth: string | null;
  breed: string | null;
  owner: string | null;
  ownerEmail: string | null;
  timelineCount: number;
  achievementCount: number;
}

export interface CatDetail {
  id: string;
  name: string;
  ageLabel: string | null;
  estimatedDateOfBirth: string | null;
  weightKg: number | null;
  gender: string | null;
  sterilized: boolean;
  lifestyle: string | null;
  notes: string | null;
  createdAt: string;
  breed: string | null;
  breedOrigin: string | null;
  owner: { id: string; name: string; email: string } | null;
  chatCount: number;
  timelineEvents: {
    id: string;
    title: string;
    eventDate: string;
    category: string;
    status: string;
    description: string | null;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string | null;
    achievedAt: string;
    rank: number | null;
  }[];
}

export interface AdminOrder {
  id: string;
  status: string;
  total: number;
  channel: string | null;
  createdAt: string;
  customer: string;
  customerEmail: string | null;
  itemCount: number;
}

export interface OrderDetail {
  id: string;
  status: string;
  total: number;
  channel: string | null;
  createdAt: string;
  customer: { id: string; name: string; email: string } | null;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string | null;
  priceIdr: number;
  reason: string | null;
  description: string | null;
  badge: string | null;
  imageUrl: string | null;
  stock: number | null;
  isActive: boolean;
  createdAt: string;
  tags: string[];
}

export interface AdminBreed {
  id: string;
  slug: string;
  name: string;
  origin: string | null;
  imageSrc: string | null;
  profileSummary: string | null;
  foodType: string | null;
  kittenPriceLabel: string | null;
  monthlyCareLabel: string | null;
  careLevel: string | null;
  availability: string | null;
  matchLabel: string | null;
  alternativeNames: string[];
  shortDescription: string | null;
  backdropImageSrc: string | null;
  history: string | null;
  personalityDescription: string | null;
  sizeLabel: string | null;
  maleWeightRange: string | null;
  femaleWeightRange: string | null;
  lifeExpectancy: string | null;
  coatLength: string | null;
  coatPatterns: string | null;
  activityLevel: string | null;
  vocalLevel: string | null;
  indoorFit: string | null;
  beginnerFitScore: number | null;
  activityScore: number | null;
  friendlinessScore: number | null;
  groomingScore: number | null;
  vocalScore: number | null;
  adaptabilityScore: number | null;
  childFriendlyScore: number | null;
  petFriendlyScore: number | null;
  sourceNotes: string | null;
  contentUpdatedAt: string | null;
  commercialUpdatedAt: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  characteristics: string[];
  careGuide: BreedCareGuide | null;
  nutritionGuide: BreedNutritionGuide | null;
  healthNotes: BreedHealthNote[];
  costEstimates: BreedCostEstimate[];
  galleryImages: BreedGalleryImage[];
  colorPatterns: BreedColorPattern[];
  similarBreeds: BreedSimilar[];
  suitabilities: BreedSuitability[];
  catCount: number;
  articleCount: number;
}

export interface BreedInput {
  slug: string;
  name: string;
  origin?: string | null;
  imageSrc?: string | null;
  profileSummary?: string | null;
  foodType?: string | null;
  kittenPriceLabel?: string | null;
  monthlyCareLabel?: string | null;
  careLevel?: string | null;
  availability?: string | null;
  matchLabel?: string | null;
  characteristics?: string[];
  alternativeNames?: string[];
  shortDescription?: string | null;
  backdropImageSrc?: string | null;
  history?: string | null;
  personalityDescription?: string | null;
  sizeLabel?: string | null;
  maleWeightRange?: string | null;
  femaleWeightRange?: string | null;
  lifeExpectancy?: string | null;
  coatLength?: string | null;
  coatPatterns?: string | null;
  activityLevel?: string | null;
  vocalLevel?: string | null;
  indoorFit?: string | null;
  beginnerFitScore?: number | null;
  activityScore?: number | null;
  friendlinessScore?: number | null;
  groomingScore?: number | null;
  vocalScore?: number | null;
  adaptabilityScore?: number | null;
  childFriendlyScore?: number | null;
  petFriendlyScore?: number | null;
  sourceNotes?: string | null;
  contentUpdatedAt?: string | null;
  commercialUpdatedAt?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  careGuide?: BreedCareGuideInput;
  nutritionGuide?: BreedNutritionGuideInput;
  healthNotes?: BreedHealthNoteInput[];
  costEstimates?: BreedCostEstimateInput[];
  galleryImages?: BreedGalleryImageInput[];
  colorPatterns?: BreedColorPatternInput[];
  similarBreeds?: BreedSimilarInput[];
  suitabilities?: BreedSuitabilityInput[];
}

export interface BreedCareGuide {
  brushingFrequency: string | null;
  bathing: string | null;
  eyeCare: string | null;
  earCare: string | null;
  nailCare: string | null;
  dentalCare: string | null;
  sheddingLevel: string | null;
  hairballRisk: string | null;
  notes: string | null;
}

export interface BreedNutritionGuide {
  lifeStageNotes: string | null;
  proteinNotes: string | null;
  hydrationNotes: string | null;
  portionNotes: string | null;
  obesityRisk: string | null;
  specialNeeds: string | null;
}

export interface BreedHealthNote {
  id?: string;
  title: string;
  description: string;
  severityLabel: string | null;
  monitoringTips: string | null;
  sortOrder: number;
}

export interface BreedCostEstimate {
  id?: string;
  initialCostLabel: string | null;
  monthlyCostLabel: string | null;
  groomingCostLabel: string | null;
  vaccineCheckupLabel: string | null;
  starterKitLabel: string | null;
  cityLabel: string | null;
  notes: string | null;
}

export interface BreedGalleryImage {
  id?: string;
  url: string;
  alt: string | null;
  type: string;
  credit: string | null;
  sourceUrl: string | null;
  sortOrder: number;
}

export interface BreedColorPattern {
  id?: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface BreedSimilar {
  id?: string;
  similarBreedId: string;
  similarBreedName: string | null;
  similarBreedSlug: string | null;
  reason: string | null;
  sortOrder: number;
}

export interface BreedSuitability {
  id?: string;
  type: "good_for" | "consider_if";
  label: string;
  description: string | null;
  sortOrder: number;
}

export type BreedCareGuideInput = BreedCareGuide;
export type BreedNutritionGuideInput = BreedNutritionGuide;
export type BreedHealthNoteInput = Omit<BreedHealthNote, "id">;
export type BreedCostEstimateInput = Omit<BreedCostEstimate, "id">;
export type BreedGalleryImageInput = Omit<BreedGalleryImage, "id">;
export type BreedColorPatternInput = Omit<BreedColorPattern, "id">;
export type BreedSimilarInput = Omit<
  BreedSimilar,
  "id" | "similarBreedName" | "similarBreedSlug"
>;
export type BreedSuitabilityInput = Omit<BreedSuitability, "id">;

export interface ProductInput {
  name: string;
  category?: string | null;
  priceIdr: number;
  reason?: string | null;
  description?: string | null;
  badge?: string | null;
  imageUrl?: string | null;
  stock?: number | null;
  isActive?: boolean;
  tags?: string[];
}

export interface DashboardStats {
  totalUsers: number;
  totalCats: number;
  totalOrders: number;
  totalProducts: number;
  totalTimelineEvents: number;
  totalRevenue: number;
  ordersByStatus: { status: string; count: number }[];
  signupsByDay: Record<string, number>;
  warnings?: string[];
}

export interface Analytics {
  topProducts: { name: string; quantity: number; orderCount: number }[];
  breedDistribution: { breed: string; count: number }[];
  channelDistribution: { channel: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  topUsers: { user: string; orderCount: number }[];
}

export interface AdminEvent {
  id: string;
  title: string;
  type: string;
  eventDate: string;
  location: string;
  description: string | null;
  sourceUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventInput {
  title: string;
  type: string;
  eventDate: string;
  location: string;
  description?: string | null;
  sourceUrl?: string | null;
  isActive?: boolean;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─────────────────────────────────────────────
// ARTICLES
// ─────────────────────────────────────────────
export interface AdminArticle {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  readTime: string | null;
  summary: string | null;
  heroImage: string | null;
  vetWarning: string | null;
  breedId: string | null;
  updatedAt: string;
  createdAt?: string;
  author?: string | null;
  sourceUrl?: string | null;
  sections?: ArticleSection[];
  takeaways?: ArticleTakeaway[];
}

export interface ArticleSection {
  id?: string;
  heading: string;
  body: string;
  sortOrder?: number;
}

export interface ArticleTakeaway {
  id?: string;
  point: string;
  sortOrder?: number;
}

export interface ArticleInput {
  slug: string;
  title: string;
  category: string | null;
  readTime: string | null;
  summary: string | null;
  heroImage: string | null;
  vetWarning: string | null;
  breedId: string | null;
  author: string | null;
  sourceUrl: string | null;
  sections: ArticleSection[];
  takeaways: ArticleTakeaway[];
}
