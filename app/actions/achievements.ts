"use server";

/**
 * app/actions/achievements.ts
 * Server Actions for cat achievements (Galeri Prestasi).
 */

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type AchievementDTO = {
  id: string;
  title: string;
  description: string | null;
  achievedAt: Date;
  rank: number | null;
  icon: string | null;
};

// Returns achievements for a cat ordered by rank (asc) then date (desc).
// `limit` caps the result (e.g. 3 for the dashboard top achievements).
// `userId` is optional but should always be provided when called from the API
// layer to prevent cross-user data leaks.
export async function getAchievements(
  catId: string,
  limit?: number,
  userId?: string,
): Promise<AchievementDTO[]> {
  // If a userId is provided, verify the cat belongs to that user
  if (userId) {
    const cat = await prisma.cat.findFirst({
      where: { id: catId, userId },
      select: { id: true },
    });
    if (!cat) return [];
  }

  const items = await prisma.achievement.findMany({
    where: { catId },
    orderBy: [{ rank: { sort: "asc", nulls: "last" } }, { achievedAt: "desc" }],
    ...(limit ? { take: limit } : {}),
  });

  return items.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    achievedAt: a.achievedAt,
    rank: a.rank,
    icon: a.icon,
  }));
}

export async function addAchievement(data: {
  catId: string;
  title: string;
  description?: string;
  achievedAt: Date;
  rank?: number;
  icon?: string;
  userId?: string;
}) {
  // If a userId is provided, verify the cat belongs to that user
  if (data.userId) {
    const cat = await prisma.cat.findFirst({
      where: { id: data.catId, userId: data.userId },
      select: { id: true },
    });
    if (!cat) {
      throw new Error("Profil kucing tidak ditemukan atau bukan milik user ini");
    }
  }

  const created = await prisma.achievement.create({
    data: {
      catId: data.catId,
      title: data.title,
      description: data.description,
      achievedAt: data.achievedAt,
      rank: data.rank,
      icon: data.icon ?? "trophy",
    },
  });
  revalidatePath("/");
  revalidatePath("/achievements");
  return created;
}
