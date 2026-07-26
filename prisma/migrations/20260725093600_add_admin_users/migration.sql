CREATE TABLE "admin_users" (
  "id" TEXT NOT NULL,
  "username" VARCHAR(80) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");
