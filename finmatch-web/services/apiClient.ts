// ────────────────────────────────────────────────────────────
// Central API client.
//
// TODAY: every `services/*.ts` file returns mock data (clearly marked
// MOCK below) so the UI is fully functional with zero backend.
//
// TO GO LIVE: implement the NestJS endpoints described in each service
// file's comment block, then flip USE_MOCK to false (or set
// NEXT_PUBLIC_USE_MOCK=false in .env). No component code needs to change
// because components only ever call the exported service functions,
// never fetch() directly.
// ────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? "true") === "true";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Same as apiFetch, but attaches the logged-in user's JWT and surfaces the
 * backend's actual validation message (e.g. "interestRate must not be
 * greater than 100") instead of a generic status text — needed for admin
 * forms where the person needs to know what to fix. */
export async function authedFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  // Lazy import to avoid a circular dependency (authService doesn't need apiClient).
  const { getAccessToken } = await import("./authService");
  const token = getAccessToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new Error(message ?? `Lỗi ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Simulates network latency so loading/skeleton states are testable with mock data. */
export function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
