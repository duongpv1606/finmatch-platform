// ────────────────────────────────────────────────────────────
// Recommendation service.
//
// REAL BACKEND: POST /api/recommendations — deterministic scoring against
// real loan products in Postgres, plus LLM-generated natural-language
// reasoning (see finmatch-api/src/recommendation/recommendation.service.ts).
// This replaces the original HTML's client-side fake math + hardcoded
// 4-bank pool with real data + real AI.
// ────────────────────────────────────────────────────────────

import { AIRecommendationInput, RecommendationResponse } from "@/types";
import { USE_MOCK, apiFetch, mockDelay } from "./apiClient";

export async function getRecommendation(
  input: AIRecommendationInput
): Promise<RecommendationResponse> {
  if (USE_MOCK) {
    return mockDelay(buildMockResponse(input), 900);
  }
  return apiFetch<RecommendationResponse>("/recommendations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

function buildMockResponse(input: AIRecommendationInput): RecommendationResponse {
  const dtiPct = Math.round((input.debt / Math.max(input.income, 1)) * 100);
  return {
    matchScore: 87,
    affordability: 90,
    debtSafety: 82,
    approval: 88,
    healthGrade: "A",
    dtiPct,
    maxEMI: Math.round(input.income * 0.4 - input.debt),
    aiSummary:
      "Đây là dữ liệu mẫu (chế độ demo) — kết nối backend thật để có phân tích dựa trên sản phẩm và AI thật.",
    topMatches: [
      {
        product: {
          id: "mock-1",
          category: "loan",
          bankId: "vcb",
          bankName: "Vietcombank",
          bankLogoUrl: "",
          name: "Vay mua nhà lãi suất ưu đãi",
          interestRate: 6.2,
          minAmount: 200_000_000,
          maxAmount: 15_000_000_000,
          termMonths: 240,
          rating: 4.7,
          reviewCount: 1284,
          tags: ["Ưu đãi năm đầu"],
          updatedAt: new Date().toISOString(),
        },
        score: 91,
        reasons: ["Lãi suất cạnh tranh nhất nhóm", "Phù hợp hạn mức vay đề xuất"],
      },
    ],
  };
}
