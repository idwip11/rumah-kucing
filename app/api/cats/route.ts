import { NextResponse } from "next/server";
import { addCat, getCats, updateCat } from "@/app/actions/cats";
import { getCurrentUser } from "@/lib/session";
import { computeAgeLabel } from "@/lib/age";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cats = await getCats(user.id);

    // Map cats to include computed age from estimatedDateOfBirth
    const mapped = cats.map((cat: any) => ({
      ...cat,
      ageLabel: cat.estimatedDateOfBirth
        ? computeAgeLabel(cat.estimatedDateOfBirth)
        : (cat.ageLabel ?? ""),
      estimatedDateOfBirth: cat.estimatedDateOfBirth
        ? cat.estimatedDateOfBirth instanceof Date
          ? cat.estimatedDateOfBirth.toISOString().split("T")[0]
          : cat.estimatedDateOfBirth
        : null,
    }));

    return NextResponse.json(mapped, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get cats" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const cat = await addCat({ ...body, userId: user.id });
    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add cat" },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { catId, ...data } = body;

    if (!catId) {
      return NextResponse.json({ error: "catId is required" }, { status: 400 });
    }

    const cat = await updateCat(catId, user.id, data);
    return NextResponse.json(cat);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update cat",
      },
      { status: 400 },
    );
  }
}
