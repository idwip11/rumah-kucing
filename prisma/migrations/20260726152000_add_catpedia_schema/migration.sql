-- CreateEnum
CREATE TYPE "BreedGalleryImageType" AS ENUM ('main', 'backdrop', 'face', 'full_body', 'kitten', 'adult', 'color_variant', 'other');

-- CreateEnum
CREATE TYPE "BreedSuitabilityType" AS ENUM ('good_for', 'consider_if');

-- CreateEnum
CREATE TYPE "BreedFavoriteListType" AS ENUM ('favorite', 'learn_later', 'adoption_consideration', 'had_before');

-- AlterTable
ALTER TABLE "cat_breeds"
ADD COLUMN "alternative_names" JSONB,
ADD COLUMN "short_description" TEXT,
ADD COLUMN "backdrop_image_src" TEXT,
ADD COLUMN "history" TEXT,
ADD COLUMN "personality_description" TEXT,
ADD COLUMN "size_label" VARCHAR(80),
ADD COLUMN "male_weight_range" VARCHAR(80),
ADD COLUMN "female_weight_range" VARCHAR(80),
ADD COLUMN "life_expectancy" VARCHAR(80),
ADD COLUMN "coat_length" VARCHAR(80),
ADD COLUMN "coat_patterns" TEXT,
ADD COLUMN "activity_level" VARCHAR(80),
ADD COLUMN "vocal_level" VARCHAR(80),
ADD COLUMN "indoor_fit" VARCHAR(80),
ADD COLUMN "beginner_fit_score" INTEGER,
ADD COLUMN "activity_score" INTEGER,
ADD COLUMN "friendliness_score" INTEGER,
ADD COLUMN "grooming_score" INTEGER,
ADD COLUMN "vocal_score" INTEGER,
ADD COLUMN "adaptability_score" INTEGER,
ADD COLUMN "child_friendly_score" INTEGER,
ADD COLUMN "pet_friendly_score" INTEGER,
ADD COLUMN "source_notes" TEXT,
ADD COLUMN "content_updated_at" TIMESTAMP(3),
ADD COLUMN "commercial_updated_at" TIMESTAMP(3),
ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill conservative Catpedia fields from existing seed data.
UPDATE "cat_breeds"
SET
  "short_description" = COALESCE("short_description", "profile_summary"),
  "content_updated_at" = COALESCE("content_updated_at", CURRENT_TIMESTAMP),
  "commercial_updated_at" = COALESCE("commercial_updated_at", CURRENT_TIMESTAMP);

-- CreateTable
CREATE TABLE "breed_care_guides" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "brushing_frequency" TEXT,
    "bathing" TEXT,
    "eye_care" TEXT,
    "ear_care" TEXT,
    "nail_care" TEXT,
    "dental_care" TEXT,
    "shedding_level" VARCHAR(80),
    "hairball_risk" VARCHAR(80),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_care_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_nutrition_guides" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "life_stage_notes" TEXT,
    "protein_notes" TEXT,
    "hydration_notes" TEXT,
    "portion_notes" TEXT,
    "obesity_risk" VARCHAR(80),
    "special_needs" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_nutrition_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_health_notes" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "severity_label" VARCHAR(80),
    "monitoring_tips" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_health_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_cost_estimates" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "initial_cost_label" VARCHAR(120),
    "monthly_cost_label" VARCHAR(120),
    "grooming_cost_label" VARCHAR(120),
    "vaccine_checkup_label" VARCHAR(120),
    "starter_kit_label" VARCHAR(120),
    "city_label" VARCHAR(120),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_cost_estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_color_patterns" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_color_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_gallery_images" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "color_pattern_id" TEXT,
    "url" TEXT NOT NULL,
    "alt" VARCHAR(255),
    "type" "BreedGalleryImageType" NOT NULL DEFAULT 'other',
    "credit" VARCHAR(160),
    "source_url" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_similars" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "similar_breed_id" TEXT NOT NULL,
    "reason" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_similars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_suitabilities" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "type" "BreedSuitabilityType" NOT NULL,
    "label" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_suitabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "list_type" "BreedFavoriteListType" NOT NULL DEFAULT 'favorite',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_views" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" VARCHAR(160),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breed_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "breed_care_guides_breed_id_key" ON "breed_care_guides"("breed_id");

