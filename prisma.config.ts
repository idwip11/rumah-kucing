/**
 * prisma.config.ts
 * Prisma v7 configuration — database URL is read from DATABASE_URL env var.
 * The url property has moved here from schema.prisma.
 */

import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma/schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
});
