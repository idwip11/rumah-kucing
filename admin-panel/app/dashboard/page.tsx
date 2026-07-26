"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Cat,
  ShoppingCart,
  Package,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/ui/StatCard";
import { adminApi } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  function load() {
    setError("");
    setWarnings([]);
    adminApi
      .getDashboard()
      .then((data) => {
        setStats(data);
        if (data.warnings && data.warnings.length > 0) {
          setWarnings(data.warnings);
        }
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setError(
          msg === "Failed to fetch"
            ? "Gagal terhubung ke server. Periksa koneksi jaringan atau konfigurasi CORS."
            : msg,
        );
      });
  }

  useEffect(() => {
    load();
  }, []);

  const signupEntries = stats
    ? Object.entries(stats.signupsByDay).sort((a, b) =>
        a[0].localeCompare(b[0]),
      )
    : [];
  const maxSignup = signupEntries.reduce((m, [, v]) => Math.max(m, v), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              <p>{error}</p>
              <button
                onClick={load}
                className="mt-2 rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                Coba lagi
              </button>
            </div>
          )}

          {!error && warnings.length > 0 && (
            <div className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <p className="font-medium">Sebagian data tidak dapat dimuat:</p>
              <ul className="list-disc pl-5">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {!stats ? (
            <p className="text-sm text-gray-400">Memuat...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  label="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  accent="blue"
                />
                <StatCard
                  label="Total Cats"
                  value={stats.totalCats}
                  icon={Cat}
                  accent="purple"
                />
                <StatCard
                  label="Total Orders"
                  value={stats.totalOrders}
                  icon={ShoppingCart}
                  accent="orange"
                />
                <StatCard
                  label="Total Products"
                  value={stats.totalProducts}
                  icon={Package}
                  accent="green"
                />
                <StatCard
                  label="Timeline Events"
                  value={stats.totalTimelineEvents}
                  icon={CalendarDays}
                  accent="gray"
                />
                <StatCard
                  label="Estimasi Total Order"
                  value={formatRupiah(stats.totalRevenue)}
                  icon={Wallet}
                  accent="blue"
                />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg border bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-gray-700">
                    Pendaftaran User (30 Hari Terakhir)
                  </h3>
                  <div className="flex h-40 items-end gap-1">
                    {signupEntries.map(([date, count]) => (
                      <div
                        key={date}
                        className="flex flex-1 flex-col items-center justify-end"
                        title={`${date}: ${count}`}
                      >
                        <div
                          className="w-full rounded-t bg-blue-500"
                          style={{
                            height: `${maxSignup ? (count / maxSignup) * 100 : 0}%`,
                            minHeight: count > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-gray-700">
                    Order by Status
                  </h3>
                  <div className="space-y-3">
                    {stats.ordersByStatus.map((s) => (
                      <div
                        key={s.status}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">
                          {s.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {s.count}
                        </span>
                      </div>
                    ))}
                    {stats.ordersByStatus.length === 0 && (
                      <p className="text-sm text-gray-400">Belum ada order</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
