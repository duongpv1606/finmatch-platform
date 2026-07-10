// ────────────────────────────────────────────────────────────
// FinMatch AI — Core domain types
// These mirror the data model the future NestJS API will expose.
// Keeping them centralized means swapping mock services for real
// HTTP calls later requires touching only /services, not components.
// ────────────────────────────────────────────────────────────

export type UserRole =
  | "customer"
  | "sale"
  | "agency"
  | "bank"
  | "admin"
  | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export type ProductCategory =
  | "loan"
  | "card"
  | "insurance"
  | "invest"
  | "savings";

export type LoanType = "mua_nha" | "mua_oto" | "kinh_doanh" | "tieu_dung" | "the_chap";

export const LOAN_TYPE_LABEL: Record<LoanType, string> = {
  mua_nha: "Vay mua nhà",
  mua_oto: "Vay mua ô tô",
  kinh_doanh: "Vay kinh doanh",
  tieu_dung: "Vay tiêu dùng",
  the_chap: "Vay thế chấp",
};

// Consumer-finance companies never offer secured/mortgage loans — mirrors
// the same real rule enforced server-side in ProductsService.
export const CONSUMER_FINANCE_BANK_IDS = ["mcredit", "hd-saison", "fe-credit", "mirae-asset"];

export interface FinancialProduct {
  id: string;
  category: ProductCategory;
  loanType?: LoanType; // only meaningful when category === "loan"
  bankId: string;
  bankName: string;
  bankLogoUrl: string;
  name: string;
  interestRate: number; // annual %, from bank data source
  minAmount: number;
  maxAmount: number;
  termMonths: number;
  rating: number; // 0-5
  reviewCount: number;
  tags: string[];
  updatedAt: string; // last time the rate was refreshed by the crawler/cron
  sourceUrl?: string; // where the rate was sourced from (for transparency)
}

export interface RateHistoryPoint {
  date: string; // ISO date
  rate: number;
}

export interface GoldPrice {
  brand: "SJC" | "DOJI" | "PNJ";
  buy: number;
  sell: number;
  updatedAt: string;
}

export interface ExchangeRate {
  currency: string; // USD, EUR, JPY...
  buy: number;
  sell: number;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  source: string; // CafeF, VnEconomy, Vietstock...
  url: string;
  publishedAt: string;
}

export interface ChatResultCard {
  title: string;
  rows: [string, string, "good" | null][]; // [label, value, style]
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  streaming?: boolean;
  result?: ChatResultCard;
}

export interface AIRecommendationInput {
  income: number; // triệu VND / tháng
  savings: number; // triệu VND
  debt: number; // triệu VND / tháng (existing debt repayment)
  occupation: string;
  age: number;
  loanAmount: number; // triệu VND
  creditHistory: "none" | "good" | "average" | "poor";
  goal: string;
}

export interface RecommendationMatch {
  product: FinancialProduct;
  score: number; // 0-100, deterministic
  reasons: string[]; // AI-generated natural language reasons
}

export interface RecommendationResponse {
  matchScore: number; // 0-100 — overall fit for the #1 result
  affordability: number; // 0-100
  debtSafety: number; // 0-100
  approval: number; // 0-100 — estimated approval odds
  healthGrade: "A+" | "A" | "B+" | "B" | "C+";
  dtiPct: number;
  maxEMI: number; // triệu VND/month
  topMatches: RecommendationMatch[]; // ranked, best first
  aiSummary: string; // LLM-generated natural-language explanation
}

export interface AIRecommendationResult {
  product: FinancialProduct;
  score: number; // 0-100
  reasons: string[];
}

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export interface Lead {
  id: string;
  customerName: string;
  phone: string;
  source: "register" | "ai_chat" | "compare" | "manual";
  productCategory: ProductCategory;
  score: number; // 0-100 AI lead score
  price: number; // VND, marketplace price
  status: LeadStatus;
  region: string;
  assignedBankId?: string;
  assignedSaleId?: string;
  createdAt: string;
}

export interface FinancialHealth {
  score: number; // 0-100
  label: string;
}
