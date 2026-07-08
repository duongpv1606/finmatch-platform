"use client";

import { create } from "zustand";
import { User, UserRole } from "@/types";
import { loadSession, clearSession } from "@/services/authService";

type AuthView = "login" | "register";

interface AppState {
  user: User | null;
  role: UserRole;
  sidebarOpen: boolean;
  lang: "vi" | "en";
  authModalOpen: boolean;
  authView: AuthView;

  setUser: (u: User | null) => void;
  setRole: (r: UserRole) => void;
  toggleSidebar: () => void;
  setLang: (l: "vi" | "en") => void;

  openAuthModal: (view: AuthView) => void;
  closeAuthModal: () => void;
  switchAuthView: (view: AuthView) => void;

  setSession: (user: User) => void;
  logoutLocal: () => void;
  hydrateFromStorage: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  role: "customer",
  sidebarOpen: true,
  lang: "vi",
  authModalOpen: false,
  authView: "login",

  setUser: (user) => set({ user, role: user?.role ?? "customer" }),
  setRole: (role) => set({ role }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setLang: (lang) => set({ lang }),

  openAuthModal: (view) => set({ authModalOpen: true, authView: view }),
  closeAuthModal: () => set({ authModalOpen: false }),
  switchAuthView: (view) => set({ authView: view }),

  setSession: (user) =>
    set({ user, role: user.role, authModalOpen: false }),
  logoutLocal: () => {
    clearSession();
    set({ user: null, role: "customer" });
  },
  hydrateFromStorage: () => {
    const session = loadSession();
    if (session) {
      set({ user: session.user, role: session.user.role });
    }
  },
}));
