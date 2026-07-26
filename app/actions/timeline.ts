"use server";

/**
 * app/actions/timeline.ts
 * Server Actions for timeline events.
 */

import { prisma } from "@/lib/prisma";
import { TimelineCategory, TimelineStatus } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const EventSchema = z.object({
  catId: z.string().uuid(),
  title: z.string().min(1).max(160),
  eventDate: z.coerce.date(),
  description: z.string().optional(),
  category: z.nativeEnum(TimelineCategory).default(TimelineCategory.Lainnya),
  status: z.nativeEnum(TimelineStatus).default(TimelineStatus.Tercatat),
});

export async function getTimelineEvents(catId: string) {
  return prisma.timelineEvent.findMany({
    where: { catId },
    orderBy: { eventDate: "desc" },
  });
}

export async function getTimelineEventById(eventId: string) {
  return prisma.timelineEvent.findUnique({
    where: { id: eventId },
  });
}

export async function getNextUpcomingEvent(catId: string) {
  return prisma.timelineEvent.findFirst({
    where: {
      catId,
      status: TimelineStatus.Mendatang,
      eventDate: { gte: new Date() },
    },
    orderBy: { eventDate: "asc" },
  });
}

export async function getUpcomingWeekEvents(catId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  return prisma.timelineEvent.findMany({
    where: {
      catId,
      eventDate: { gte: start, lte: end },
    },
    orderBy: { eventDate: "asc" },
  });
}

export async function addTimelineEvent(data: z.infer<typeof EventSchema>) {
  const parsed = EventSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);

  const event = await prisma.timelineEvent.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/timeline");
  return event;
}

export async function updateTimelineEvent(
  eventId: string,
  userId: string,
  data: {
    title?: string;
    eventDate?: Date;
    description?: string;
    category?: TimelineCategory;
    status?: TimelineStatus;
  },
) {
  // Verify the event's cat belongs to the requesting user
  const event = await prisma.timelineEvent.findFirst({
    where: { id: eventId },
    select: { cat: { select: { userId: true } } },
  });
  if (!event || event.cat.userId !== userId) {
    throw new Error("Event tidak ditemukan atau bukan milik user ini");
  }

  const updated = await prisma.timelineEvent.update({
    where: { id: eventId },
    data,
  });
  revalidatePath("/timeline");
  return updated;
}

export async function deleteTimelineEvent(eventId: string, userId: string) {
  try {
    // Verify the event's cat belongs to the requesting user
    const event = await prisma.timelineEvent.findFirst({
      where: { id: eventId },
      select: { cat: { select: { userId: true } } },
    });
    if (!event || event.cat.userId !== userId) {
      return { success: false, error: "Event tidak ditemukan atau bukan milik user ini" };
    }

    await prisma.timelineEvent.delete({ where: { id: eventId } });
    revalidatePath("/timeline");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus event timeline:", error);
    return {
      success: false,
      error: (error as Error).message || "Gagal menghapus catatan",
    };
  }
}
// Note: `deleteTimelineItem` was removed to avoid duplicate imports/definitions
// and because the Prisma schema uses `TimelineEvent` (see `deleteTimelineEvent` above).
// End of file
