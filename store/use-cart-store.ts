"use client";

import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  price: number; // in IDR
  imageUrl?: string | null;
  quantity: number;
};

type CartState = {
  userId: string | null;
  items: CartItem[];
  loadForUser: (userId: string) => void;
  clearForGuest: () => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

const LEGACY_CART_KEY = "rumah-kucing-cart";

function getCartKey(userId: string) {
  return `rumah-kucing-cart:${userId}`;
}

function readCart(userId: string) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getCartKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as { items?: CartItem[] } | CartItem[];
    return Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.items)
        ? parsed.items
        : [];
  } catch {
    return [];
  }
}

function writeCart(userId: string, items: CartItem[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(getCartKey(userId), JSON.stringify({ items }));
}

function clearLegacyCart() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LEGACY_CART_KEY);
}

export const useCartStore = create<CartState>((set, get) => ({
  userId: null,
  items: [],
  loadForUser: (userId) => {
    clearLegacyCart();
    set({ userId, items: readCart(userId) });
  },
  clearForGuest: () => {
    clearLegacyCart();
    set({ userId: null, items: [] });
  },
  addItem: (item, qty = 1) =>
    set((state) => {
      if (!state.userId) return state;

      const existing = state.items.find((i) => i.id === item.id);
      const items = existing
        ? state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + qty } : i,
          )
        : [...state.items, { ...item, quantity: qty }];

      writeCart(state.userId, items);
      return { items };
    }),
  removeItem: (id) =>
    set((state) => {
      if (!state.userId) return state;

      const items = state.items.filter((i) => i.id !== id);
      writeCart(state.userId, items);
      return { items };
    }),
  updateQty: (id, qty) =>
    set((state) => {
      if (!state.userId) return state;

      const items = state.items.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, qty) } : i,
      );
      writeCart(state.userId, items);
      return { items };
    }),
  clear: () =>
    set((state) => {
      if (state.userId && typeof window !== "undefined") {
        window.localStorage.removeItem(getCartKey(state.userId));
      }
      return { items: [] };
    }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
