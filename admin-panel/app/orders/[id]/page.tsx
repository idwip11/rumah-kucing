"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, orderStatusColor } from "@/components/ui/Badge";
import { adminApi } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";

const STATUS_OPTIONS = ["Menunggu", "Dikonfirmasi", "Selesai", "Batal"];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getOrder(id)
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const handleUpdate = async () => {
    if (!order || status === order.status) return;
    setSaving(true);
    setError("");
    try {
      await adminApi.updateOrderStatus(order.id, status);
      const updated = await adminApi.getOrder(order.id);
      setOrder(updated);
      setStatus(updated.status);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Order Detail" />
        <main className="flex-1 overflow-y-auto p-6">
          <Link
            href="/orders"
            className="mb-4 inline-block text-sm text-blue-600 hover:underline"
          >
            &larr; Kembali ke Orders
          </Link>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {!order ? (
            <p className="text-sm text-gray-400">Memuat...</p>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString("id-ID")}
                    </p>
                    {order.customer && (
                      <p className="text-sm text-gray-500">
                        Customer: {order.customer.name} ({order.customer.email})
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Channel: {order.channel ?? "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatRupiah(order.total)}
                    </p>
                    <Badge color={orderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleUpdate}
                    disabled={saving || status === order.status}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Update Status"}
                  </button>
                </div>
              </div>

              <div>
                <PageHeader title="Items" />
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {formatRupiah(item.price)} &times; {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatRupiah(item.subtotal)}
                      </p>
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
