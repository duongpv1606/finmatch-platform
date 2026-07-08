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

async function authFetch(path: string, body: unknown): Promise<AuthResult> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (USE_MOCK) return mockAuth(email, "Người dùng demo", "customer");
  const result = await authFetch("/auth/login", { email, password });
  saveSession(result);
  return result;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole = "customer"
): Promise<AuthResult> {
  if (USE_MOCK) return mockAuth(email, name, role);
  const result = await authFetch("/auth/register", { name, email, password, role });
  saveSession(result);
  return result;
}

/** Demo quick-login: tries to log in with a fixed demo account for the given
 * role; if it doesn't exist yet on this backend, registers it first. Lets
 * the "Demo nhanh" buttons in the auth modal work without manual seeding. */
export async function quickLogin(role: "customer" | "sale"): Promise<AuthResult> {
  const email = `demo-${role}@finmatch.vn`;
  const password = "Demo@12345";
  const name = role === "sale" ? "Sale Demo" : "Khách hàng Demo";
  try {
    return await login(email, password);
  } catch {
    return await register(name, email, password, role);
  }
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

function mockAuth(email: string, name: string, role: UserRole): AuthResult {
  const result: AuthResult = {
    accessToken: "mock-token",
    refreshToken: "mock-refresh",
    user: { id: "mock-user", email, name, role, createdAt: new Date().toISOString() },
  };
  saveSession(result);
  return result;
}
