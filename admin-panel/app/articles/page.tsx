"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Pagination, type Column } from "@/components/ui/DataTable";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { adminApi } from "@/lib/api";
import type {
  AdminArticle,
  ArticleInput,
  ArticleSection,
  ArticleTakeaway,
} from "@/lib/types";

const ARTICLE_CATEGORIES = [
  "Perawatan",
  "Kesehatan",
  "Makanan",
  "Behavior",
  "Kitten",
  "Grooming",
  "Lainnya",
];

interface FormState {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  heroImage: string;
  vetWarning: string;
  breedId: string;
  author: string;
  sourceUrl: string;
  sections: ArticleSection[];
  takeaways: ArticleTakeaway[];
}

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  category: "",
  readTime: "",
  summary: "",
  heroImage: "",
  vetWarning: "",
  breedId: "",
  author: "",
  sourceUrl: "",
  sections: [],
  takeaways: [],
};

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 15;

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(() => {
    setError("");
    setLoading(true);
    const params: { page?: number; limit?: number; category?: string } = {
      page,
      limit,
    };
    if (filterCategory) params.category = filterCategory;
    adminApi
      .getArticles(params)
      .then((res) => {
        setArticles(res.articles);
        setTotal(res.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, filterCategory]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sections: [], takeaways: [] });
    setFormError("");
    setModalOpen(true);
  }

  async function openEdit(article: AdminArticle) {
    // Fetch full details including sections and takeaways
    try {
      const detail = await adminApi.getArticle(article.id);
      setEditingId(detail.id);
      setForm({
        slug: detail.slug,
        title: detail.title,
        category: detail.category ?? "",
        readTime: detail.readTime ?? "",
        summary: detail.summary ?? "",
        heroImage: detail.heroImage ?? "",
        vetWarning: detail.vetWarning ?? "",
        breedId: detail.breedId ?? "",
        author: detail.author ?? "",
        sourceUrl: detail.sourceUrl ?? "",
        sections: detail.sections ?? [],
        takeaways: detail.takeaways ?? [],
      });
      setFormError("");
      setModalOpen(true);
    } catch (err) {
      setError(`Gagal memuat artikel: ${(err as Error).message}`);
    }
  }

  const CUSTOMER_ORIGIN =
    process.env.NEXT_PUBLIC_CUSTOMER_API_URL || "http://localhost:3000";

  function resolveImageUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${CUSTOMER_ORIGIN}${url}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const payload: ArticleInput = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      category: form.category.trim() || null,
      readTime: form.readTime.trim() || null,
      summary: form.summary.trim() || null,
      heroImage: form.heroImage.trim() || null,
      vetWarning: form.vetWarning.trim() || null,
      breedId: form.breedId.trim() || null,
      author: form.author.trim() || null,
      sourceUrl: form.sourceUrl.trim() || null,
      sections: form.sections,
      takeaways: form.takeaways,
    };

    try {
      if (editingId) {
        await adminApi.updateArticle(editingId, payload);
      } else {
        await adminApi.createArticle(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article: AdminArticle) {
    if (
      !confirm(
        `Hapus artikel "${article.title}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }
    setError("");
    try {
      await adminApi.deleteArticle(article.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  // Section management helpers
  function addSection() {
    setForm({
      ...form,
      sections: [...form.sections, { heading: "", body: "" }],
    });
  }

  function updateSection(
    index: number,
    field: keyof ArticleSection,
    value: string,
  ) {
    const updated = [...form.sections];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, sections: updated });
  }

  function removeSection(index: number) {
    setForm({ ...form, sections: form.sections.filter((_, i) => i !== index) });
  }

  // Takeaway management helpers
  function addTakeaway() {
    setForm({
      ...form,
      takeaways: [...form.takeaways, { point: "" }],
    });
  }

  function updateTakeaway(index: number, value: string) {
    const updated = [...form.takeaways];
    updated[index] = { ...updated[index], point: value };
    setForm({ ...form, takeaways: updated });
  }

  function removeTakeaway(index: number) {
    setForm({
      ...form,
      takeaways: form.takeaways.filter((_, i) => i !== index),
    });
  }

  const columns: Column<AdminArticle>[] = [
    { key: "title", header: "Judul" },
    { key: "category", header: "Kategori", render: (a) => a.category ?? "-" },
    { key: "readTime", header: "Waktu Baca", render: (a) => a.readTime ?? "-" },
    {
      key: "author",
      header: "Penulis",
      render: (a) => a.author ?? "-",
    },
    {
      key: "updatedAt",
      header: "Terakhir Diubah",
      render: (a) => new Date(a.updatedAt).toLocaleDateString("id-ID"),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (a) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(a)}
            className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(a)}
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
        <Header title="Articles" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <PageHeader
              title="Daftar Artikel"
              subtitle="Kelola artikel & edukasi"
            />
            <button
              onClick={openCreate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              + Tambah Artikel
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Category Filter */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Kategori:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Semua</option>
                {ARTICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {filterCategory && (
              <button
                onClick={() => setFilterCategory("")}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Reset
              </button>
            )}
          </div>

          <DataTable
            columns={columns}
            rows={articles}
            emptyMessage={loading ? "Memuat..." : "Tidak ada artikel"}
          />
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </main>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {editingId ? "Edit Artikel" : "Tambah Artikel"}
            </h2>

            {formError && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </p>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Slug *">
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input"
                    placeholder="contoh-judul-artikel"
                  />
                </Field>

                <Field label="Judul *">
                  <input
                    required
                    value={form.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      // Auto-generate slug from title if slug is empty or matches old title
                      if (
                        !form.slug ||
                        form.slug === generateSlug(form.title)
                      ) {
                        setForm({
                          ...form,
                          title: newTitle,
                          slug: generateSlug(newTitle),
                        });
                      } else {
                        setForm({ ...form, title: newTitle });
                      }
                    }}
                    className="input"
                    placeholder="Judul Artikel"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Kategori">
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="input"
                  >
                    <option value="">Pilih kategori</option>
                    {ARTICLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Waktu Baca">
                  <input
                    value={form.readTime}
                    onChange={(e) =>
                      setForm({ ...form, readTime: e.target.value })
                    }
                    className="input"
                    placeholder="Contoh: 5 menit"
                  />
                </Field>
              </div>

              <Field label="Ringkasan">
                <textarea
                  value={form.summary}
                  onChange={(e) =>
                    setForm({ ...form, summary: e.target.value })
                  }
                  className="input"
                  rows={3}
                  placeholder="Ringkasan singkat artikel untuk tampilan card"
                />
              </Field>

              <Field label="Gambar Hero">
                <input
                  value={form.heroImage}
                  onChange={(e) =>
                    setForm({ ...form, heroImage: e.target.value })
                  }
                  className="input"
                  placeholder="URL gambar cover artikel"
                />
                {form.heroImage && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImageUrl(form.heroImage)}
                      alt="Preview"
                      className="h-32 w-full rounded-md border object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </Field>

              <Field label="Author / Sumber">
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="input"
                  placeholder="Nama penulis atau sumber"
                />
              </Field>

              <Field label="URL Sumber (opsional)">
                <input
                  value={form.sourceUrl}
                  onChange={(e) =>
                    setForm({ ...form, sourceUrl: e.target.value })
                  }
                  className="input"
                  placeholder="https://example.com/article"
                />
              </Field>

              <Field label="Vet Warning (opsional)">
                <textarea
                  value={form.vetWarning}
                  onChange={(e) =>
                    setForm({ ...form, vetWarning: e.target.value })
                  }
                  className="input"
                  rows={2}
                  placeholder="Peringatan dari dokter hewan (jika ada)"
                />
              </Field>

              {/* Sections */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Konten Artikel (Sections)
                  </label>
                  <button
                    type="button"
                    onClick={addSection}
                    className="rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    + Tambah Section
                  </button>
                </div>
                {form.sections.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Belum ada section. Klik &quot;Tambah Section&quot; untuk menambahkan
                    konten.
                  </p>
                )}
                {form.sections.map((section, index) => (
                  <div
                    key={index}
                    className="mb-3 rounded-md border border-gray-200 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Section {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </div>
                    <input
                      value={section.heading}
                      onChange={(e) =>
                        updateSection(index, "heading", e.target.value)
                      }
                      className="input mb-2"
                      placeholder="Heading section (H2/H3)"
                    />
                    <MarkdownEditor
                      value={section.body}
                      onChange={(e) => updateSection(index, "body", e)}
                      placeholder="Konten section — gunakan **bold** untuk tebal, baris baru untuk paragraf"
                      rows={4}
                    />
                  </div>
                ))}
              </div>

              {/* Takeaways */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Poin Penting (Takeaways)
                  </label>
                  <button
                    type="button"
                    onClick={addTakeaway}
                    className="rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    + Tambah Poin
                  </button>
                </div>
                {form.takeaways.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Belum ada poin penting.
                  </p>
                )}
                {form.takeaways.map((takeaway, index) => (
                  <div key={index} className="mb-2 flex items-center gap-2">
                    <input
                      value={takeaway.point}
                      onChange={(e) => updateTakeaway(index, e.target.value)}
                      className="input flex-1"
                      placeholder="Poin penting takeaway"
                    />
                    <button
                      type="button"
                      onClick={() => removeTakeaway(index)}
                      className="rounded-md bg-red-50 p-2 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
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
