"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api";
import type { AdminEvent, EventInput } from "@/lib/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import PaginationControls from "@/components/ui/PaginationControls";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

const EVENT_TYPES = [
  "Lomba",
  "Seminar",
  "Adopsi",
  "Vaksinasi",
  "Grooming",
  "Lainnya",
];

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EventInput>({
    title: "",
    type: "",
    eventDate: "",
    location: "",
    description: "",
    sourceUrl: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getEvents({
        page,
        limit,
        status: statusFilter || undefined,
      });
      setEvents(res.events);
      setTotal(res.total);
    } catch (err) {
      console.error("Gagal memuat events:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openCreate = () => {
    setEditId(null);
    setForm({
      title: "",
      type: "",
      eventDate: "",
      location: "",
      description: "",
      sourceUrl: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEdit = (ev: AdminEvent) => {
    setEditId(ev.id);
    setForm({
      title: ev.title,
      type: ev.type,
      eventDate: ev.eventDate.slice(0, 10),
      location: ev.location,
      description: ev.description || "",
      sourceUrl: ev.sourceUrl || "",
      isActive: ev.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.type || !form.eventDate || !form.location) {
      alert("Title, Type, Event Date, dan Location wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await adminApi.updateEvent(editId, form);
      } else {
        await adminApi.createEvent(form);
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus event ini?")) return;
    try {
      await adminApi.deleteEvent(id);
      fetchEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus event");
    }
  };

  const filtered = search.trim()
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.location.toLowerCase().includes(search.toLowerCase()),
      )
    : events;

  const columns: Column<AdminEvent>[] = [
    {
      key: "title",
      header: "Judul",
      render: (e) => <div className="font-medium text-gray-900">{e.title}</div>,
    },
    {
      key: "type",
      header: "Tipe",
      render: (e) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {e.type}
        </span>
      ),
    },
    {
      key: "eventDate",
      header: "Tanggal",
      render: (e) =>
        new Date(e.eventDate).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "location",
      header: "Lokasi",
      render: (e) => <span className="text-gray-600">{e.location}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      render: (e) =>
        e.isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            Nonaktif
          </span>
        ),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (e) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(e)}
            className="rounded p-1 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(e.id)}
            className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Events" />
        <main className="flex-1 overflow-y-auto p-6">
          <PageHeader
            title="Events"
            subtitle="Kelola agenda dan acara komunitas kucing"
            action={
              <button
                onClick={openCreate}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Event
              </button>
            }
          />

          {/* Filters */}
          <div className="mb-4 flex items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              Memuat events...
            </div>
          ) : (
            <>
              <DataTable columns={columns} rows={filtered} />
              <PaginationControls
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
              />
            </>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {editId ? "Edit Event" : "Tambah Event Baru"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Judul Event *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Lomba Menggambar Kucing"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tipe *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Pilih tipe</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) =>
                      setForm({ ...form, eventDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Lokasi *
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Gedung Serbaguna, Jakarta"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Deskripsi event..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  URL / Link Pendaftaran
                </label>
                <input
                  type="url"
                  value={form.sourceUrl ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, sourceUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive ?? true}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Aktif (tampilkan di website)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
