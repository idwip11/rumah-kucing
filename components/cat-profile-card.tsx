"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cat, Camera, Trophy, CalendarDays } from "lucide-react";
import { useCatStore } from "@/store/use-cat-store";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";
import { ModalPortal } from "@/components/ui/modal-portal";
import {
  getAchievements,
  addAchievement,
  type AchievementDTO,
} from "@/app/actions/achievements";

const LIFESTYLE_OPTIONS = ["Indoor", "Outdoor", "Indoor + balkon", "Campuran"];
const GENDER_OPTIONS = ["Betina", "Jantan"];

/** Format a Date to YYYY-MM-DD for the date input */
function dateToInputValue(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function CatProfileCard({ compact = false }: { compact?: boolean }) {
  const cats = useCatStore((state) => state.cats);
  const activeCatId = useCatStore((state) => state.activeCatId);
  const setActiveCat = useCatStore((state) => state.setActiveCat);
  const activeCat = useCatStore((state) => state.activeCat());
  const setCats = useCatStore((state) => state.setCats);
  const userId = useAuthStore((state) => state.userId);

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState("");

  const [breeds, setBreeds] = useState<
    { id: string; slug: string; name: string }[]
  >([]);

  const [achievements, setAchievements] = useState<AchievementDTO[]>([]);

  const [isAddingAch, setIsAddingAch] = useState(false);
  const [isSavingAch, setIsSavingAch] = useState(false);
  const [achError, setAchError] = useState("");

  const [achForm, setAchForm] = useState({
    title: "",
    month: "",
    year: "",
    rank: "",
  });

  const [form, setForm] = useState({
    name: "",
    breedSlug: "",
    estimatedDateOfBirth: "",
    weight: "",
    gender: "",
    sterilized: false,
    lifestyle: "",
    note: "",
    photoUrl: "",
  });

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  function renderCatAvatar(
    cat: { name: string; photoUrl?: string | null },
    className = "h-20 w-20 text-[36px]",
  ) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full bg-brand-gradient font-headline font-bold text-white shadow-[0_10px_24px_hsl(var(--primary)/0.18)] ring-4 ring-white",
          className,
        )}
      >
        {cat.photoUrl ? (
          <img
            src={cat.photoUrl}
            alt={`Foto ${cat.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitial(cat.name)
        )}
      </div>
    );
  }

  async function loadBreed() {
    try {
      const res = await fetch("/api/breeds", { credentials: "include" });
      if (res.ok) {
        const list = await res.json();
        setBreeds(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("Gagal memuat daftar ras:", err);
    }
  }

  async function openEdit() {
    if (!activeCat) return;
    await loadBreed();

    // Pre-select the cat's current breed by matching name -> slug
    const currentBreed = breeds.find((b) => b.name === activeCat.breed);
    setForm({
      name: activeCat.name ?? "",
      breedSlug: currentBreed?.slug ?? "",
      estimatedDateOfBirth: activeCat.estimatedDateOfBirth ?? "",
      weight: activeCat.weight ?? "",
      gender: activeCat.gender ?? "",
      sterilized: activeCat.sterilized ?? false,
      lifestyle: activeCat.lifestyle ?? "",
      note: activeCat.note ?? "",
      photoUrl: activeCat.photoUrl ?? "",
    });
    setError("");
    setIsEditing(true);
  }

  async function openAdd() {
    await loadBreed();
    setForm({
      name: "",
      breedSlug: "",
      estimatedDateOfBirth: "",
      weight: "",
      gender: "",
      sterilized: false,
      lifestyle: "",
      note: "",
      photoUrl: "",
    });
    setError("");
    setIsAdding(true);
  }

  useEffect(() => {
    if (!activeCat?.id) {
      setAchievements([]);
      return;
    }
    getAchievements(activeCat.id, 3, userId)
      .then(setAchievements)
      .catch((err) => {
        console.error("Gagal memuat prestasi:", err);
        setAchievements([]);
      });
  }, [activeCat?.id, userId]);

  async function handleAddAchievement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeCat) return;
    setIsSavingAch(true);
    setAchError("");
    try {
      const month = Number(achForm.month);
      const year = Number(achForm.year);
      if (!achForm.title.trim() || !month || !year) {
        throw new Error("Lengkapi nama, bulan, dan tahun prestasi.");
      }
      const achievedAt = new Date(year, month - 1, 1);

      await addAchievement({
        catId: activeCat.id,
        title: achForm.title.trim(),
        description: achForm.rank ? `Juara ${achForm.rank}` : undefined,
        achievedAt,
        rank: achForm.rank ? Number(achForm.rank) : undefined,
        icon: "trophy",
        userId: userId || undefined,
      });

      // Refresh the top-3 list for this cat
      const refreshed = await getAchievements(activeCat.id, 3, userId);
      setAchievements(refreshed);
      setAchForm({ title: "", month: "", year: "", rank: "" });
      setIsAddingAch(false);
    } catch (err) {
      console.error("Gagal menambah prestasi:", err);
      setAchError(
        err instanceof Error ? err.message : "Gagal menyimpan prestasi",
      );
    } finally {
      setIsSavingAch(false);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const isEdit = Boolean(activeCat && isEditing);
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        breedSlug: form.breedSlug || undefined,
        estimatedDateOfBirth: form.estimatedDateOfBirth || null,
        weightKg: form.weight ? Number(form.weight) : undefined,
        gender: form.gender || undefined,
        sterilized: form.sterilized,
        lifestyle: (form.lifestyle || undefined) as
          | "Indoor"
          | "Outdoor"
          | "Indoor + balkon"
          | "Campuran"
          | undefined,
        notes: form.note.trim() || undefined,
        photoUrl: form.photoUrl || undefined,
      };
      if (isEdit && activeCat) {
        payload.catId = activeCat.id;
      }

      const response = await fetch("/api/cats", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan profil");
      }

      // Refresh the cat list in the store so the dashboard updates
      const refreshed = await fetch("/api/cats", {
        method: "GET",
        credentials: "include",
      });
      if (refreshed.ok) {
        const updatedCats = await refreshed.json();
        setCats(
          updatedCats.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            breed: cat.breed?.name ?? cat.breed,
            age: cat.ageLabel ?? "",
            estimatedDateOfBirth: cat.estimatedDateOfBirth ?? null,
            weight: cat.weightKg != null ? `${cat.weightKg} kg` : "",
            gender: cat.gender,
            sterilized: cat.sterilized,
            lifestyle: cat.lifestyle,
            note: cat.notes,
            photoUrl: cat.photoUrl ?? null,
          })),
        );
      }

      setIsEditing(false);
      setIsAdding(false);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingPhoto(true);
    setError("");
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const response = await fetch("/api/cats/upload", {
        method: "POST",
        credentials: "include",
        body: uploadForm,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Gagal mengunggah foto");
      }

      setForm((current) => ({ ...current, photoUrl: data.url }));
    } catch (err) {
      console.error("Gagal mengunggah foto kucing:", err);
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  if (!activeCat) {
    return (
      <section
        className={cn(
          "premium-card flex flex-col items-center justify-center rounded-[24px] p-8 text-center",
          compact && "p-6",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Cat className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-bold">Belum ada profil kucing</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tambahkan profil kucing pertama kamu untuk mulai memantau
          kebutuhannya.
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="btn-bounce mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-[15px] font-bold text-white shadow-[0_10px_24px_hsl(var(--primary)/0.2)]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah Profil Kucing
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="premium-card rounded-[26px] p-5 sm:p-7">
        <div className="flex items-center gap-5 mb-8">
          {renderCatAvatar(activeCat)}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h2 className="font-headline text-[22px] font-bold text-on-surface mb-0.5">
                {activeCat.name}
              </h2>
              <select
                className="bg-transparent text-sm text-primary font-medium outline-none cursor-pointer"
                value={activeCatId ?? ""}
                onChange={(event) => setActiveCat(event.target.value)}
                aria-label="Pilih profil kucing aktif"
              >
                {cats.map((cat) => (
                  <option value={cat.id} key={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[14px] text-on-surface-variant">
              {activeCat.breed} • {activeCat.age}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="flex flex-col items-center justify-center rounded-[18px] border border-emerald-100 bg-emerald-50/75 p-4 text-center">
            <span
              className="material-symbols-outlined text-primary mb-1 text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monitor_weight
            </span>
            <span className="text-[13px] text-on-surface-variant mb-1">
              Berat
            </span>
            <span className="font-headline text-[18px] font-bold text-primary">
              {activeCat.weight}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-[18px] border border-rose-100 bg-rose-50/75 p-4 text-center">
            <span
              className="material-symbols-outlined mb-1 text-[22px] text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              pets
            </span>
            <span className="text-[13px] text-on-surface-variant mb-1">
              Status
            </span>
            <span className="font-headline text-[18px] font-bold text-secondary">
              {activeCat.sterilized ? "Sudah Steril" : "Belum Steril"}
            </span>
          </div>
          <div className="col-span-2 flex items-center justify-between rounded-[18px] border border-lavender bg-lavender/45 p-4">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-ink text-[22px]">
                home
              </span>
              <span className="text-[15px] font-medium text-ink">
                Gaya Hidup
              </span>
            </div>
            <span className="font-headline text-[16px] font-bold text-ink">
              {activeCat.lifestyle}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={openEdit}
            className="btn-bounce flex-1 rounded-xl border border-primary/30 bg-white py-3 text-[14px] font-bold text-primary hover:bg-primary/5"
          >
            Edit Profil
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="btn-bounce flex-1 rounded-xl bg-brand-gradient py-3 text-[14px] font-bold text-white shadow-[0_9px_20px_hsl(var(--primary)/0.18)]"
          >
            Tambah Profil
          </button>
        </div>
      </section>

      {/* Galeri Prestasi */}
      <section className="premium-card rounded-[26px] p-5 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="font-headline text-[20px] font-bold text-on-surface">
            Galeri Prestasi {activeCat.name}
          </h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setAchForm({ title: "", month: "", year: "", rank: "" });
                setAchError("");
                setIsAddingAch(true);
              }}
              className="text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Tambah Prestasi
            </button>
            <span className="w-1 h-1 rounded-full bg-[#d1d5d2]"></span>
            <Link
              href="/achievements"
              className="text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Lihat Semua
            </Link>
          </div>
        </div>

        {achievements.length === 0 ? (
          <p className="text-[14px] text-on-surface-variant">
            Setiap pencapaian {activeCat.name} layak dikenang. Tambahkan lomba
            atau momen membanggakan pertamanya.
          </p>
        ) : (
          <ul className="space-y-3">
            {achievements.map((ach) => (
              <li
                key={ach.id}
                className="flex items-start gap-3 rounded-[16px] border border-honey/70 bg-honey/35 p-4"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-secondary shadow-sm">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-on-surface">
                    {ach.title}
                  </p>
                  {ach.description && (
                    <p className="text-[13px] text-on-surface-variant mt-0.5">
                      {ach.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Tambah Prestasi modal */}
      {isAddingAch && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-foreground/35 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-achievement-title"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setIsAddingAch(false);
            }}
          >
            <div className="premium-card max-h-[calc(100dvh-32px)] w-full max-w-md overflow-y-auto rounded-[26px] p-6 shadow-floating">
              <h3
                id="add-achievement-title"
                className="font-headline text-[20px] font-bold text-on-surface mb-4"
              >
                Tambah Prestasi {activeCat.name}
              </h3>

              {achError && (
                <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  {achError}
                </div>
              )}

              <form onSubmit={handleAddAchievement} className="space-y-3">
                <div>
                  <label className="text-sm font-bold">
                    Nama kompetisi/kategori
                  </label>
                  <input
                    value={achForm.title}
                    onChange={(e) =>
                      setAchForm({ ...achForm, title: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Contoh: Kontes Kucing Lucu"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold">Bulan</label>
                    <select
                      value={achForm.month}
                      onChange={(e) =>
                        setAchForm({ ...achForm, month: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      required
                    >
                      <option value="">—</option>
                      {[
                        "Januari",
                        "Februari",
                        "Maret",
                        "April",
                        "Mei",
                        "Juni",
                        "Juli",
                        "Agustus",
                        "September",
                        "Oktober",
                        "November",
                        "Desember",
                      ].map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold">Tahun</label>
                    <input
                      type="number"
                      value={achForm.year}
                      onChange={(e) =>
                        setAchForm({ ...achForm, year: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="2026"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold">Juara berapa</label>
                  <input
                    value={achForm.rank}
                    onChange={(e) =>
                      setAchForm({ ...achForm, rank: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Contoh: 1"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAch(false)}
                    disabled={isSavingAch}
                    className="flex-1 py-3 rounded-[12px] border border-[#d1d5d2] text-primary font-bold bg-white hover:bg-[#f9f9f9] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAch}
                    className="flex-1 py-3 rounded-[12px] bg-primary text-white font-bold btn-bounce disabled:opacity-50"
                  >
                    {isSavingAch ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {(isEditing || isAdding) && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-foreground/35 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cat-profile-form-title"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) {
                setIsEditing(false);
                setIsAdding(false);
              }
            }}
          >
            <div className="premium-card max-h-[calc(100dvh-32px)] w-full max-w-md overflow-y-auto rounded-[26px] p-6 shadow-floating">
              <h3
                id="cat-profile-form-title"
                className="font-headline text-[20px] font-bold text-on-surface mb-4"
              >
              {isAdding
                ? "Tambah Profil Kucing"
                : `Edit Profil ${activeCat.name}`}
              </h3>

              {error && (
                <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-3">
              <div className="rounded-[18px] border border-border/70 bg-muted/45 p-4">
                <label className="text-sm font-bold">Foto profil kucing</label>
                <div className="mt-3 flex items-center gap-4">
                  {renderCatAvatar(
                    {
                      name: form.name || activeCat.name || "Kucing",
                      photoUrl: form.photoUrl || null,
                    },
                    "h-24 w-24 text-[40px]",
                  )}
                  <div className="min-w-0 flex-1">
                    <input
                      id="cat-photo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto || isSaving}
                    />
                    <label
                      htmlFor="cat-photo-upload"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-[14px] bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      {isUploadingPhoto ? "Mengunggah..." : "Upload Photo"}
                    </label>
                    <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                      PNG, JPG, WEBP, atau GIF. Jika belum ada foto, inisial
                      kucing tetap digunakan.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold">Nama</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold">Ras</label>
                <select
                  value={form.breedSlug}
                  onChange={(e) =>
                    setForm({ ...form, breedSlug: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">— Pilih ras —</option>
                  {breeds.map((b) => (
                    <option key={b.id} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* REPLACED: Age field → Estimated Date of Birth */}
              <div>
                <label className="text-sm font-bold">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    Perkiraan Tanggal Lahir
                  </span>
                </label>
                <input
                  type="date"
                  value={form.estimatedDateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, estimatedDateOfBirth: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <p className="mt-1 text-xs text-on-surface-variant">
                  Usia akan dihitung secara otomatis dari tanggal ini.
                </p>
              </div>
              <div>
                <label className="text-sm font-bold">Berat (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Contoh: 4.2"
                />
              </div>
              <div>
                <label className="text-sm font-bold">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">—</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold">Gaya Hidup</label>
                <select
                  value={form.lifestyle}
                  onChange={(e) =>
                    setForm({ ...form, lifestyle: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">—</option>
                  {LIFESTYLE_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={form.sterilized}
                  onChange={(e) =>
                    setForm({ ...form, sterilized: e.target.checked })
                  }
                />
                Sudah steril
              </label>
              <div>
                <label className="text-sm font-bold">Catatan</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsAdding(false);
                  }}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-[12px] border border-[#d1d5d2] text-primary font-bold bg-white hover:bg-[#f9f9f9] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-[12px] bg-primary text-white font-bold btn-bounce disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
