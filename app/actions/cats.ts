"use server";

/**
 * app/actions/cats.ts
 * Server Actions for cat profile management.
 */

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const CatSchema = z.object({
  userId: z.string().uuid(),
  breedSlug: z.string().optional(),
  name: z.string().min(1).max(80),
  ageLabel: z.string().max(40).optional(),
  weightKg: z.coerce.number().positive().optional(),
  gender: z.enum(["Betina", "Jantan"]).optional(),
  sterilized: z.boolean().default(false),
  lifestyle: z.enum(["Indoor", "Outdoor", "Indoor + balkon", "Campuran"]).optional(),
  notes: z.string().optional(),
});

export async function getCats(userId: string) {
  return prisma.cat.findMany({
    where: { userId },
    include: { breed: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCatById(catId: string) {
  return prisma.cat.findUnique({
    where: { id: catId },
    include: { breed: { include: { characteristics: true } } },
  });
}

export async function addCat(data: z.infer<typeof CatSchema>) {
  const parsed = CatSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);

  const { userId, breedSlug, ...catData } = parsed.data;

  let breedId: string | null = null;
  if (breedSlug) {
    const breed = await prisma.catBreed.findUnique({ where: { slug: breedSlug } });
    breedId = breed?.id ?? null;
  }

  const cat = await prisma.cat.create({
    data: { ...catData, userId, breedId },
  });

  revalidatePath("/");
  return cat;
}

export async function updateCat(catId: string, data: Partial<z.infer<typeof CatSchema>>) {
  const { breedSlug, userId: _userId, ...updateData } = data;

  let breedId: string | undefined;
  if (breedSlug) {
    const breed = await prisma.catBreed.findUnique({ where: { slug: breedSlug } });
    breedId = breed?.id ?? undefined;
  }

  const cat = await prisma.cat.update({
    where: { id: catId },
    data: { ...updateData, ...(breedId ? { breedId } : {}) },
  });

  revalidatePath("/");
  return cat;
}
