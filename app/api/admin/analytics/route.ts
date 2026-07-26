import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      topProductsAgg,
      breedAgg,
      channelAgg,
      monthlyRevenueAgg,
      topUsersAgg,
    ] = await Promise.all([
      // Top 5 most purchased products (by quantity across order items)
      prisma.orderItem.groupBy({
        by: ["name"],
        _sum: { quantity: true },
        _count: { _all: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      // Breed distribution (cats grouped by breed)
      prisma.cat.groupBy({
        by: ["breedId"],
        _count: { _all: true },
        orderBy: { _count: { breedId: "desc" } },
        take: 10,
      }),
      // Order distribution by channel
      prisma.order.groupBy({
        by: ["channel"],
        _count: { _all: true },
      }),
      // Monthly revenue (last 6 months)
      prisma.order.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { total: true, createdAt: true },
      }),
      // Top 5 active users (most orders)
      prisma.order.groupBy({
        by: ["userId"],
        _count: { _all: true },
        orderBy: { _count: { userId: "desc" } },
        take: 5,
      }),
    ]);

    // Resolve breed names
    const breedIds = breedAgg
      .map((b) => b.breedId)
      .filter((id): id is string => !!id);
    const breeds = breedIds.length
      ? await prisma.catBreed.findMany({
          where: { id: { in: breedIds } },
          select: { id: true, name: true },
        })
      : [];
    const breedNameMap = new Map(breeds.map((b) => [b.id, b.name]));

    const breedDistribution = breedAgg.map((b) => ({
      breed: b.breedId ? (breedNameMap.get(b.breedId) ?? "Unknown") : "Unknown",
      count: b._count._all,
    }));

    // Monthly revenue aggregation
    const monthlyRevenue: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyRevenue[
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      ] = 0;
    }
    for (const o of monthlyRevenueAgg) {
      const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyRevenue) {
        monthlyRevenue[key] += Number(o.total);
      }
    }

    // Resolve top user names
    const userIds = topUsersAgg
      .map((u) => u.userId)
      .filter((id): id is string => !!id);
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true },
        })
      : [];
    const userNameMap = new Map(users.map((u) => [u.id, u.name]));

    const topUsers = topUsersAgg.map((u) => ({
      user: u.userId ? (userNameMap.get(u.userId) ?? "Guest") : "Guest",
      orderCount: u._count._all,
    }));

    return NextResponse.json({
      topProducts: topProductsAgg.map((p) => ({
        name: p.name,
        quantity: p._sum.quantity ?? 0,
        orderCount: p._count._all,
      })),
      breedDistribution,
      channelDistribution: channelAgg.map((c) => ({
        channel: c.channel ?? "Unknown",
        count: c._count._all,
      })),
      monthlyRevenue: Object.entries(monthlyRevenue).map(
        ([month, revenue]) => ({ month, revenue }),
      ),
      topUsers,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
