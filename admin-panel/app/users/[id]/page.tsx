"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { adminApi } from "@/lib/api";
import type { UserDetail } from "@/lib/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function UserDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .getUser(id)
      .then(setUser)
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="User Detail" />
        <main className="flex-1 overflow-y-auto p-6">
          <Link
            href="/users"
            className="mb-4 inline-block text-sm text-blue-600 hover:underline"
          >
            &larr; Kembali ke Users
          </Link>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {!user ? (
            <p className="text-sm text-gray-400">Memuat...</p>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Telepon: {user.phone ?? "-"}
                </p>
                <p className="text-sm text-gray-500">
                  Bergabung:{" "}
                  {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>

              <div>
                <PageHeader title="Kucing" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {user.cats.map((cat) => (
                    <div
                      key={cat.id}
                      className="rounded-lg border bg-white p-4 shadow-sm"
                    >
                      <p className="font-semibold text-gray-800">{cat.name}</p>
                      <p className="text-sm text-gray-500">
                        {cat.breed ?? "Ras campuran"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {cat.gender ?? "-"} &middot; {cat.weightKg ?? "-"} kg
                      </p>
                      {cat.estimatedDateOfBirth && (
                        <p className="text-xs text-gray-400">
                          Tgl Lahir:{" "}
                          {new Date(
                            cat.estimatedDateOfBirth,
                          ).toLocaleDateString("id-ID")}
                        </p>
                      )}
                      {cat.sterilized && (
                        <Badge color="green" className="mt-2">
                          Steril
                        </Badge>
                      )}
                    </div>
                  ))}
                  {user.cats.length === 0 && (
                    <p className="text-sm text-gray-400">Belum punya kucing</p>
                  )}
                </div>
              </div>

              <div>
                <PageHeader title="Order" />
                <div className="space-y-2">
                  {user.orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {formatRupiah(o.total)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(o.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <Badge color="blue">{o.status}</Badge>
                    </div>
                  ))}
                  {user.orders.length === 0 && (
                    <p className="text-sm text-gray-400">Belum ada order</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
