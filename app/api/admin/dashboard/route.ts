import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// Explicit OPTIONS handler so the CORS preflight from the admin panel
// (origin http://localhost:3001) is always answered by a real route handler
// instead of relying on the dev server's route manifest (which could
// intermittently return 404 and surface as "Failed to fetch" in the browser).
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":
        process.env.ADMIN_PANEL_ORIGIN || "http://localhost:3001",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  // Each aggregation is isolated so a single failing query does NOT blank the
  // whole dashboard. Failed queries are reported individually in the response
  // and logged on the server with the query name that failed.
  const run = async (name: string, fn: () => Promise<unknown>) => {
    try {
      return { ok: true as const, name, value: await fn() };
    } catch (err) {
      console.error(`[dashboard] query failed: ${name}`, err);
      return { ok: false as const, name, error: String(err) };
    }
  };

  const [
    totalUsers,
    totalCats,
    totalOrders,
    totalProducts,
    totalTimelineEvents,
    totalRevenueAgg,
    ordersByStatus,
    recentUsers,
  ] = await Promise.all([
    run("user.count", () => prisma.user.count()),
    run("cat.count", () => prisma.cat.count()),
    run("order.count", () => prisma.order.count()),
    run("product.count", () => prisma.product.count()),
    run("timelineEvent.count", () => prisma.timelineEvent.count()),
    run("order.aggregate", () =>
      prisma.order.aggregate({ _sum: { total: true } }),
    ),
    run("order.groupBy", () =>
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ),
    run("user.recent", () =>
      prisma.user.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ),
  ]);

  const failed = [
    totalUsers,
    totalCats,
    totalOrders,
    totalProducts,
    totalTimelineEvents,
    totalRevenueAgg,
    ordersByStatus,
    recentUsers,
  ].filter((r) => !r.ok) as { name: string; error: string }[];

  const recentUserRows = recentUsers.ok
    ? (recentUsers.value as { createdAt: Date }[])
    : [];

  // Group recent user signups by day (last 30 days)
  const signupsByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    signupsByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const u of recentUserRows) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (key in signupsByDay) signupsByDay[key] += 1;
  }

  const revenueSum =
    totalRevenueAgg.ok && totalRevenueAgg.value
      ? (totalRevenueAgg.value as { _sum: { total: unknown } })._sum.total
      : null;

  const payload = {
    totalUsers: totalUsers.ok ? (totalUsers.value as number) : 0,
    totalCats: totalCats.ok ? (totalCats.value as number) : 0,
    totalOrders: totalOrders.ok ? (totalOrders.value as number) : 0,
    totalProducts: totalProducts.ok ? (totalProducts.value as number) : 0,
    totalTimelineEvents: totalTimelineEvents.ok
      ? (totalTimelineEvents.value as number)
      : 0,
    totalRevenue: revenueSum ? Number(revenueSum) : 0,
    ordersByStatus: ordersByStatus.ok
      ? (
          ordersByStatus.value as { status: string; _count: { _all: number } }[]
        ).map((o) => ({ status: o.status, count: o._count._all }))
      : [],
    signupsByDay,
    // If some queries failed we still return 200 with partial data plus a
    // `warnings` field describing exactly what failed (so it's never a silent
    // "Failed to fetch").
    ...(failed.length > 0
      ? { warnings: failed.map((f) => `Query gagal: ${f.name}`) }
      : {}),
  };

  return NextResponse.json(payload);
}
