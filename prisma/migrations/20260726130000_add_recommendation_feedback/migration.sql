-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('product', 'article', 'care_action');

-- CreateEnum
CREATE TYPE "RecommendationResponse" AS ENUM ('liked', 'disliked', 'not_tried', 'caused_issue', 'saved');

-- CreateTable
CREATE TABLE "recommendation_feedback" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "product_id" TEXT,
    "recommendation_type" "RecommendationType" NOT NULL DEFAULT 'product',
    "response" "RecommendationResponse" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendation_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_feedback_user_id_cat_id_product_id_recommendation_type_key"
ON "recommendation_feedback"("user_id", "cat_id", "product_id", "recommendation_type");

-- CreateIndex
CREATE INDEX "recommendation_feedback_cat_id_recommendation_type_idx"
ON "recommendation_feedback"("cat_id", "recommendation_type");

-- CreateIndex
CREATE INDEX "recommendation_feedback_product_id_idx"
ON "recommendation_feedback"("product_id");

-- AddForeignKey
ALTER TABLE "recommendation_feedback"
ADD CONSTRAINT "recommendation_feedback_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_feedback"
ADD CONSTRAINT "recommendation_feedback_cat_id_fkey"
FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_feedback"
ADD CONSTRAINT "recommendation_feedback_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
