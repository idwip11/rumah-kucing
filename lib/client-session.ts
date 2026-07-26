"use client";

import { useAuthStore } from "@/store/use-auth-store";
import { useCatStore, type CatProfile } from "@/store/use-cat-store";
import { useCartStore } from "@/store/use-cart-store";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

type ApiCat = {
  id: string;
  name: string;
  breed?: { name?: string | null } | string | null;
  ageLabel?: string | null;
  estimatedDateOfBirth?: string | null;
  weightKg?: number | string | null;
  gender?: string | null;
  sterilized?: boolean | null;
  lifestyle?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
};

function mapCatProfile(cat: ApiCat): CatProfile {
  return {
    id: cat.id,
    name: cat.name,
    breed:
      typeof cat.breed === "object" && cat.breed
        ? (cat.breed.name ?? "Campuran")
        : (cat.breed ?? "Campuran"),
    age: cat.ageLabel ?? "-",
    estimatedDateOfBirth: cat.estimatedDateOfBirth ?? null,
    weight: cat.weightKg != null ? `${cat.weightKg} kg` : "-",
    gender: cat.gender ?? "",
    sterilized: cat.sterilized ?? false,
    lifestyle: cat.lifestyle ?? "",
    note: cat.notes ?? "",
    photoUrl: cat.photoUrl ?? null,
  };
}

export function clearAuthenticatedClientState() {
  useCatStore.getState().setCats([]);
  useCartStore.getState().clearForGuest();
  useAuthStore.getState().logout();
}

export async function hydrateAuthenticatedClientState() {
  const meResponse = await fetch("/api/auth/me", {
    cache: "no-store",
    credentials: "include",
  });
  const meData = await meResponse.json().catch(() => null);

  if (!meResponse.ok || !meData?.user) {
    clearAuthenticatedClientState();
    return null;
  }

  const user = meData.user as SessionUser;
  const catsResponse = await fetch("/api/cats", {
    cache: "no-store",
    credentials: "include",
  });

  if (catsResponse.status === 401) {
    clearAuthenticatedClientState();
    return null;
  }

  if (!catsResponse.ok) {
    throw new Error("Gagal memuat profil kucing pengguna.");
  }

  const cats = (await catsResponse.json().catch(() => [])) as ApiCat[];
  const profiles = Array.isArray(cats) ? cats.map(mapCatProfile) : [];

  useAuthStore.getState().login({
    userId: user.id,
    userName: user.name,
    email: user.email,
    phone: user.phone ?? "",
  });
  useCatStore.getState().setCats(profiles);
  useCartStore.getState().loadForUser(user.id);

  return { user, cats: profiles };
}
