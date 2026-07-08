-- CreateEnum
CREATE TYPE "TimelineStatus" AS ENUM ('Mendatang', 'Tercatat', 'Perawatan', 'Memori');

-- CreateEnum
CREATE TYPE "TimelineCategory" AS ENUM ('Vaksin', 'Berat badan', 'Riwayat sakit', 'Makanan', 'Momen foto', 'Lainnya');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_breeds" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "origin" VARCHAR(80),
    "image_src" TEXT,
    "profile_summary" TEXT,
    "food_type" TEXT,
    "kitten_price_label" VARCHAR(60),
    "monthly_care_label" VARCHAR(60),
    "care_level" VARCHAR(40),
    "availability" VARCHAR(60),
    "match_label" VARCHAR(120),

    CONSTRAINT "cat_breeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_characteristics" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "label" VARCHAR(80) NOT NULL,

    CONSTRAINT "breed_characteristics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "breed_id" TEXT,
    "name" VARCHAR(80) NOT NULL,
    "age_label" VARCHAR(40),
    "weight_kg" DECIMAL(5,2),
    "gender" VARCHAR(10),
    "sterilized" BOOLEAN NOT NULL DEFAULT false,
    "lifestyle" VARCHAR(40),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "event_date" DATE NOT NULL,
    "description" TEXT,
    "category" "TimelineCategory" NOT NULL DEFAULT 'Lainnya',
    "status" "TimelineStatus" NOT NULL DEFAULT 'Tercatat',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "category" VARCHAR(60),
    "price_idr" DECIMAL(12,2) NOT NULL,
    "reason" TEXT,
    "badge" VARCHAR(60),
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "tag" VARCHAR(60) NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category" VARCHAR(60),
    "read_time" VARCHAR(20),
    "summary" TEXT,
    "hero_image" TEXT,
    "vet_warning" TEXT,
    "breed_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_sections" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "heading" VARCHAR(160) NOT NULL,
    "body" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_takeaways" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "point" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "article_takeaways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cat_id" TEXT,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cat_breeds_slug_key" ON "cat_breeds"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cat_breeds_name_key" ON "cat_breeds"("name");

-- CreateIndex
CREATE INDEX "cats_user_id_idx" ON "cats"("user_id");

-- CreateIndex
CREATE INDEX "timeline_events_cat_id_idx" ON "timeline_events"("cat_id");

-- CreateIndex
CREATE INDEX "timeline_events_event_date_idx" ON "timeline_events"("event_date" DESC);

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE INDEX "product_tags_product_id_idx" ON "product_tags"("product_id");

-- CreateIndex
CREATE INDEX "product_tags_tag_idx" ON "product_tags"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "chat_messages_user_id_cat_id_idx" ON "chat_messages"("user_id", "cat_id");

-- CreateIndex
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "breed_characteristics" ADD CONSTRAINT "breed_characteristics_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "cat_breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_sections" ADD CONSTRAINT "article_sections_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_takeaways" ADD CONSTRAINT "article_takeaways_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
