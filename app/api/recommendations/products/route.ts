import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeTimelineCareSignals } from "@/lib/recommendations/care-rules";
import { buildTastePreferenceSignals } from "@/lib/recommendations/feedback-rules";
import { deriveCatProfile } from "@/lib/recommendations/profile";
import { rankProductsForCat } from "@/lib/recommendations/product-rules";
import type { RecommendationFeedbackResponse } from "@/lib/recommendations/types";
import { getCurrentUser } from "@/lib/session";
import { RecommendationType } from "@prisma/client";

export const dynamic = "force-dynamic";

function getLimit(value: string | null) {
  const parsed = Number(value ?? "6");
  if (!Number.isFinite(parsed)) return 6;
  return Math.min(24, Math.max(1, Math.floor(parsed)));
}

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

    const cat = await prisma.cat.findFirst({
      where: { id: catId, userId: user.id },
      include: {
        breed: {
          include: { characteristics: true },
        },
      },
    });

    if (!cat) {
      return NextResponse.json(
        { error: "Cat profile not found" },
        { status: 404 },
      );
    }

    const [products, timelineEvents, feedbackRecords] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { tags: true },
        orderBy: { createdAt: "desc" },
        take: 100,
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
    const feedbackByProductId = Object.fromEntries(
      feedbackRecords
        .filter(
          (
            feedback,
          ): feedback is typeof feedback & { productId: string } =>
            Boolean(feedback.productId),
        )
        .map((feedback) => [
          feedback.productId,
          feedback.response as RecommendationFeedbackResponse,
        ]),
    );
    const tastePreferences = buildTastePreferenceSignals(
      feedbackRecords.map((feedback) => ({
        response: feedback.response as RecommendationFeedbackResponse,
        product: feedback.product,
      })),
    );
    const limit = getLimit(request.nextUrl.searchParams.get("limit"));
    const ranked = rankProductsForCat(profile, products, careSignals, {
      feedbackByProductId,
      tastePreferences,
    })
      .filter(({ match }) => match.label !== "Tidak direkomendasikan")
      .slice(0, limit);

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
        },
        products: ranked.map(({ product, match }) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          priceIdr: Number(product.priceIdr),
          reason: product.reason,
          description: product.description,
          badge: product.badge,
          imageUrl: product.imageUrl,
          stock: product.stock,
          tags: (product.tags ?? []).map((tag) => tag.tag),
          feedback: feedbackByProductId[product.id] ?? null,
          match: {
            label: match.label,
            reasons: match.reasons,
            benefits: match.benefits,
            suitableFor: match.suitableFor,
            cautions: match.cautions,
            safetyWarning: match.safetyWarning,
          },
        })),
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Product recommendation API error:", error);
    return NextResponse.json(
      { error: "Failed to load product recommendations" },
      { status: 500 },
    );
  }
}
