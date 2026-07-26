import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  isBreedFavoriteListType,
  type BreedFavoriteListType,
} from "@/lib/catpedia/favorites";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" };

const favoriteSelect = {
  id: true,
  listType: true,
  createdAt: true,
  breed: {
    select: {
      id: true,
      slug: true,
      name: true,
      origin: true,
      imageSrc: true,
      shortDescription: true,
      profileSummary: true,
    },
  },
} as const;

async function authenticatedUser() {
  return getCurrentUser();
}

export async function GET() {
  try {
    const user = await authenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Silakan login untuk melihat Ras Pilihanku." },
        { status: 401, headers: noStoreHeaders },
      );
    }

    const favorites = await prisma.breedFavorite.findMany({
      where: {
        userId: user.id,
        breed: { isPublished: true },
      },
      orderBy: { createdAt: "desc" },
      select: favoriteSelect,
    });

    return NextResponse.json(
      { favorites },
      { status: 200, headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Failed to load breed favorites:", error);
    return NextResponse.json(
      { error: "Gagal memuat Ras Pilihanku." },
      { status: 500, headers: noStoreHeaders },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Silakan login untuk menyimpan ras." },
        { status: 401, headers: noStoreHeaders },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      breedId?: unknown;
      listType?: unknown;
    } | null;
    const breedId =
      typeof body?.breedId === "string" ? body.breedId.trim() : "";

    if (!breedId || !isBreedFavoriteListType(body?.listType)) {
      return NextResponse.json(
        { error: "breedId dan jenis daftar yang valid wajib diisi." },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const breed = await prisma.catBreed.findFirst({
      where: { id: breedId, isPublished: true },
      select: { id: true },
    });
    if (!breed) {
      return NextResponse.json(
        { error: "Profil ras tidak ditemukan." },
        { status: 404, headers: noStoreHeaders },
      );
    }

    const listType: BreedFavoriteListType = body.listType;
    const favorite = await prisma.breedFavorite.upsert({
      where: {
        userId_breedId_listType: {
          userId: user.id,
          breedId,
          listType,
        },
      },
      create: {
        userId: user.id,
        breedId,
        listType,
      },
      update: {},
      select: favoriteSelect,
    });

    return NextResponse.json(
      { favorite },
      { status: 201, headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Failed to save breed favorite:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan ras ke daftar." },
      { status: 500, headers: noStoreHeaders },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Silakan login untuk mengubah daftar." },
        { status: 401, headers: noStoreHeaders },
      );
    }

    const breedId = request.nextUrl.searchParams.get("breedId")?.trim() ?? "";
    const listTypeValue = request.nextUrl.searchParams.get("listType");

    if (!breedId) {
      return NextResponse.json(
        { error: "breedId wajib diisi." },
        { status: 400, headers: noStoreHeaders },
      );
    }
    if (listTypeValue && !isBreedFavoriteListType(listTypeValue)) {
      return NextResponse.json(
        { error: "Jenis daftar tidak valid." },
        { status: 400, headers: noStoreHeaders },
      );
    }

    const result = await prisma.breedFavorite.deleteMany({
      where: {
        userId: user.id,
        breedId,
        ...(listTypeValue
          ? { listType: listTypeValue as BreedFavoriteListType }
          : {}),
      },
    });

    return NextResponse.json(
      { deleted: result.count },
      { status: 200, headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Failed to remove breed favorite:", error);
    return NextResponse.json(
      { error: "Gagal menghapus ras dari daftar." },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
