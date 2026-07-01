"use client";

import { create } from "zustand";
import { User, UserRole } from "@/types";

interface AppState {
  user: User | null;
  role: UserRole;
  sidebarOpen: boolean;
  lang: "vi" | "en";
  setUser: (u: User | null) => void;
  setRole: (r: UserRole) => void;
  toggleSidebar: () => void;
  setLang: (l: "vi" | "en") => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  role: "customer",
  sidebarOpen: true,
  lang: "vi",
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setLang: (lang) => set({ lang }),
}));
