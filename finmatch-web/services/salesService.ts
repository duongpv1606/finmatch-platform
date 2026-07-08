import { authedFetch, mockDelay, USE_MOCK } from "./apiClient";
import { PurchasedLead } from "./leadsService";

export interface SaleStats {
  totalPurchased: number;
  leadsThisMonth: number;
  converted: number;
  lost: number;
  conversionRate: number;
  byStatus: Record<string, number>;
  monthly: { month: string; count: number }[];
  rank: number | null;
  totalSales: number;
}

export async function getSaleStats(): Promise<SaleStats> {
  if (USE_MOCK) {
    return mockDelay({
      totalPurchased: 0,
      leadsThisMonth: 0,
      converted: 0,
      lost: 0,
      conversionRate: 0,
      byStatus: { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 },
      monthly: [],
      rank: null,
      totalSales: 0,
    });
  }
  return authedFetch<SaleStats>("/leads/stats");
}

export async function updateLeadCrm(
  id: string,
  input: { status?: string; notes?: string }
): Promise<PurchasedLead> {
  if (USE_MOCK) return mockDelay({} as PurchasedLead);
  return authedFetch<PurchasedLead>(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function generateSaleContent(
  id: string,
  type: "sms" | "email" | "zalo" | "call"
): Promise<string> {
  if (USE_MOCK) {
    return mockDelay(
      "Đây là nội dung mẫu (chế độ demo) — kết nối AI thật để có nội dung cá nhân hóa theo từng lead."
    );
  }
  const res = await authedFetch<{ content: string }>(`/leads/${id}/content/${type}`, {
    method: "POST",
  });
  return res.content;
}
