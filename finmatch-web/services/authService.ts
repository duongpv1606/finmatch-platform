// ────────────────────────────────────────────────────────────
// Auth service — calls the real NestJS endpoints (already tested via curl
// during deployment: register/login/refresh/me all confirmed working).
//
// Tokens are kept in localStorage (standard for a real deployed web app —
// not a Claude Artifact, so browser storage is fine here) so the person
// stays logged in across page reloads.
// ────────────────────────────────────────────────────────────

import { User, UserRole } from "@/types";
import { API_BASE_URL, USE_MOCK } from "./apiClient";

const ACCESS_TOKEN_KEY = "finmatch_access_token";
const REFRESH_TOKEN_KEY = "finmatch_refresh_token";
const USER_KEY = "finmatch_user";

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

function saveSession(result: AuthResult) {
  localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(result.user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function loadSession(): { user: User; accessToken: string } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  if (!token || !userRaw) return null;
  try {
    return { user: JSON.parse(userRaw), accessToken: token };
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Called automatically by apiClient.authedFetch when a request comes back
 * 401 (access token expired — it only lives 15 minutes). Uses the
 * long-lived refresh token to get a new access token transparently, so
 * the person doesn't get logged out just for staying on a page a while.
 * Returns the new access token, or null if the refresh token is also
 * invalid/expired (caller should then treat this as a real logout). */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const result: AuthResult = await res.json();
    saveSession(result);
    return result.accessToken;
  } catch {
    return null;
  }
}

async function authFetch(path: string, body: unknown): Promise<AuthResult> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message.join(", ") : err.message;
    throw new Error(message ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

export async function getMyProfile(): Promise<(User & { credits: number }) | null> {
  if (USE_MOCK) return null;
  const token = getAccessToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (USE_MOCK) return mockAuth(email, "0900000000", "Người dùng demo", "customer");
  const result = await authFetch("/auth/login", { email, password });
  saveSession(result);
  return result;
}

export async function register(
  name: string,
  email: string,
  phone: string,
  password: string,
  role: UserRole = "customer"
): Promise<AuthResult> {
  if (USE_MOCK) return mockAuth(email, phone, name, role);
  const result = await authFetch("/auth/register", { name, email, phone, password, role });
  saveSession(result);
  return result;
}

export async function logout() {
  const token = getAccessToken();
  clearSession();
  if (!USE_MOCK && token) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {
      /* best-effort — local session is already cleared either way */
    });
  }
}

function mockAuth(email: string, phone: string, name: string, role: UserRole): AuthResult {
  const result: AuthResult = {
    accessToken: "mock-token",
    refreshToken: "mock-refresh",
    user: { id: "mock-user", email, phone, name, role, createdAt: new Date().toISOString() },
  };
  saveSession(result);
  return result;
}
