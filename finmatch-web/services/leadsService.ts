import { ProductCategory } from "@/types";
import { USE_MOCK, apiFetch, authedFetch, mockDelay } from "./apiClient";

export interface CreateLeadInput {
  customerName: string;
  phone: string;
  email?: string;
  productCategory: ProductCategory;
  source: "register" | "ai_chat" | "compare" | "manual";
  score: number;
  region?: string;
}

export interface MarketplaceLead {
  id: string;
  customerNameMasked: string;
  productCategory: ProductCategory;
  score: number;
  price: number;
  status: string;
  region: string;
  source: string;
  createdAt: string;
}

export interface PurchasedLead extends MarketplaceLead {
  customerName: string;
  phone: string;
  email?: string;
}

export async function createLead(input: CreateLeadInput): Promise<void> {
  if (USE_MOCK) {
    await mockDelay(null);
    return;
  }
  // Public endpoint — no auth needed, matches the original's anonymous
  // lead-capture UX (person doesn't need an account to be a lead).
  await apiFetch("/leads", { method: "POST", body: JSON.stringify(input) });
}

export async function getMarketplaceLeads(): Promise<MarketplaceLead[]> {
  if (USE_MOCK) {
    return mockDelay([
      {
        id: "mock-1",
        customerNameMasked: "Nguyễn A***",
        productCategory: "loan",
        score: 85,
        price: 50,
        status: "new",
        region: "Hà Nội",
        source: "ai_chat",
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  return authedFetch<MarketplaceLead[]>("/leads/marketplace");
}

export async function getMyLeads(): Promise<PurchasedLead[]> {
  if (USE_MOCK) return mockDelay([]);
  return authedFetch<PurchasedLead[]>("/leads/my");
}

export async function purchaseLead(id: string): Promise<PurchasedLead> {
  if (USE_MOCK) {
    return mockDelay({
      id,
      customerName: "Nguyễn Văn A",
      phone: "0912345678",
      customerNameMasked: "Nguyễn A***",
      productCategory: "loan",
      score: 85,
      price: 50,
      status: "contacted",
      region: "Hà Nội",
      source: "ai_chat",
      createdAt: new Date().toISOString(),
    });
  }
  return authedFetch<PurchasedLead>(`/leads/${id}/purchase`, { method: "POST" });
}
