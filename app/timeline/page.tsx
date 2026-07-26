"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { NotebookPen, Plus, Sparkles } from "lucide-react";
import { CareInsightsPanel } from "@/components/care-insights-panel";
import { CatProfileCard } from "@/components/cat-profile-card";
import { TimelineEvent } from "@/components/timeline-event";
import { Button } from "@/components/ui/button";
import { useCatStore } from "@/store/use-cat-store";
import { TimelineCategory } from "@prisma/client";
import type { CareInsight } from "@/lib/recommendations/types";

const defaultCategories = [
  TimelineCategory.Vaksin,
  TimelineCategory.Berat_badan,
  TimelineCategory.Riwayat_sakit,
  TimelineCategory.Makanan,
  TimelineCategory.Grooming,
  TimelineCategory.Momen_foto,
];

const categoryLabelMap: Record<string, string> = {
  [TimelineCategory.Vaksin]: "Vaksin",
  [TimelineCategory.Berat_badan]: "Berat badan",
  [TimelineCategory.Riwayat_sakit]: "Riwayat sakit",
  [TimelineCategory.Makanan]: "Makanan",
  [TimelineCategory.Grooming]: "Grooming",
  [TimelineCategory.Momen_foto]: "Momen foto",
  [TimelineCategory.Lainnya]: "Lainnya",
};

