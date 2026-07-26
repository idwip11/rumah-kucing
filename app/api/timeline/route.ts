import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  addTimelineEvent,
  getTimelineEvents,
  getTimelineEventById,
  updateTimelineEvent,
  deleteTimelineEvent,
} from "@/app/actions/timeline";
import { TimelineCategory, TimelineStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const EventSchema = z.object({
  catId: z.string().uuid(),
  title: z.string().min(1).max(160),
  eventDate: z.coerce.date(),
  description: z.string().optional(),
  category: z.nativeEnum(TimelineCategory).default(TimelineCategory.Lainnya),
  status: z.nativeEnum(TimelineStatus).default(TimelineStatus.Tercatat),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = request.nextUrl.searchParams.get("eventId");
    if (eventId) {
      const event = await getTimelineEventById(eventId);
      if (!event) {
        return NextResponse.json(
          { error: "Event tidak ditemukan" },
          { status: 404 },
        );
      }

      // Verify the event's cat belongs to the authenticated user
      const cat = await prisma.cat.findFirst({
        where: { id: event.catId, userId: user.id },
        select: { id: true },
      });
      if (!cat) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(event);
    }

    const catId = request.nextUrl.searchParams.get("catId");
    if (!catId) {
      return NextResponse.json(
        { error: "catId parameter is required" },
        { status: 400 },
      );
    }

    // Verify the requested cat belongs to the authenticated user
    const cat = await prisma.cat.findFirst({
      where: { id: catId, userId: user.id },
      select: { id: true },
    });
    if (!cat) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const events = await getTimelineEvents(catId);
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to get timeline events:", error);
    return NextResponse.json(
      { error: "Failed to get timeline events" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = EventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    // Verify the catId belongs to the authenticated user before creating the event
    const cat = await prisma.cat.findFirst({
      where: { id: parsed.data.catId, userId: user.id },
      select: { id: true },
    });
    if (!cat) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const event = await addTimelineEvent(parsed.data);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create timeline event:", error);
    return NextResponse.json(
      { error: "Failed to create timeline event" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, ...data } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 },
      );
    }

    // Ownership is verified inside updateTimelineEvent using userId
    const event = await updateTimelineEvent(eventId, user.id, {
      title: data.title,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      description: data.description,
      category: data.category,
      status: data.status,
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to update timeline event:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update timeline event",
      },
      { status: error instanceof Error && error.message.includes("bukan milik") ? 403 : 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = request.nextUrl.searchParams.get("eventId");
    if (!eventId) {
      return NextResponse.json(
        { error: "eventId parameter is required" },
        { status: 400 },
      );
    }

    // Ownership is verified inside deleteTimelineEvent using userId
    const result = await deleteTimelineEvent(eventId, user.id);
    if (!result.success && result.error?.includes("bukan milik")) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to delete timeline event:", error);
    return NextResponse.json(
      { error: "Failed to delete timeline event" },
      { status: 500 },
    );
  }
}
