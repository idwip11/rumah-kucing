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

export async function addTimelineEvent(data: z.infer<typeof EventSchema>) {
  const parsed = EventSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);

  const event = await prisma.timelineEvent.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/timeline");
  return event;
}

export async function deleteTimelineEvent(eventId: string) {
  await prisma.timelineEvent.delete({ where: { id: eventId } });
  revalidatePath("/timeline");
}
