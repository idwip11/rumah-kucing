import { NextRequest, NextResponse } from "next/server";
import { getLatestArticlePreviews } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "8");
    const articles = await getLatestArticlePreviews(limit);

    return NextResponse.json({
      articles: articles.map((article) => ({
        ...article,
        updatedAt: article.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to load articles:", error);
    return NextResponse.json(
      { error: "Gagal memuat artikel" },
      { status: 500 },
    );
  }
}
