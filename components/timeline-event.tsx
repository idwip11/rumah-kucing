"use client";

import { type LucideIcon, Trash2, Scissors } from "lucide-react";
import { useState } from "react";
import { TimelineCategory } from "@prisma/client";

const WHATSAPP_NUMBER = "62895418179797";

const categoryLabelMap: Partial<Record<TimelineCategory, string>> = {
  [TimelineCategory.Vaksin]: "Vaksin",
  [TimelineCategory.Berat_badan]: "Berat badan",
  [TimelineCategory.Riwayat_sakit]: "Riwayat sakit",
  [TimelineCategory.Makanan]: "Makanan",
  [TimelineCategory.Grooming]: "Grooming",
  [TimelineCategory.Momen_foto]: "Momen foto",
  [TimelineCategory.Lainnya]: "Lainnya",
};

type TimelineEventProps = {
  id: string;
  title: string;
  date: string;
  eventDate?: string;
  description: string;
  icon: LucideIcon;
  status: string;
  category?: TimelineCategory;
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (id: string) => void;
};

function buildGroomingMessage(title: string, dateLabel: string) {
  return `Halo, saya ingin menjadwalkan layanan grooming untuk kucing saya.

Detail janji:
- Catatan: ${title}
- Tanggal yang diinginkan: ${dateLabel}

Mohon konfirmasi ketersediaan jadwal. Terima kasih.`;
}

export function TimelineEvent({
  id,
  title,
  date,
  eventDate,
  description,
  icon: Icon,
  status,
  category,
  onDelete,
  onEdit,
}: TimelineEventProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const badgeLabel = category ? categoryLabelMap[category] ?? category : status;

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus catatan "${title}"?`)) {
      return;
    }

    if (!onDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Gagal menghapus catatan");
    } finally {
      setIsDeleting(false);
    }
  };

  const isGrooming = category === TimelineCategory.Grooming;

  async function handleScheduleGrooming() {
    // Always fetch the latest event from the backend so the WhatsApp
    // message reflects the actual stored timeline date (never hardcoded).
    try {
      const res = await fetch(`/api/timeline?eventId=${id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const eventDateStr = data?.eventDate ?? eventDate ?? date;
        const eventTitle = data?.title ?? title;
        const formatted = new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(`${eventDateStr}T00:00:00`));
        const message = buildGroomingMessage(eventTitle, formatted);
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        return;
      }
    } catch (err) {
      console.error("Gagal memuat detail grooming:", err);
    }
    // Fallback to already-loaded props if the fetch fails
    const message = buildGroomingMessage(title, date);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <article className="relative pl-12">
      <span className="absolute left-0 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white bg-brand-gradient text-white shadow-[0_7px_16px_hsl(var(--primary)/0.2)]">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="premium-card card-hover rounded-[20px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold">{title}</h3>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/9 px-3 py-1.5 text-[11px] font-bold text-primary">
              {badgeLabel}
            </span>

            {/* TOMBOL HAPUS */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
              title="Hapus Catatan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-1">{date}</p>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>

        {isGrooming && (
          <button
            type="button"
            onClick={handleScheduleGrooming}
            className="btn-bounce mt-4 inline-flex items-center gap-2 rounded-xl bg-warm-gradient px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_hsl(var(--secondary)/0.18)]"
          >
            <Scissors className="h-4 w-4" aria-hidden="true" />
            Jadwalkan Grooming
          </button>
        )}
      </div>
    </article>
  );
}
