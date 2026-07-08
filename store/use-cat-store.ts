"use client";

import { create } from "zustand";
import { cats } from "@/lib/mock-data";

type CatProfile = (typeof cats)[number];

type CatState = {
  cats: CatProfile[];
  activeCatId: string;
  setActiveCat: (id: string) => void;
  addCat: (cat: CatProfile) => void;
  activeCat: () => CatProfile;
};

export const useCatStore = create<CatState>((set, get) => ({
  cats,
  activeCatId: cats[0].id,
  setActiveCat: (id) => set({ activeCatId: id }),
  addCat: (cat) =>
    set((state) => ({
      cats: [...state.cats, cat],
      activeCatId: cat.id
    })),
  activeCat: () => {
    const state = get();
    return state.cats.find((cat) => cat.id === state.activeCatId) ?? state.cats[0];
  }
}));
