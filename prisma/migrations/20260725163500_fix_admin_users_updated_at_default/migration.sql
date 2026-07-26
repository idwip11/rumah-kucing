UPDATE "admin_users"
SET "updated_at" = COALESCE("updated_at", "created_at", CURRENT_TIMESTAMP)
WHERE "updated_at" IS NULL;

ALTER TABLE "admin_users"
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION set_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON "admin_users";

CREATE TRIGGER admin_users_set_updated_at
BEFORE UPDATE ON "admin_users"
FOR EACH ROW
EXECUTE FUNCTION set_admin_users_updated_at();
