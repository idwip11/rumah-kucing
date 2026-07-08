"use client";

import { FormEvent, useMemo, useState } from "react";
import { NotebookPen, Plus, Sparkles } from "lucide-react";
import { CatProfileCard } from "@/components/cat-profile-card";
import { TimelineEvent } from "@/components/timeline-event";
import { Button } from "@/components/ui/button";
import { timelineEvents } from "@/lib/mock-data";

const defaultCategories = ["Vaksin", "Berat badan", "Riwayat sakit", "Makanan", "Momen foto"];
const idMonthIndexes: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function getTimelineDateTime(value: string) {
  const match = value.toLowerCase().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);

  if (!match) {
    return 0;
  }

  const [, day, month, year] = match;
  const monthIndex = idMonthIndexes[month];

  if (monthIndex === undefined) {
    return 0;
  }

  return new Date(Number(year), monthIndex, Number(day)).getTime();
}

export default function TimelinePage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategories[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [customEvents, setCustomEvents] = useState<typeof timelineEvents>([]);
  const events = useMemo(
    () =>
      [...customEvents, ...timelineEvents].sort(
        (first, second) => getTimelineDateTime(second.date) - getTimelineDateTime(first.date)
      ),
    [customEvents]
  );

  function addCategory() {
    const nextCategory = customCategory.trim();

    if (!nextCategory) {
      return;
    }

    setCategories((current) => {
      if (current.some((item) => item.toLowerCase() === nextCategory.toLowerCase())) {
        return current;
      }

      return [...current, nextCategory];
    });
    setSelectedCategory(nextCategory);
    setCustomCategory("");
  }

  function addTimelineEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    setCustomEvents((current) => [
      {
        title: cleanTitle,
        date: formatDate(date),
        description:
          description.trim() || `Catatan ${selectedCategory.toLowerCase()} baru untuk Mochi.`,
        icon: selectedCategory.toLowerCase().includes("groom") ? Sparkles : NotebookPen,
        status: selectedCategory
      },
      ...current
    ]);
    setTitle("");
    setDescription("");
    setDate(today);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
        <div>
          <p className="text-sm font-bold text-primary">Rumah digital</p>
          <h1 className="mt-2 text-3xl font-bold">Timeline kehidupan kucing</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Semua catatan penting disusun kronologis agar kesehatan, kebiasaan, dan momen
            emosional tidak hilang di chat atau galeri foto.
          </p>
        </div>
        <CatProfileCard compact />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-bold">Tambah catatan</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Pilih kategori catatan, atau tambahkan kategori sendiri sesuai rutinitas kucingmu.
          </p>
          <div className="mt-4 grid gap-3">
            {categories.map((item) => (
              <Button
                key={item}
                type="button"
                variant={selectedCategory === item ? "default" : "outline"}
                className="justify-start"
                onClick={() => setSelectedCategory(item)}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {item}
              </Button>
            ))}
          </div>

          <div className="mt-5 rounded-md bg-muted p-3">
            <label className="text-sm font-bold" htmlFor="custom-category">
              Tambah kategori sendiri
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
                placeholder="Contoh: Grooming"
              />
              <Button type="button" variant="outline" onClick={addCategory}>
                Tambah
              </Button>
            </div>
          </div>

          <form className="mt-5 grid gap-3 border-t border-border pt-5" onSubmit={addTimelineEvent}>
            <div>
              <label className="text-sm font-bold" htmlFor="note-title">
                Judul catatan
              </label>
              <input
                id="note-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                placeholder={`Contoh: ${selectedCategory} rutin`}
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
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Simpan ke timeline
            </Button>
          </form>
        </aside>

        <section className="relative space-y-5 before:absolute before:left-[18px] before:top-3 before:h-[calc(100%-24px)] before:w-px before:bg-border">
          {events.map((event, index) => (
            <TimelineEvent key={`${event.title}-${event.date}-${index}`} {...event} />
          ))}
        </section>
      </div>
    </div>
  );
}
