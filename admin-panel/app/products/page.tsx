"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { adminApi } from "@/lib/api";
import type { AdminProduct, ProductInput } from "@/lib/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const TAG_ALIASES: Record<string, string> = {
  dryfood: "dry food",
  wetfood: "wet food",
};

function normalizeProductTag(value: unknown) {
  const tag = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  return TAG_ALIASES[tag] ?? tag;
}

function normalizeProductTags(values: unknown[]) {
  const seen = new Set<string>();
  return values
    .map(normalizeProductTag)
    .filter(Boolean)
    .filter((tag) => {
      if (seen.has(tag)) return false;
      seen.add(tag);
      return true;
    });
}

function displayProductTag(value: string) {
  return normalizeProductTag(value)
    .split(" ")
    .map((word) =>
      word
        .split("/")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("/"),
    )
    .join(" ");
}

interface FormState {
  name: string;
  category: string;
  priceIdr: string;
  reason: string;
  description: string;
  badge: string;
  imageUrl: string;
  stock: string;
  isActive: boolean;
  tags: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "",
  priceIdr: "",
  reason: "",
  description: "",
  badge: "",
  imageUrl: "",
  stock: "",
  isActive: true,
  tags: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 15;

  // Sort state
  const [sortBy, setSortBy] = useState<string>(""); // "", "name-asc", "name-desc", "price-asc", "price-desc"

  // Sorted products
  const [sortedProducts, setSortedProducts] = useState<AdminProduct[]>([]);

  // Apply sorting whenever products or sortBy changes
  useEffect(() => {
    if (!sortBy) {
      setSortedProducts(products);
      return;
    }

    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.priceIdr - b.priceIdr;
        case "price-desc":
          return b.priceIdr - a.priceIdr;
        default:
          return 0;
      }
    });

    setSortedProducts(sorted);
  }, [products, sortBy]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setError("");
    setLoading(true);
    adminApi
      .getProducts({ page, limit })
      .then((res) => {
        setProducts(res.products);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(p: AdminProduct) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category ?? "",
      priceIdr: String(p.priceIdr),
      reason: p.reason ?? "",
      description: p.description ?? "",
      badge: p.badge ?? "",
      imageUrl: p.imageUrl ?? "",
      stock: p.stock != null ? String(p.stock) : "",
      isActive: p.isActive,
      tags: p.tags.join(", "),
    });
    setFormError("");
    setModalOpen(true);
  }

  const CUSTOMER_ORIGIN =
    process.env.NEXT_PUBLIC_CUSTOMER_API_URL || "http://localhost:3000";

  function resolveImageUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${CUSTOMER_ORIGIN}${url}`;
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminApi.uploadProductImage(file);
      setForm({ ...form, imageUrl: url });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Gagal mengunggah gambar",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const payload: ProductInput = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      priceIdr: Number(form.priceIdr),
      reason: form.reason.trim() || null,
      description: form.description.trim() || null,
      badge: form.badge.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      stock: form.stock.trim() === "" ? null : Number(form.stock),
      isActive: form.isActive,
      tags: normalizeProductTags(form.tags.split(",")),
    };

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: AdminProduct) {
    if (
      !confirm(`Hapus produk "${p.name}"? Tindakan ini tidak dapat dibatalkan.`)
    ) {
      return;
    }
    setError("");
    try {
      await adminApi.deleteProduct(p.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const columns: Column<AdminProduct>[] = [
    { key: "name", header: "Nama" },
    { key: "category", header: "Kategori", render: (p) => p.category ?? "-" },
    {
      key: "priceIdr",
      header: "Harga",
      render: (p) => formatRupiah(p.priceIdr),
    },
    { key: "stock", header: "Stok", render: (p) => p.stock ?? "-" },
    {
      key: "isActive",
      header: "Status",
      render: (p) =>
        p.isActive ? (
          <Badge color="green">Aktif</Badge>
        ) : (
          <Badge color="gray">Nonaktif</Badge>
        ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.tags.map((t) => (
            <Badge key={t} color="blue">
              {displayProductTag(t)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (p) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(p)}
            className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(p)}
            className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Products" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <PageHeader title="Daftar Products" subtitle="Kelola produk" />
            <button
              onClick={openCreate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              + Tambah Produk
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Sort Controls */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Urutkan:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Default (Terbaru)</option>
                <option value="name-asc">Nama (A-Z)</option>
                <option value="name-desc">Nama (Z-A)</option>
                <option value="price-asc">Harga (Rendah ke Tinggi)</option>
                <option value="price-desc">Harga (Tinggi ke Rendah)</option>
              </select>
            </div>
            {sortBy && (
              <button
                onClick={() => setSortBy("")}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Reset
              </button>
            )}
          </div>

          <DataTable
            columns={columns}
            rows={sortedProducts}
            emptyMessage={loading ? "Memuat..." : "Tidak ada produk"}
          />
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {editingId ? "Edit Produk" : "Tambah Produk"}
            </h2>

            {formError && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </p>
            )}

            <div className="space-y-3">
              <Field label="Nama Produk *">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Contoh: Royal Canin Kitten"
                />
              </Field>

              <Field label="Kategori">
                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="input"
                  placeholder="Contoh: Makanan"
                />
              </Field>

              <Field label="Harga (IDR) *">
                <input
                  required
                  type="number"
                  min="0"
                  value={form.priceIdr}
                  onChange={(e) =>
                    setForm({ ...form, priceIdr: e.target.value })
                  }
                  className="input"
                  placeholder="Contoh: 150000"
                />
              </Field>

              <Field label="Stock">
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="input"
                  placeholder="Contoh: 25"
                />
              </Field>

              <Field label="Badge">
                <input
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="input"
                  placeholder="Contoh: Terlaris"
                />
              </Field>

              <Field label="Gambar Produk">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? "Mengunggah..." : "Upload Gambar"}
                  </button>
                  {form.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(form.imageUrl)}
                      alt="Preview"
                      className="h-14 w-14 rounded-md border object-cover"
                    />
                  )}
                </div>
                <input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  className="input mt-2"
                  placeholder="atau tempel URL gambar"
                />
              </Field>

              <Field label="Reason (alasan rekomendasi)">
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Alasan produk ini direkomendasikan"
                />
              </Field>

              <Field label="Deskripsi (Markdown)">
                <MarkdownEditor
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e })}
                  placeholder="Deskripsi produk — gunakan **bold** untuk tebal, baris baru untuk paragraf, '- item' untuk daftar"
                  rows={8}
                />
              </Field>

              <Field label="Tags (pisahkan dengan koma)">
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="input"
                  placeholder="Contoh: kitten, premium, gluten-free"
                />
              </Field>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                Produk aktif (tampil di toko)
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editingId ? "Simpan" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}
