import { NextRequest, NextResponse } from "next/server";
import {
  RecommendationResponse,
  RecommendationType,
} from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const FeedbackSchema = z.object({
  catId: z.string().uuid(),
  productId: z.string().uuid(),
  recommendationType: z
    .enum(["product", "article", "care_action"])
    .default("product"),
  response: z.enum([
    "liked",
    "disliked",
    "not_tried",
    "caused_issue",
    "saved",
  ]),
  note: z.string().trim().max(1000).optional(),
});

function serializeFeedback(feedback: {
  id: string;
  catId: string;
  productId: string | null;
  recommendationType: RecommendationType;
  response: RecommendationResponse;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...feedback,
    createdAt: feedback.createdAt.toISOString(),
    updatedAt: feedback.updatedAt.toISOString(),
  };
}

async function verifyOwnership(userId: string, catId: string) {
  return prisma.cat.findFirst({
    where: { id: catId, userId },
    select: { id: true },
  });
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const catId = request.nextUrl.searchParams.get("catId")?.trim();
    const productId = request.nextUrl.searchParams.get("productId")?.trim();
    if (!catId || !productId) {
      return NextResponse.json(
        { error: "catId and productId are required" },
        { status: 400 },
      );
    }

    const cat = await verifyOwnership(user.id, catId);
    if (!cat) {
      return NextResponse.json(
        { error: "Cat profile not found" },
        { status: 404 },
      );
    }

    const feedback = await prisma.recommendationFeedback.findFirst({
      where: {
        userId: user.id,
        catId,
        productId,
        recommendationType: RecommendationType.product,
      },
    });

    return NextResponse.json(
      {
        feedback: feedback ? serializeFeedback(feedback) : null,
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Recommendation feedback GET error:", error);
    return NextResponse.json(
      { error: "Failed to load recommendation feedback" },
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

    const parsed = FeedbackSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { catId, productId, note } = parsed.data;
    const recommendationType =
      parsed.data.recommendationType as RecommendationType;
    const response = parsed.data.response as RecommendationResponse;

    const [cat, product] = await Promise.all([
      verifyOwnership(user.id, catId),
      prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
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

    const feedback = await prisma.recommendationFeedback.upsert({
      where: {
        userId_catId_productId_recommendationType: {
          userId: user.id,
          catId,
          productId,
          recommendationType,
        },
      },
      create: {
        userId: user.id,
        catId,
        productId,
        recommendationType,
        response,
        note: note || null,
      },
      update: {
        response,
        note: note || null,
      },
    });

    return NextResponse.json(
      { feedback: serializeFeedback(feedback) },
      { status: 200 },
    );
  } catch (error) {
    console.error("Recommendation feedback POST error:", error);
    return NextResponse.json(
      { error: "Failed to save recommendation feedback" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const catId = request.nextUrl.searchParams.get("catId")?.trim();
    const productId = request.nextUrl.searchParams.get("productId")?.trim();
    if (!catId || !productId) {
      return NextResponse.json(
        { error: "catId and productId are required" },
        { status: 400 },
      );
    }

    const cat = await verifyOwnership(user.id, catId);
    if (!cat) {
      return NextResponse.json(
        { error: "Cat profile not found" },
        { status: 404 },
      );
    }

    await prisma.recommendationFeedback.deleteMany({
      where: {
        userId: user.id,
        catId,
        productId,
        recommendationType: RecommendationType.product,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recommendation feedback DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete recommendation feedback" },
      { status: 500 },
    );
  }
}
