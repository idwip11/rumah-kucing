"use client";

import { create } from "zustand";

type AuthProfile = {
  userId: string;
  userName: string;
  email: string;
  phone?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  login: (profile: AuthProfile) => void;
  signup: (profile: AuthProfile) => void;
  logout: () => void;
  updateProfile: (profile: {
    userName: string;
    email: string;
    phone: string;
  }) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: "",
  userName: "",
  email: "",
  phone: "",
  login: (profile) =>
    set({
      isAuthenticated: true,
      userId: profile.userId,
      userName: profile.userName,
      email: profile.email,
      phone: profile.phone ?? "",
    }),
  signup: (profile) =>
    set({
      isAuthenticated: true,
      userId: profile.userId,
      userName: profile.userName,
      email: profile.email,
      phone: profile.phone ?? "",
    }),
  logout: () =>
    set({
      isAuthenticated: false,
      userId: "",
      userName: "",
      email: "",
      phone: "",
    }),
  updateProfile: (profile) =>
    set({
      ...profile,
      isAuthenticated: true,
    }),
}));
