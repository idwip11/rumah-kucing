"use client";

import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  userName: string;
  email: string;
  phone: string;
  login: () => void;
  signup: (profile?: { userName?: string; email?: string }) => void;
  logout: () => void;
  updateProfile: (profile: { userName: string; email: string; phone: string }) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  userName: "Imam Dwi",
  email: "imam@example.com",
  phone: "+62 812-3456-7890",
  login: () =>
    set({
      isAuthenticated: true,
      userName: "Imam Dwi",
      email: "imam@example.com",
      phone: "+62 812-3456-7890"
    }),
  signup: (profile) =>
    set({
      isAuthenticated: true,
      userName: profile?.userName || "Pengguna Baru",
      email: profile?.email || "user@example.com",
      phone: ""
    }),
  logout: () => set({ isAuthenticated: false }),
  updateProfile: (profile) => set(profile)
}));