-- CreateIndex
CREATE UNIQUE INDEX "breed_nutrition_guides_breed_id_key" ON "breed_nutrition_guides"("breed_id");

-- CreateIndex
CREATE INDEX "breed_health_notes_breed_id_sort_order_idx" ON "breed_health_notes"("breed_id", "sort_order");

-- CreateIndex
CREATE INDEX "breed_cost_estimates_breed_id_updated_at_idx" ON "breed_cost_estimates"("breed_id", "updated_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "breed_color_patterns_breed_id_name_key" ON "breed_color_patterns"("breed_id", "name");

-- CreateIndex
CREATE INDEX "breed_color_patterns_breed_id_sort_order_idx" ON "breed_color_patterns"("breed_id", "sort_order");

-- CreateIndex
CREATE INDEX "breed_gallery_images_breed_id_type_sort_order_idx" ON "breed_gallery_images"("breed_id", "type", "sort_order");

-- CreateIndex
CREATE INDEX "breed_gallery_images_color_pattern_id_idx" ON "breed_gallery_images"("color_pattern_id");

-- CreateIndex
CREATE UNIQUE INDEX "breed_similars_breed_id_similar_breed_id_key" ON "breed_similars"("breed_id", "similar_breed_id");

-- CreateIndex
CREATE INDEX "breed_similars_breed_id_sort_order_idx" ON "breed_similars"("breed_id", "sort_order");

-- CreateIndex
CREATE INDEX "breed_similars_similar_breed_id_idx" ON "breed_similars"("similar_breed_id");

-- CreateIndex
CREATE INDEX "breed_suitabilities_breed_id_type_sort_order_idx" ON "breed_suitabilities"("breed_id", "type", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "breed_favorites_user_id_breed_id_list_type_key" ON "breed_favorites"("user_id", "breed_id", "list_type");

-- CreateIndex
CREATE INDEX "breed_favorites_breed_id_idx" ON "breed_favorites"("breed_id");

-- CreateIndex
CREATE INDEX "breed_views_breed_id_created_at_idx" ON "breed_views"("breed_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "breed_views_user_id_idx" ON "breed_views"("user_id");

-- CreateIndex
CREATE INDEX "breed_views_session_id_idx" ON "breed_views"("session_id");

-- AddForeignKey
ALTER TABLE "breed_care_guides"
ADD CONSTRAINT "breed_care_guides_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_nutrition_guides"
ADD CONSTRAINT "breed_nutrition_guides_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_health_notes"
ADD CONSTRAINT "breed_health_notes_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_cost_estimates"
ADD CONSTRAINT "breed_cost_estimates_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_color_patterns"
ADD CONSTRAINT "breed_color_patterns_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_gallery_images"
ADD CONSTRAINT "breed_gallery_images_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_gallery_images"
ADD CONSTRAINT "breed_gallery_images_color_pattern_id_fkey"
FOREIGN KEY ("color_pattern_id") REFERENCES "breed_color_patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_similars"
ADD CONSTRAINT "breed_similars_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_similars"
ADD CONSTRAINT "breed_similars_similar_breed_id_fkey"
FOREIGN KEY ("similar_breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_suitabilities"
ADD CONSTRAINT "breed_suitabilities_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_favorites"
ADD CONSTRAINT "breed_favorites_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_favorites"
ADD CONSTRAINT "breed_favorites_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_views"
ADD CONSTRAINT "breed_views_breed_id_fkey"
FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_views"
ADD CONSTRAINT "breed_views_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
