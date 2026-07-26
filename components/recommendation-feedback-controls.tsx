"use client";

import { useEffect, useState } from "react";
import {
  Bookmark,
  Clock3,
  Save,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import type { RecommendationFeedbackResponse } from "@/lib/recommendations/types";

type FeedbackValue = {
  response: RecommendationFeedbackResponse;
  note: string | null;
};

type RecommendationFeedbackControlsProps = {
  catId: string;
  catName: string;
  productId: string;
  currentFeedback: FeedbackValue | null;
  onChanged: () => void;
};

const FEEDBACK_OPTIONS = [
  {
    value: "liked",
    label: "Suka",
    icon: ThumbsUp,
  },
  {
    value: "disliked",
    label: "Tidak suka",
    icon: ThumbsDown,
  },
  {
    value: "not_tried",
    label: "Belum dicoba",
    icon: Clock3,
  },
  {
    value: "caused_issue",
    label: "Menimbulkan masalah",
    icon: TriangleAlert,
  },
  {
    value: "saved",
    label: "Simpan favorit",
    icon: Bookmark,
  },
] as const;

export function RecommendationFeedbackControls({
  catId,
  catName,
  productId,
  currentFeedback,
  onChanged,
}: RecommendationFeedbackControlsProps) {
  const [response, setResponse] =
    useState<RecommendationFeedbackResponse | null>(
      currentFeedback?.response ?? null,
    );
  const [note, setNote] = useState(currentFeedback?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setResponse(currentFeedback?.response ?? null);
    setNote(currentFeedback?.note ?? "");
  }, [currentFeedback?.note, currentFeedback?.response]);

  async function saveFeedback() {
    if (!response) return;

    try {
      setIsSaving(true);
      setMessage("");
      setError("");
      const request = await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          catId,
          productId,
          recommendationType: "product",
          response,
          note: note.trim() || undefined,
        }),
      });
      const body = await request.json().catch(() => null);

      if (!request.ok) {
        throw new Error(body?.error || "Gagal menyimpan feedback");
      }

      setMessage(`Feedback untuk ${catName} sudah disimpan.`);
      onChanged();
    } catch (saveError) {
      console.error("Gagal menyimpan feedback rekomendasi:", saveError);
      setError("Feedback belum berhasil disimpan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  async function clearFeedback() {
    try {
      setIsSaving(true);
      setMessage("");
      setError("");
      const request = await fetch(
        `/api/recommendations/feedback?catId=${encodeURIComponent(catId)}&productId=${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const body = await request.json().catch(() => null);

      if (!request.ok) {
        throw new Error(body?.error || "Gagal menghapus feedback");
      }

      setResponse(null);
      setNote("");
      setMessage("Feedback telah dihapus.");
      onChanged();
    } catch (deleteError) {
      console.error("Gagal menghapus feedback rekomendasi:", deleteError);
      setError("Feedback belum berhasil dihapus. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="border-t border-border/70 px-5 py-6 sm:px-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-headline text-base font-bold text-on-surface">
            Apakah rekomendasi ini membantu?
          </h3>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            Responsmu membantu pilihan berikutnya lebih sesuai untuk {catName}.
          </p>
        </div>
        {currentFeedback && (
          <button
            type="button"
            onClick={clearFeedback}
            disabled={isSaving}
            className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-lg px-2.5 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Hapus feedback
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {FEEDBACK_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = response === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setResponse(option.value);
                setMessage("");
                setError("");
              }}
              disabled={isSaving}
              aria-pressed={isSelected}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-white text-on-surface-variant hover:border-primary/40 hover:text-primary"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label
            htmlFor={`recommendation-note-${productId}`}
            className="text-xs font-bold text-on-surface"
          >
            Catatan opsional
          </label>
          <textarea
            id={`recommendation-note-${productId}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={isSaving}
            maxLength={1000}
            rows={2}
            placeholder={`Contoh: ${catName} lebih menyukai rasa ayam.`}
            className="mt-1.5 w-full resize-none rounded-lg border border-input bg-white px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary disabled:opacity-60"
          />
        </div>
        <button
          type="button"
          onClick={saveFeedback}
          disabled={!response || isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSaving ? "Menyimpan..." : "Simpan feedback"}
        </button>
      </div>

      {response === "caused_issue" && (
        <p className="mt-3 text-xs leading-5 text-rose-700">
          Produk akan dikeluarkan dari rekomendasi utama untuk {catName}.
          Catatan ini bukan pengganti pemeriksaan dokter hewan.
        </p>
      )}
      {message && (
        <p className="mt-3 text-xs font-semibold text-emerald-700">{message}</p>
      )}
      {error && (
        <p className="mt-3 text-xs font-semibold text-rose-700">{error}</p>
      )}
    </div>
  );
}
