import { USE_MOCK, apiFetch, mockDelay } from "./apiClient";
import { FinancialProduct } from "@/types";

export interface PlatformStats {
  totalCustomers: number;
  totalLeads: number;
  totalConverted: number;
  totalBanks: number;
  topProducts: FinancialProduct[];
}

export interface PartnerLogo {
  bankId: string;
  bankName: string;
  bankLogoUrl: string;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  if (USE_MOCK) {
    return mockDelay({
      totalCustomers: 0,
      totalLeads: 0,
      totalConverted: 0,
      totalBanks: 0,
      topProducts: [],
    });
  }
  return apiFetch<PlatformStats>("/platform/stats");
}

export async function getPartnerLogos(): Promise<PartnerLogo[]> {
  if (USE_MOCK) return mockDelay([]);
  return apiFetch<PartnerLogo[]>("/platform/partner-logos");
}
