"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { Badge, orderStatusColor } from "@/components/ui/Badge";
import { adminApi } from "@/lib/api";
import type { AdminOrder } from "@/lib/types";

const STATUS_OPTIONS = ["", "Menunggu", "Dikonfirmasi", "Selesai", "Batal"];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const limit = 15;
  useEffect(() => {
    setError("");
    adminApi
      .getOrders({ page, limit, status: status || undefined })
      .then((res) => {
        setOrders(res.orders);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message));
  }, [page, status]);

  const columns: Column<AdminOrder>[] = [
    { key: "id", header: "ID", render: (o) => o.id.slice(0, 8) },
    { key: "customer", header: "Customer", render: (o) => o.customer },
    {
      key: "total",
      header: "Total",
      render: (o) => formatRupiah(o.total),
    },
    { key: "channel", header: "Channel", render: (o) => o.channel ?? "-" },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <Badge color={orderStatusColor(o.status)}>{o.status}</Badge>
      ),
    },
    {
      key: "id2",
      header: "",
      render: (o) => (
        <Link
          href={`/orders/${o.id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Detail
        </Link>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Orders" />
        <main className="flex-1 overflow-y-auto p-6">
          <PageHeader title="Daftar Orders" subtitle="Semua pesanan" />
          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="mb-4">
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "" ? "Semua Status" : s}
                </option>
              ))}
            </select>
          </div>
          <DataTable
            columns={columns}
            rows={orders}
            emptyMessage="Tidak ada order"
          />
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </main>
      </div>
    </div>
  );
}
