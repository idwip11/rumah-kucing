"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminApi } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const limit = 15;
  useEffect(() => {
    setError("");
    adminApi
      .getUsers({ page, limit, search })
      .then((res) => {
        setUsers(res.users);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message));
  }, [page, search]);

  const columns: Column<AdminUser>[] = [
    { key: "name", header: "Nama" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telepon", render: (u) => u.phone ?? "-" },
    {
      key: "catCount",
      header: "Kucing",
      render: (u) => <Badge color="purple">{u.catCount}</Badge>,
    },
    {
      key: "orderCount",
      header: "Order",
      render: (u) => <Badge color="orange">{u.orderCount}</Badge>,
    },
    {
      key: "id",
      header: "",
      render: (u) => (
        <Link
          href={`/users/${u.id}`}
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
        <Header title="Users" />
        <main className="flex-1 overflow-y-auto p-6">
          <PageHeader
            title="Daftar Users"
            subtitle="Semua pengguna terdaftar"
          />
          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full max-w-sm rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <DataTable
            columns={columns}
            rows={users}
            emptyMessage="Tidak ada user"
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
