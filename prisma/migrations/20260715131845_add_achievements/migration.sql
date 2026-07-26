-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "achieved_at" DATE NOT NULL,
    "rank" INTEGER,
    "icon" TEXT DEFAULT 'trophy',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "achievements_cat_id_idx" ON "achievements"("cat_id");

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
