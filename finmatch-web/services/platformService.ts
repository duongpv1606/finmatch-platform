import { USE_MOCK, apiFetch, authedFetch, mockDelay } from "./apiClient";
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

export interface AdminOverview {
  totalUsers: number;
  leadsThisMonth: number;
  totalLeads: number;
  totalBanks: number;
  topProductName: string | null;
  leadQuality: { high: number; medium: number; low: number };
  monthlyLeads: { month: string; count: number }[];
}

export interface AiOverview {
  chatsToday: number;
  totalLeadsFromAi: number;
  hourlyChats: { hour: number; count: number }[];
  recentActivity: { id: string; text: string; createdAt: string }[];
}

export async function getAdminOverview(): Promise<AdminOverview> {
  return authedFetch<AdminOverview>("/platform/admin-overview");
}

export async function getAiOverview(): Promise<AiOverview> {
  return authedFetch<AiOverview>("/platform/ai-overview");
}
