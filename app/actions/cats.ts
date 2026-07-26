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
  estimatedDateOfBirth: z.string().optional().nullable(),
  weightKg: z.coerce.number().positive().optional(),
  gender: z.enum(["Betina", "Jantan"]).optional(),
  sterilized: z.boolean().default(false),
  lifestyle: z
    .enum(["Indoor", "Outdoor", "Indoor + balkon", "Campuran"])
    .optional(),
  notes: z.string().optional(),
  photoUrl: z.string().max(500).optional().nullable(),
});

export async function getCats(userId: string) {
  return prisma.cat.findMany({
    where: { userId },
    include: { breed: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCatById(catId: string, userId: string) {
  return prisma.cat.findFirst({
    where: { id: catId, userId },
    include: { breed: { include: { characteristics: true } } },
  });
}

export async function addCat(data: z.infer<typeof CatSchema>) {
  const parsed = CatSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);

  let { userId, breedSlug, estimatedDateOfBirth, ...catData } = parsed.data;

  if (!userId) {
    throw new Error("userId diperlukan untuk membuat profil kucing.");
  }

  let breedId: string | null = null;
  if (breedSlug) {
    const breed = await prisma.catBreed.findUnique({
      where: { slug: breedSlug },
    });
    breedId = breed?.id ?? null;
  }

  // Parse estimatedDateOfBirth if provided
  let dob: Date | undefined;
  if (estimatedDateOfBirth) {
    dob = new Date(estimatedDateOfBirth);
  }

  const cat = await prisma.cat.create({
    data: {
      ...catData,
      userId,
      breedId,
      ...(dob ? { estimatedDateOfBirth: dob } : {}),
    },
  });

  revalidatePath("/");
  return cat;
}

export async function updateCat(
  catId: string,
  userId: string,
  data: Partial<z.infer<typeof CatSchema>>,
) {
  const {
    breedSlug,
    userId: _userId,
    estimatedDateOfBirth,
    ...updateData
  } = data;

  const existing = await prisma.cat.findFirst({
    where: { id: catId, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Profil kucing tidak ditemukan atau bukan milik user ini");
  }

  let breedId: string | undefined;
  if (breedSlug) {
    const breed = await prisma.catBreed.findUnique({
      where: { slug: breedSlug },
    });
    breedId = breed?.id ?? undefined;
  }

  // Parse estimatedDateOfBirth if provided, or set to null to clear it
  let dob: Date | undefined | null = undefined;
  if (estimatedDateOfBirth !== undefined) {
    dob = estimatedDateOfBirth ? new Date(estimatedDateOfBirth) : null;
  }

  const cat = await prisma.cat.update({
    where: { id: catId },
    data: {
      ...updateData,
      ...(breedId ? { breedId } : {}),
      ...(dob !== undefined ? { estimatedDateOfBirth: dob } : {}),
    },
  });

  revalidatePath("/");
  return cat;
}
