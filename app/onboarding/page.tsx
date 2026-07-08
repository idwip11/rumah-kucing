"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, ChevronRight, Cat, Home, Scale, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatStore } from "@/store/use-cat-store";
import { useRouter } from "next/navigation";
import { addCat as addCatServer } from "@/app/actions/cats";

const steps = ["Identitas", "Kondisi", "Kebiasaan"];

export default function OnboardingPage() {
  const router = useRouter();
  const addCatLocal = useCatStore((state) => state.addCat);
  const [step, setStep] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    name: "Luna",
    breed: "Maine Coon",
    age: "1 tahun",
    weight: "4.1 kg",
    gender: "Betina",
    sterilized: "Belum",
    lifestyle: "Indoor",
    note: "Baru adaptasi dengan makanan basah"
  });

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    setIsPending(true);
    try {
      // Save to database
      await addCatServer({
        name: form.name,
        breedSlug: form.breed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        ageLabel: form.age,
        weightKg: parseFloat(form.weight.replace(",", ".")) || undefined,
        gender: form.gender as "Betina" | "Jantan",
        sterilized: form.sterilized === "Sudah",
        lifestyle: form.lifestyle as any,
        notes: form.note
      });

      // Update local zustand store for immediate UI update
      addCatLocal({
        id: form.name.toLowerCase().replace(/\s+/g, "-") || "kucing-baru",
        name: form.name,
        breed: form.breed,
        age: form.age,
        weight: form.weight,
        gender: form.gender,
        sterilized: form.sterilized === "Sudah",
        lifestyle: form.lifestyle,
        note: form.note
      });

      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan profil: " + (error as Error).message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-bold text-primary">Onboarding profil</p>
        <h1 className="mt-2 text-3xl font-bold">Buat data dasar kucing</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Data ini menjadi konteks utama untuk Ketty AI, timeline, dan rekomendasi produk yang
          muncul nanti.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-6 space-y-3">
            {steps.map((label, index) => (
              <button
                type="button"
                key={label}
                onClick={() => setStep(index)}
                className="flex w-full items-center gap-3 rounded-md p-3 text-left transition hover:bg-muted"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-bold">
                  {index < step ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-bold">{label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {index === 0 && "Nama, ras, umur"}
                    {index === 1 && "Berat, steril, jenis kelamin"}
                    {index === 2 && "Gaya hidup dan catatan"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 shadow-sm">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama kucing" value={form.name} onChange={(value) => updateField("name", value)} icon={Cat} />
              <Select
                label="Ras"
                value={form.breed}
                options={[
                  "Persian",
                  "Maine Coon",
                  "Ragdoll",
                  "Norwegian Forest Cat & Siberian",
                  "Birman (Sacred Birman)",
                  "British Shorthair",
                  "American Shorthair",
                  "Siamese",
                  "Abyssinian",
                  "Russian Blue",
                  "Sphynx",
                  "Exotic Shorthair",
                  "Scottish Fold / Straight",
                  "Munchkin",
                  "Devon Rex & Cornish Rex",
                  "Bengal",
                  "Savannah",
                  "Domestis / Lokal"
                ]}
                onChange={(value) => updateField("breed", value)}
              />
              <Field label="Umur" value={form.age} onChange={(value) => updateField("age", value)} icon={Home} />
              <Select
                label="Jenis kelamin"
                value={form.gender}
                options={["Betina", "Jantan"]}
                onChange={(value) => updateField("gender", value)}
              />
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Berat badan" value={form.weight} onChange={(value) => updateField("weight", value)} icon={Scale} />
              <Select
                label="Status steril"
                value={form.sterilized}
                options={["Belum", "Sudah"]}
                onChange={(value) => updateField("sterilized", value)}
              />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <Select
                label="Gaya hidup"
                value={form.lifestyle}
                options={["Indoor", "Outdoor", "Indoor + balkon", "Campuran"]}
                onChange={(value) => updateField("lifestyle", value)}
              />
              <label className="block">
                <span className="text-sm font-bold">Catatan penting</span>
                <textarea
                  className="mt-2 min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={form.note}
                  onChange={(event) => updateField("note", event.target.value)}
                />
              </label>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
            >
              Kembali
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === steps.length - 1 ? "Simpan profil" : "Lanjut"}
              {!isPending && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  icon: Icon
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: typeof Cat;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <span className="mt-2 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <select
        className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