export default function TimelinePage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const activeCat = useCatStore((state) => state.activeCat());
  const catName = activeCat?.name ?? "Anabul";

  const [categories, setCategories] =
    useState<TimelineCategory[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory>(
    defaultCategories[0],
  );
  const [customCategory, setCustomCategory] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [careInsights, setCareInsights] = useState<CareInsight[]>([]);
  const [insightVersion, setInsightVersion] = useState(0);
  const [error, setError] = useState<string>("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Load timeline events from database when active cat changes
  useEffect(() => {
    if (!activeCat?.id) {
      setDbEvents([]);
      return;
    }

    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/timeline?catId=${encodeURIComponent(activeCat.id)}`,
          { credentials: "include" },
        );
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Gagal memuat catatan timeline");
        }

        const events = Array.isArray(data) ? data : [];
        setDbEvents(events);
        setError("");
      } catch (err) {
        console.error("Gagal memuat timeline:", err);
        setError("Gagal memuat catatan timeline");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [activeCat?.id]);

  useEffect(() => {
    if (!activeCat?.id) {
      setCareInsights([]);
      return;
    }

    let isCurrent = true;
    const loadInsights = async () => {
      try {
        setIsLoadingInsights(true);
        const response = await fetch(
          `/api/recommendations/dashboard?catId=${encodeURIComponent(activeCat.id)}`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Gagal memuat insight perawatan");
        }

        if (isCurrent) {
          setCareInsights(Array.isArray(data?.insights) ? data.insights : []);
        }
      } catch (err) {
        console.error("Gagal memuat insight perawatan:", err);
        if (isCurrent) setCareInsights([]);
      } finally {
        if (isCurrent) setIsLoadingInsights(false);
      }
    };

    loadInsights();
    return () => {
      isCurrent = false;
    };
  }, [activeCat?.id, insightVersion]);

  // Convert database events to TimelineEvent component format
  const formattedEvents = useMemo(
    () =>
      dbEvents
        .map((event) => ({
          id: event.id,
          title: event.title,
          date: new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(event.eventDate)),
          eventDate: event.eventDate,
          category: event.category,
          description:
            event.description || `Catatan ${event.category.toLowerCase()}`,
          icon: event.category.toLowerCase().includes("groom")
            ? Sparkles
            : NotebookPen,
          status: event.status,
        }))
        .sort(
          (a, b) =>
            new Date(b.eventDate).getTime() -
            new Date(a.eventDate).getTime(),
        ),
    [dbEvents],
  );

  async function handleDeleteTimelineEvent(eventId: string) {
    try {
      const response = await fetch(`/api/timeline?eventId=${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setDbEvents((current) => current.filter((e) => e.id !== eventId));
      setInsightVersion((current) => current + 1);
    } catch (error) {
      console.error("Failed to delete event:", error);
      throw error;
    }
  }

  function handleEditTimelineEvent(eventId: string) {
    const event = dbEvents.find((e) => e.id === eventId);
    if (!event) return;

    setEditingEventId(eventId);
    setTitle(event.title);
    setDescription(event.description ?? "");
    setDate(new Date(event.eventDate).toISOString().slice(0, 10));
    setSelectedCategory(event.category);
  }

  async function handleUpdateTimelineEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingEventId || !activeCat?.id) return;

    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/timeline", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          eventId: editingEventId,
          title: cleanTitle,
          eventDate: new Date(`${date}T00:00:00`).toISOString(),
          description: description.trim(),
          category: selectedCategory,
          status: "Tercatat",
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Gagal memperbarui catatan timeline");
      }

      setDbEvents((current) =>
        current.map((e) => (e.id === editingEventId ? data : e)),
      );
      setInsightVersion((current) => current + 1);
      resetForm();
    } catch (err) {
      console.error("Gagal memperbarui catatan:", err);
      setError("Gagal memperbarui catatan timeline");
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setDate(today);
    setSelectedCategory(defaultCategories[0]);
  }

  function addCategory() {
    const nextCategory = customCategory.trim();

    if (!nextCategory) {
      return;
    }

    // Check if category already exists
    const categoryExists = categories.some(
      (item) =>
        categoryLabelMap[item]?.toLowerCase() === nextCategory.toLowerCase(),
    );

    if (categoryExists) {
      return;
    }

    // Add as "Lainnya" type since it's a custom category
    const newCategory = TimelineCategory.Lainnya;
    setCategories((current) => [...current, newCategory]);
    setSelectedCategory(newCategory);
    setCustomCategory("");
  }

  async function handleAddTimelineEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!activeCat?.id) {
      setError("Pilih kucing terlebih dahulu");
      return;
    }

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          catId: activeCat.id,
          title: cleanTitle,
          eventDate: new Date(`${date}T00:00:00`).toISOString(),
          description: description.trim(),
          category: selectedCategory,
          status: "Tercatat",
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Gagal menyimpan catatan timeline");
      }

      setDbEvents((current) => [data, ...current]);
      setInsightVersion((current) => current + 1);
      setTitle("");
      setDescription("");
      setDate(today);
    } catch (err) {
      console.error("Gagal menyimpan catatan:", err);
      setError("Gagal menyimpan catatan timeline");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex-grow px-6 md:px-[80px] py-[64px] max-w-[1440px] mx-auto w-full pt-[120px]">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-4 xl:col-span-4">
          <div>
            <p className="eyebrow">Rumah digital</p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gradient-brand">
              Setiap momen {catName} layak diingat
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Semua catatan penting disusun kronologis agar kesehatan,
              kebiasaan, dan momen emosional tidak hilang di chat atau galeri
              foto.
            </p>
          </div>
          <aside className="premium-card rounded-[24px] p-5 sm:p-6">
            <h2 className="font-headline text-xl font-extrabold">Tambah catatan</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Pilih kategori catatan, atau tambahkan kategori sendiri sesuai
              rutinitas kucingmu.
            </p>

            {error && (
              <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                {error}
              </div>
            )}

            {!activeCat && (
              <div className="mt-3 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
                Pilih kucing terlebih dahulu dari kartu profil
              </div>
            )}

            <div className="mt-4 grid gap-3">
              {categories.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={selectedCategory === item ? "default" : "outline"}
                  className={
                    selectedCategory === item
                      ? "justify-start text-white hover:text-white [&_svg]:text-white"
                      : "justify-start"
                  }
                  onClick={() => setSelectedCategory(item)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {categoryLabelMap[item] || item}
                </Button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-border/65 bg-muted/60 p-4">
              <label className="text-sm font-bold" htmlFor="custom-category">
                Buat Kategori Baru
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="custom-category"
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCategory();
                    }
                  }}
                  className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                  placeholder="Contoh: Liburan, Main, atau Lomba"
                />
                <Button type="button" variant="outline" onClick={addCategory}>
                  Tambah
                </Button>
              </div>
            </div>

            <form
              id="timeline-form"
              className="mt-6 grid gap-4 border-t border-border/70 pt-6"
              onSubmit={
                editingEventId
                  ? handleUpdateTimelineEvent
                  : handleAddTimelineEvent
              }
            >
              <div>
                <label className="text-sm font-bold" htmlFor="note-title">
                  Judul catatan
                </label>
                <input
                  id="note-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                  placeholder={`Contoh: ${categoryLabelMap[selectedCategory] || selectedCategory} rutin`}
                  disabled={!activeCat || isSaving}
                />
              </div>
              <div>
                <label className="text-sm font-bold" htmlFor="note-date">
                  Tanggal
                </label>
                <input
                  id="note-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                  disabled={!activeCat || isSaving}
                />
              </div>
              <div>
                <label className="text-sm font-bold" htmlFor="note-description">
                  Detail catatan
                </label>
                <textarea
                  id="note-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 min-h-24 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
                  placeholder="Tulis detail singkat, misalnya hasil grooming, kondisi bulu, atau rekomendasi pet groomer."
                  disabled={!activeCat || isSaving}
                />
              </div>
              <Button
                type="submit"
                className="w-full text-white hover:text-white [&_svg]:text-white"
                disabled={!activeCat || isSaving}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {isSaving
                  ? "Menyimpan..."
                  : editingEventId
                    ? "Perbarui catatan"
                    : "Simpan ke timeline"}
              </Button>
              {editingEventId && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  Batal edit
                </Button>
              )}
            </form>
          </aside>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8 lg:col-span-8 xl:col-span-8">
          <CatProfileCard compact />

          {activeCat && (
            <CareInsightsPanel
              catName={catName}
              insights={careInsights}
              isLoading={isLoadingInsights}
            />
          )}

          <section
            id="timeline-records"
            className="relative scroll-mt-28 space-y-5 before:absolute before:left-[18px] before:top-3 before:h-[calc(100%-24px)] before:w-px before:bg-gradient-to-b before:from-primary/35 before:via-secondary/20 before:to-transparent"
          >
            {isLoading && (
              <div className="text-center text-muted-foreground py-8">
                Memuat catatan timeline...
              </div>
            )}
            {!isLoading && formattedEvents.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Belum ada catatan timeline. Mulai dengan membuat catatan
                pertama.
              </div>
            )}
            {formattedEvents.map((event) => (
              <TimelineEvent
                key={event.id}
                {...event}
                onDelete={handleDeleteTimelineEvent}
                onEdit={handleEditTimelineEvent}
              />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
