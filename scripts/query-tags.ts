import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const tags = await prisma.productTag.findMany({
    select: {
      tag: true,
      productId: true,
      product: {
        select: {
          name: true,
        }
      }
    }
  });
  console.log("ALL TAGS IN DATABASE:");
  console.log(JSON.stringify(tags, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
