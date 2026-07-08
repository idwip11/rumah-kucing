"use client";

import { Activity, Cat, CircleCheck, Scale } from "lucide-react";
import { useCatStore } from "@/store/use-cat-store";
import { cn } from "@/lib/utils";

export function CatProfileCard({ compact = false }: { compact?: boolean }) {
  const cats = useCatStore((state) => state.cats);
  const activeCatId = useCatStore((state) => state.activeCatId);
  const setActiveCat = useCatStore((state) => state.setActiveCat);
  const activeCat = useCatStore((state) => state.activeCat());

  if (!activeCat) {
    return (
      <section className={cn("flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center shadow-sm", compact && "p-6")}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Cat className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-bold">Belum ada profil kucing</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tambahkan profil kucing pertama kamu untuk mulai memantau kebutuhannya.
        </p>
      </section>
    );
  }

  return (
    <section className={cn("rounded-lg border border-border bg-card p-4 shadow-sm", compact && "p-3")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-teal-100 text-teal-800">
            <Cat className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Profil aktif
            </p>
            <h2 className="text-xl font-bold leading-tight">{activeCat.name}</h2>
            <p className="text-sm text-muted-foreground">
              {activeCat.breed} · {activeCat.age}
            </p>
          </div>
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none ring-offset-background focus:ring-2 focus:ring-ring"
          value={activeCatId}
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

      {!compact && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-muted p-3">
            <Scale className="mb-2 h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">Berat</p>
            <p className="font-semibold">{activeCat.weight}</p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <CircleCheck className="mb-2 h-4 w-4 text-emerald-700" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">Steril</p>
            <p className="font-semibold">{activeCat.sterilized ? "Sudah" : "Belum"}</p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <Activity className="mb-2 h-4 w-4 text-amber-700" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">Gaya hidup</p>
            <p className="font-semibold">{activeCat.lifestyle}</p>
          </div>
        </div>
      )}
    </section>
  );
}
