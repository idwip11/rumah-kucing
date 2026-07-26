import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildDashboardRecommendations,
  buildRecommendationSummary,
} from "@/lib/recommendations/dashboard-rules";
import {
  analyzeTimelineCareSignals,
  buildCareInsights,
} from "@/lib/recommendations/care-rules";
import { deriveCatProfile } from "@/lib/recommendations/profile";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const catId = request.nextUrl.searchParams.get("catId")?.trim();
    if (!catId) {
      return NextResponse.json(
        { error: "catId is required" },
        { status: 400 },
      );
    }

    const [cat, timelineEvents] = await Promise.all([
      prisma.cat.findFirst({
        where: { id: catId, userId: user.id },
        include: {
          breed: {
            include: { characteristics: true },
          },
        },
      }),
      prisma.timelineEvent.findMany({
        where: {
          catId,
          cat: { userId: user.id },
        },
        select: {
          id: true,
          title: true,
          eventDate: true,
          description: true,
          category: true,
          status: true,
        },
        orderBy: { eventDate: "desc" },
      }),
    ]);

    if (!cat) {
      return NextResponse.json(
        { error: "Cat profile not found" },
        { status: 404 },
      );
    }

    const profile = deriveCatProfile(cat);
    const signals = analyzeTimelineCareSignals(timelineEvents);
    const insights = buildCareInsights(profile, signals);

    return NextResponse.json(
      {
        cat: {
          id: profile.id,
          name: profile.name,
        },
        summary: buildRecommendationSummary(profile),
        cards: buildDashboardRecommendations(profile, insights),
        insights,
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Dashboard recommendation API error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard recommendations" },
      { status: 500 },
    );
  }
}
