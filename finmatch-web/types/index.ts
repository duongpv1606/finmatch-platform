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

export interface FinancialProduct {
  id: string;
  category: ProductCategory;
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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  streaming?: boolean;
}

export interface AIRecommendationInput {
  income: number;
  occupation: string;
  age: number;
  loanAmount: number;
  creditHistory: "none" | "good" | "average" | "poor";
  goal: string;
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
