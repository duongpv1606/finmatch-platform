// ────────────────────────────────────────────────────────────
// Products service
//
// REAL BACKEND CONTRACT (implement in NestJS):
//   GET  /api/products?category=loan&sort=rate_asc
//   GET  /api/products/:id
//   GET  /api/products/:id/rate-history?months=12
//
// Real rate data has NO official open API from VPBank/MB/Techcombank/
// ACB/Vietcombank. Two realistic paths:
//   1) A crawler service (NestJS cron, e.g. every 30-60min) that scrapes
//      each bank's public rate page and writes into Postgres — respect
//      each bank's robots.txt / ToS, this needs legal sign-off.
//   2) A paid data aggregator (e.g. a fintech data provider) if one
//      covers VN retail rates.
// Until either exists, an admin can enter/update rates via the CMS
// (see app/dashboard/admin) — that's why every FinancialProduct carries
// `updatedAt` and `sourceUrl`, so the UI is honest about data freshness
// even while sourced manually.
// ────────────────────────────────────────────────────────────

import { FinancialProduct, ProductCategory, RateHistoryPoint } from "@/types";
import { USE_MOCK, apiFetch, authedFetch, mockDelay } from "./apiClient";

const MOCK_PRODUCTS: FinancialProduct[] = [
  {
    id: "vcb-home-01",
    category: "loan",
    bankId: "vcb",
    bankName: "Vietcombank",
    bankLogoUrl: "/logos/vcb.svg",
    name: "Vay mua nhà lãi suất ưu đãi",
    interestRate: 6.2,
    minAmount: 200_000_000,
    maxAmount: 15_000_000_000,
    termMonths: 240,
    rating: 4.7,
    reviewCount: 1284,
    tags: ["Ưu đãi năm đầu", "Ân hạn gốc"],
    updatedAt: new Date().toISOString(),
    sourceUrl: "https://portal.vietcombank.com.vn",
  },
  {
    id: "tcb-home-02",
    category: "loan",
    bankId: "tcb",
    bankName: "Techcombank",
    bankLogoUrl: "/logos/tcb.svg",
    name: "Gói vay mua nhà Techcombank Dream",
    interestRate: 6.5,
    minAmount: 300_000_000,
    maxAmount: 20_000_000_000,
    termMonths: 300,
    rating: 4.6,
    reviewCount: 962,
    tags: ["Duyệt nhanh 24h"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mb-card-01",
    category: "card",
    bankId: "mb",
    bankName: "MB Bank",
    bankLogoUrl: "/logos/mb.svg",
    name: "Thẻ tín dụng MB Hoàn Tiền",
    interestRate: 2.5,
    minAmount: 0,
    maxAmount: 200_000_000,
    termMonths: 0,
    rating: 4.5,
    reviewCount: 2043,
    tags: ["Hoàn tiền 5%", "Miễn phí năm đầu"],
    updatedAt: new Date().toISOString(),
  },
];

export async function getProducts(
  category?: ProductCategory
): Promise<FinancialProduct[]> {
  if (USE_MOCK) {
    const data = category
      ? MOCK_PRODUCTS.filter((p) => p.category === category)
      : MOCK_PRODUCTS;
    return mockDelay(data);
  }
  const qs = category ? `?category=${category}` : "";
  return apiFetch<FinancialProduct[]>(`/products${qs}`);
}

export async function getProductById(
  id: string
): Promise<FinancialProduct | undefined> {
  if (USE_MOCK) {
    return mockDelay(MOCK_PRODUCTS.find((p) => p.id === id));
  }
  return apiFetch<FinancialProduct>(`/products/${id}`);
}

export async function getRateHistory(
  productId: string,
  months = 12
): Promise<RateHistoryPoint[]> {
  if (USE_MOCK) {
    const base = MOCK_PRODUCTS.find((p) => p.id === productId)?.interestRate ?? 6.5;
    const points: RateHistoryPoint[] = Array.from({ length: months }).map(
      (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (months - i));
        return {
          date: d.toISOString().slice(0, 7),
          rate: +(base + Math.sin(i / 2) * 0.3).toFixed(2),
        };
      }
    );
    return mockDelay(points);
  }
  return apiFetch<RateHistoryPoint[]>(
    `/products/${productId}/rate-history?months=${months}`
  );
}

// ── Admin-only writes (require admin/super_admin/bank role — enforced by
// the backend's RolesGuard, this is not just a UI-level restriction). ──

export interface CreateProductInput {
  category: FinancialProduct["category"];
  bankId: string;
  bankName: string;
  bankLogoUrl?: string;
  name: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  termMonths?: number;
  tags?: string[];
  sourceUrl?: string;
}

export async function createProduct(input: CreateProductInput): Promise<FinancialProduct> {
  if (USE_MOCK) {
    const product: FinancialProduct = {
      ...input,
      id: crypto.randomUUID(),
      bankLogoUrl: input.bankLogoUrl ?? "",
      termMonths: input.termMonths ?? 0,
      rating: 0,
      reviewCount: 0,
      tags: input.tags ?? [],
      updatedAt: new Date().toISOString(),
    };
    return mockDelay(product);
  }
  return authedFetch<FinancialProduct>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  id: string,
  input: Partial<Pick<CreateProductInput, "interestRate" | "tags" | "sourceUrl">>
): Promise<FinancialProduct> {
  if (USE_MOCK) {
    return mockDelay({ ...MOCK_PRODUCTS[0], ...input, id } as FinancialProduct);
  }
  return authedFetch<FinancialProduct>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockDelay(null);
    return;
  }
  await authedFetch<void>(`/products/${id}`, { method: "DELETE" });
}
