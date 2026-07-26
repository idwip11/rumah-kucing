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

// GET - Get single article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult && !authResult.ok) return authResult;

    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        breed: { select: { name: true } },
        sections: { orderBy: { sortOrder: "asc" } },
        takeaways: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Article detail failed:", error);
    return NextResponse.json(
      { error: articleErrorMessage(error, "Gagal memuat artikel") },
      { status: 500 },
    );
  }
}

// PATCH - Update article
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult && !authResult.ok) return authResult;

    const { id } = await params;
    const body = await request.json();
    const slug = body.slug !== undefined ? cleanString(body.slug) : undefined;
    const title =
      body.title !== undefined ? cleanString(body.title) : undefined;

    if (body.slug !== undefined && !slug) {
      return NextResponse.json(
        { error: "Slug wajib diisi" },
        { status: 400 },
      );
    }

    if (body.title !== undefined && !title) {
      return NextResponse.json(
        { error: "Judul wajib diisi" },
        { status: 400 },
      );
    }

    const sections =
      body.sections !== undefined ? cleanSections(body.sections) : undefined;
    const validationError = validateArticleFields({
      slug,
      title,
      category:
        body.category !== undefined ? cleanString(body.category) : undefined,
      readTime:
        body.readTime !== undefined ? cleanString(body.readTime) : undefined,
      author: body.author !== undefined ? cleanString(body.author) : undefined,
      sourceUrl:
        body.sourceUrl !== undefined ? cleanString(body.sourceUrl) : undefined,
      sections,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Check slug uniqueness (excluding current article)
    if (slug) {
      const existing = await prisma.article.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Slug sudah digunakan" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: Record<string, string | null> = {};
      if (slug != null) updateData.slug = slug.toLowerCase();
      if (title !== undefined) updateData.title = title;
      if (body.category !== undefined)
        updateData.category = cleanString(body.category);
      if (body.readTime !== undefined)
        updateData.readTime = cleanString(body.readTime);
      if (body.summary !== undefined)
        updateData.summary = cleanString(body.summary);
      if (body.heroImage !== undefined)
        updateData.heroImage = cleanString(body.heroImage);
      if (body.vetWarning !== undefined)
        updateData.vetWarning = cleanString(body.vetWarning);
      if (body.breedId !== undefined)
        updateData.breedId = cleanString(body.breedId);
      if (body.author !== undefined)
        updateData.author = cleanString(body.author);
      if (body.sourceUrl !== undefined)
        updateData.sourceUrl = cleanString(body.sourceUrl);

      await tx.article.update({
        where: { id },
        data: updateData,
      });

      if (body.sections !== undefined) {
        await tx.articleSection.deleteMany({ where: { articleId: id } });
        if (sections?.length) {
          await tx.articleSection.createMany({
            data: sections.map((section) => ({ ...section, articleId: id })),
          });
        }
      }

      if (body.takeaways !== undefined) {
        const takeaways = cleanTakeaways(body.takeaways);
        await tx.articleTakeaway.deleteMany({ where: { articleId: id } });
        if (takeaways.length) {
          await tx.articleTakeaway.createMany({
            data: takeaways.map((takeaway) => ({ ...takeaway, articleId: id })),
          });
        }
      }

      return tx.article.findUnique({
        where: { id },
        include: {
          breed: { select: { name: true } },
          sections: { orderBy: { sortOrder: "asc" } },
          takeaways: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Article update failed:", error);
    return NextResponse.json(
      { error: articleErrorMessage(error, "Gagal memperbarui artikel") },
      { status: 500 },
    );
  }
}

// DELETE - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult && !authResult.ok) return authResult;

    const { id } = await params;

    await prisma.article.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Article delete failed:", error);
    return NextResponse.json(
      { error: articleErrorMessage(error, "Gagal menghapus artikel") },
      { status: 500 },
    );
  }
}
