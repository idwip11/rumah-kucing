"use client";

import { create } from "zustand";

export type CatProfile = {
  id: string;
  name: string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  sterilized: boolean;
  lifestyle: string;
  note: string;
};

type CatState = {
  cats: CatProfile[];
  activeCatId: string | null;
  setActiveCat: (id: string) => void;
  addCat: (cat: CatProfile) => void;
  setCats: (cats: CatProfile[]) => void;
  activeCat: () => CatProfile | null;
};

export const useCatStore = create<CatState>((set, get) => ({
  cats: [],
  activeCatId: null,
  setActiveCat: (id) => set({ activeCatId: id }),
  addCat: (cat) =>
    set((state) => ({
      cats: [...state.cats, cat],
      activeCatId: state.activeCatId ?? cat.id,
    })),
  setCats: (cats) =>
    set((state) => ({
      cats,
      activeCatId:
        cats.length > 0
          ? state.activeCatId && cats.find((c) => c.id === state.activeCatId)
            ? state.activeCatId
            : cats[0].id
          : null,
    })),
  activeCat: () => {
    const state = get();
    if (state.cats.length === 0) return null;
    return state.cats.find((cat) => cat.id === state.activeCatId) ?? state.cats[0];
  },
}));
