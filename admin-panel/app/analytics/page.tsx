"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { adminApi } from "@/lib/api";
import type { Analytics } from "@/lib/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function BarRow({
  label,
  value,
  max,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 truncate text-sm text-gray-600">
        {label}
      </span>
      <div className="h-5 flex-1 overflow-hidden rounded bg-gray-100">
        <div
          className="h-full rounded bg-blue-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-sm font-medium text-gray-900">
        {value.toLocaleString("id-ID")}
        {suffix}
      </span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const maxProduct = data
    ? Math.max(...data.topProducts.map((p) => p.quantity), 0)
    : 0;
  const maxBreed = data
    ? Math.max(...data.breedDistribution.map((b) => b.count), 0)
    : 0;
  const maxChannel = data
    ? Math.max(...data.channelDistribution.map((c) => c.count), 0)
    : 0;
  const maxUser = data
    ? Math.max(...data.topUsers.map((u) => u.orderCount), 0)
    : 0;
  const maxRevenue = data
    ? Math.max(...data.monthlyRevenue.map((m) => m.revenue), 0)
    : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Analytics" />
        <main className="flex-1 overflow-y-auto p-6">
          <PageHeader title="Analytics" subtitle="Insight platform" />
          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {!data ? (
            <p className="text-sm text-gray-400">Memuat...</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">
                  Top 5 Produk Terlaris
                </h3>
                <div className="space-y-3">
                  {data.topProducts.map((p) => (
                    <BarRow
                      key={p.name}
                      label={p.name}
                      value={p.quantity}
                      max={maxProduct}
                      suffix=" pcs"
                    />
                  ))}
                  {data.topProducts.length === 0 && (
                    <p className="text-sm text-gray-400">Belum ada data</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">
                  Distribusi Ras Kucing
                </h3>
                <div className="space-y-3">
                  {data.breedDistribution.map((b) => (
                    <BarRow
                      key={b.breed}
                      label={b.breed}
                      value={b.count}
                      max={maxBreed}
                    />
                  ))}
                  {data.breedDistribution.length === 0 && (
                    <p className="text-sm text-gray-400">Belum ada data</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">
                  Distribusi Channel Order
                </h3>
                <div className="space-y-3">
                  {data.channelDistribution.map((c) => (
                    <BarRow
                      key={c.channel}
                      label={c.channel}
                      value={c.count}
                      max={maxChannel}
                    />
                  ))}
                  {data.channelDistribution.length === 0 && (
                    <p className="text-sm text-gray-400">Belum ada data</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">
                  Top 5 User Paling Aktif
                </h3>
                <div className="space-y-3">
                  {data.topUsers.map((u) => (
                    <BarRow
                      key={u.user}
                      label={u.user}
                      value={u.orderCount}
                      max={maxUser}
                      suffix=" order"
                    />
                  ))}
                  {data.topUsers.length === 0 && (
                    <p className="text-sm text-gray-400">Belum ada data</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-white p-5 shadow-sm lg:col-span-2">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">
                  Revenue 6 Bulan Terakhir
                </h3>
                <div className="flex h-48 items-end gap-2">
                  {data.monthlyRevenue.map((m) => (
                    <div
                      key={m.month}
                      className="flex flex-1 flex-col items-center justify-end"
                      title={`${m.month}: ${formatRupiah(m.revenue)}`}
                    >
                      <span className="mb-1 text-xs text-gray-500">
                        {m.revenue > 0
                          ? formatRupiah(m.revenue).replace("Rp", "")
                          : ""}
                      </span>
                      <div
                        className="w-full rounded-t bg-green-500"
                        style={{
                          height: `${maxRevenue ? (m.revenue / maxRevenue) * 100 : 0}%`,
                          minHeight: m.revenue > 0 ? "4px" : "0",
                        }}
                      />
                      <span className="mt-1 text-[10px] text-gray-400">
                        {m.month.slice(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
