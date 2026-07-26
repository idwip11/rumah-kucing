import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeTimelineCareSignals } from "@/lib/recommendations/care-rules";
import { buildTastePreferenceSignals } from "@/lib/recommendations/feedback-rules";
import { deriveCatProfile } from "@/lib/recommendations/profile";
import { evaluateProductMatch } from "@/lib/recommendations/product-rules";
import type { RecommendationFeedbackResponse } from "@/lib/recommendations/types";
import { getCurrentUser } from "@/lib/session";
import { RecommendationType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } },
) {
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

    const [cat, product] = await Promise.all([
      prisma.cat.findFirst({
        where: { id: catId, userId: user.id },
        include: {
          breed: {
            include: { characteristics: true },
          },
        },
      }),
      prisma.product.findUnique({
        where: { id: params.productId },
        include: { tags: true },
      }),
    ]);

    if (!cat) {
      return NextResponse.json(
        { error: "Cat profile not found" },
        { status: 404 },
      );
    }
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    const [timelineEvents, feedbackRecords] = await Promise.all([
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
      prisma.recommendationFeedback.findMany({
        where: {
          userId: user.id,
          catId,
          recommendationType: RecommendationType.product,
          productId: { not: null },
        },
        include: {
          product: {
            include: { tags: true },
          },
        },
      }),
    ]);

    const profile = deriveCatProfile(cat);
    const careSignals = analyzeTimelineCareSignals(timelineEvents);
    const directFeedback = feedbackRecords.find(
      (feedback) => feedback.productId === product.id,
    );
    const tastePreferences = buildTastePreferenceSignals(
      feedbackRecords.map((feedback) => ({
        response: feedback.response as RecommendationFeedbackResponse,
        product: feedback.product,
      })),
    );
    const match = evaluateProductMatch(profile, product, careSignals, {
      directResponse:
        (directFeedback?.response as RecommendationFeedbackResponse) ?? null,
      tastePreferences,
    });

    return NextResponse.json(
      {
        cat: {
          id: profile.id,
          name: profile.name,
        },
        profile: {
          lifeStage: profile.lifeStage,
          breedName: profile.breedName,
          coatLength: profile.coatLength,
          isSterilized: profile.isSterilized,
          lifestyle: profile.lifestyle,
          weightKg: profile.weightKg,
          dietaryAvoidances: profile.dietaryAvoidances,
        },
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          reason: product.reason,
          description: product.description,
          tags: product.tags.map((tag) => tag.tag),
        },
        feedback: directFeedback
          ? {
              id: directFeedback.id,
              response: directFeedback.response,
              note: directFeedback.note,
              updatedAt: directFeedback.updatedAt.toISOString(),
            }
          : null,
        match: {
          label: match.label,
          reasons: match.reasons,
          benefits: match.benefits,
          suitableFor: match.suitableFor,
          cautions: match.cautions,
          safetyWarning: match.safetyWarning,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Product recommendation detail API error:", error);
    return NextResponse.json(
      { error: "Failed to load product recommendation explanation" },
      { status: 500 },
    );
  }
}
