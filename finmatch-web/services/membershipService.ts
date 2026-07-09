import { USE_MOCK, apiFetch, authedFetch, mockDelay } from "./apiClient";

export type MembershipTier = "free" | "pro" | "elite";

export interface MembershipPlan {
  id: MembershipTier;
  name: string;
  priceVnd: number;
  period: string;
  desc: string;
  featured: boolean;
  features: { ok: boolean; text: string }[];
}

export interface MyMembership {
  tier: MembershipTier;
  expiresAt: string | null;
}

export async function getPlans(): Promise<MembershipPlan[]> {
  if (USE_MOCK) {
    return mockDelay([
      {
        id: "free",
        name: "Free",
        priceVnd: 0,
        period: "mãi mãi",
        desc: "Bắt đầu khám phá nền tảng FinMatch AI.",
        featured: false,
        features: [{ ok: true, text: "Tư vấn AI cơ bản" }],
      },
    ]);
  }
  return apiFetch<MembershipPlan[]>("/membership/plans");
}

export async function getMyMembership(): Promise<MyMembership> {
  if (USE_MOCK) return mockDelay({ tier: "free", expiresAt: null });
  return authedFetch<MyMembership>("/membership/me");
}

export async function checkoutStripe(tier: "pro" | "elite"): Promise<string> {
  const res = await authedFetch<{ url: string }>("/payments/stripe/checkout", {
    method: "POST",
    body: JSON.stringify({ tier }),
  });
  return res.url;
}

export async function checkoutVnpay(tier: "pro" | "elite"): Promise<string> {
  const res = await authedFetch<{ url: string }>("/payments/vnpay/checkout", {
    method: "POST",
    body: JSON.stringify({ tier }),
  });
  return res.url;
}
