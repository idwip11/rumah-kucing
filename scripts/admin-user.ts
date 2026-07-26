import "dotenv/config";
import bcrypt from "bcryptjs";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function askHidden(question: string) {
  const rl = createInterface({ input, output });
  const mutableOutput = output as NodeJS.WriteStream & {
    muted?: boolean;
  };
  const originalWrite = mutableOutput.write;

  mutableOutput.muted = true;
  mutableOutput.write = function write(chunk: any, encoding?: any, cb?: any) {
    if (!mutableOutput.muted) {
      return originalWrite.call(this, chunk, encoding, cb);
    }
    if (String(chunk).includes("\n")) {
      return originalWrite.call(this, "\n", encoding, cb);
    }
    return true;
  };

  try {
    const answer = await rl.question(question);
    mutableOutput.muted = false;
    return answer;
  } finally {
    mutableOutput.write = originalWrite;
    rl.close();
  }
}

async function askVisible(question: string) {
  const rl = createInterface({ input, output });
  try {
    return await rl.question(question);
  } finally {
    rl.close();
  }
}

async function readCredentials() {
  const username = (await askVisible("Username admin: ")).trim().toLowerCase();
  if (!username) {
    throw new Error("Username wajib diisi");
  }

  const password = await askHidden("Password admin: ");
  const confirmPassword = await askHidden("Ulangi password admin: ");

  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  if (password !== confirmPassword) {
    throw new Error("Konfirmasi password tidak cocok");
  }

  return { username, password };
}

async function createAdmin() {
  const { username, password } = await readCredentials();
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.create({
    data: {
      username,
      passwordHash,
      isActive: true,
    },
    select: {
      id: true,
      username: true,
      isActive: true,
    },
  });

  console.log(`Admin dibuat: ${admin.username} (${admin.id})`);
}

async function resetPassword() {
  const { username, password } = await readCredentials();
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.update({
    where: { username },
    data: {
      passwordHash,
      isActive: true,
    },
    select: {
      id: true,
      username: true,
      isActive: true,
    },
  });

  console.log(`Password admin direset: ${admin.username} (${admin.id})`);
}

async function main() {
  const command = process.argv[2];

  if (command === "create") {
    await createAdmin();
    return;
  }

  if (command === "reset-password") {
    await resetPassword();
    return;
  }

  console.error("Gunakan: npm run admin:create atau npm run admin:reset-password");
  process.exit(1);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
