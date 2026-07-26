import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function adminCorsHeaders() {
  return {
    "Access-Control-Allow-Origin":
      process.env.ADMIN_PANEL_ORIGIN || "http://localhost:3001",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: adminCorsHeaders(),
  });
}

function cleanString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanSections(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((section, index) => ({
      heading: cleanString(section?.heading),
      body: cleanString(section?.body),
      sortOrder:
        typeof section?.sortOrder === "number" ? section.sortOrder : index,
    }))
    .filter((section) => section.heading && section.body)
    .map((section) => ({
      heading: section.heading!,
      body: section.body!,
      sortOrder: section.sortOrder,
    }));
}

function cleanTakeaways(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((takeaway, index) => ({
      point: cleanString(takeaway?.point),
      sortOrder:
        typeof takeaway?.sortOrder === "number" ? takeaway.sortOrder : index,
    }))
    .filter((takeaway) => takeaway.point)
    .map((takeaway) => ({
      point: takeaway.point!,
      sortOrder: takeaway.sortOrder,
    }));
}

function articleErrorMessage(error: unknown, fallback: string) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  const message = error instanceof Error ? error.message : fallback;

  if (code === "P2002") return "Slug sudah digunakan";
  if (code === "P2003") return "Breed yang dipilih tidak ditemukan";
  if (code === "P2022") {
    return "Skema database artikel belum sinkron. Jalankan migration Prisma terbaru, lalu coba lagi.";
  }

  return process.env.NODE_ENV === "production" ? fallback : message;
}

function validateArticleFields(input: {
  slug?: string | null;
  title?: string | null;
  category?: string | null;
  readTime?: string | null;
  author?: string | null;
  sourceUrl?: string | null;
  sections?: { heading: string }[];
}) {
  const fields = [
    { label: "Slug", value: input.slug, max: 160 },
    { label: "Judul", value: input.title, max: 255 },
    { label: "Kategori", value: input.category, max: 60 },
    { label: "Waktu baca", value: input.readTime, max: 20 },
    { label: "Author / sumber", value: input.author, max: 120 },
    { label: "URL sumber", value: input.sourceUrl, max: 500 },
  ];

  const tooLong = fields.find(
    (field) => field.value && field.value.length > field.max,
  );
  if (tooLong) {
    return `${tooLong.label} maksimal ${tooLong.max} karakter`;
  }

  const longSection = input.sections?.find(
    (section) => section.heading.length > 160,
  );
  if (longSection) return "Heading section maksimal 160 karakter";

  return null;
}

// GET - List articles
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult && !authResult.ok) return authResult;

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "15", 10)),
    );
    const category = cleanString(searchParams.get("category")) ?? undefined;

    const where = {
      ...(category ? { category } : {}),
    };

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          breed: { select: { name: true } },
          sections: { orderBy: { sortOrder: "asc" } },
          takeaways: { orderBy: { sortOrder: "asc" } },
        },
      }),
    ]);

    return NextResponse.json({
      articles,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Article list failed:", error);
    return NextResponse.json(
      { error: articleErrorMessage(error, "Gagal memuat artikel") },
      { status: 500 },
    );
  }
}

// POST - Create article
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult && !authResult.ok) return authResult;

    const body = await request.json();
    const slug = cleanString(body.slug)?.toLowerCase();
    const title = cleanString(body.title);
    const sections = cleanSections(body.sections);
    const takeaways = cleanTakeaways(body.takeaways);
    const category = cleanString(body.category);
    const readTime = cleanString(body.readTime);
    const author = cleanString(body.author);
    const sourceUrl = cleanString(body.sourceUrl);

    if (!slug || !title) {
      return NextResponse.json(
        { error: "Slug dan judul wajib diisi" },
        { status: 400 },
      );
    }

    const validationError = validateArticleFields({
      slug,
      title,
      category,
      readTime,
      author,
      sourceUrl,
      sections,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug sudah digunakan" },
        { status: 409 },
      );
    }

    const article = await prisma.article.create({
      data: {
        slug,
        title,
        category,
        readTime,
        summary: cleanString(body.summary),
        heroImage: cleanString(body.heroImage),
        vetWarning: cleanString(body.vetWarning),
        breedId: cleanString(body.breedId),
        author,
        sourceUrl,
        sections: sections.length
          ? {
              create: sections,
            }
          : undefined,
        takeaways: takeaways.length
          ? {
              create: takeaways,
            }
          : undefined,
      },
      include: {
        breed: { select: { name: true } },
        sections: { orderBy: { sortOrder: "asc" } },
        takeaways: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Article creation failed:", error);
    return NextResponse.json(
      { error: articleErrorMessage(error, "Gagal membuat artikel") },
      { status: 500 },
    );
  }
}
