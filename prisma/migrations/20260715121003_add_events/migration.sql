-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "type" VARCHAR(80) NOT NULL,
    "event_date" DATE NOT NULL,
    "location" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "source_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_event_date_idx" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "events_is_active_idx" ON "events"("is_active");
