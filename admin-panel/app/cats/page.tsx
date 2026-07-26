"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { adminApi } from "@/lib/api";
import type { AdminCat } from "@/lib/types";

export default function CatsPage() {
  const [cats, setCats] = useState<AdminCat[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const limit = 15;
  useEffect(() => {
    setError("");
    adminApi
      .getCats({ page, limit })
      .then((res) => {
        setCats(res.cats);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message));
  }, [page]);

  const columns: Column<AdminCat>[] = [
    { key: "name", header: "Nama" },
    { key: "breed", header: "Ras", render: (c) => c.breed ?? "Campuran" },
    {
      key: "gender",
      header: "Gender",
      render: (c) => c.gender ?? "-",
    },
    {
      key: "estimatedDateOfBirth",
      header: "Tgl Lahir",
      render: (c) => c.estimatedDateOfBirth ?? "-",
    },
    {
      key: "sterilized",
      header: "Steril",
      render: (c) =>
        c.sterilized ? (
          <Badge color="green">Ya</Badge>
        ) : (
          <Badge color="gray">Tidak</Badge>
        ),
    },
    { key: "owner", header: "Pemilik", render: (c) => c.owner ?? "-" },
    {
      key: "id",
      header: "",
      render: (c) => (
        <Link
          href={`/cats/${c.id}`}
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
        <Header title="Cats" />
        <main className="flex-1 overflow-y-auto p-6">
          <PageHeader title="Daftar Cats" subtitle="Semua kucing terdaftar" />
          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <DataTable
            columns={columns}
            rows={cats}
            emptyMessage="Tidak ada kucing"
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
