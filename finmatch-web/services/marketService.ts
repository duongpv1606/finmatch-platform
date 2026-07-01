// ────────────────────────────────────────────────────────────
// Market data service — gold price, exchange rate, news feed.
//
// REAL SOURCES TO WIRE UP:
//   Gold (SJC/DOJI/PNJ):  no single official free API; realistic option
//     is a small NestJS cron job scraping public price pages every
//     15-30min, OR a paid provider if available.
//   Exchange rate: State Bank of Vietnam publishes a daily reference
//     rate feed; also see exchangerate-api.com for USD/EUR/JPY etc.
//   News: RSS from CafeF, VnEconomy, Vietstock, Google News — a NestJS
//     cron parses the RSS/Atom feeds into Postgres every 30-60min.
//
// Endpoints once backend exists:
//   GET /api/market/gold
//   GET /api/market/fx
//   GET /api/news?limit=10
// ────────────────────────────────────────────────────────────

import { ExchangeRate, GoldPrice, NewsArticle } from "@/types";
import { USE_MOCK, apiFetch, mockDelay } from "./apiClient";

export async function getGoldPrices(): Promise<GoldPrice[]> {
  if (USE_MOCK) {
    return mockDelay([
      { brand: "SJC", buy: 88_500_000, sell: 90_000_000, updatedAt: new Date().toISOString() },
      { brand: "DOJI", buy: 88_400_000, sell: 89_900_000, updatedAt: new Date().toISOString() },
      { brand: "PNJ", buy: 88_300_000, sell: 89_800_000, updatedAt: new Date().toISOString() },
    ]);
  }
  return apiFetch<GoldPrice[]>("/market/gold");
}

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  if (USE_MOCK) {
    return mockDelay([
      { currency: "USD", buy: 25280, sell: 25680, updatedAt: new Date().toISOString() },
      { currency: "EUR", buy: 27100, sell: 27650, updatedAt: new Date().toISOString() },
      { currency: "JPY", buy: 162, sell: 168, updatedAt: new Date().toISOString() },
    ]);
  }
  return apiFetch<ExchangeRate[]>("/market/fx");
}

export async function getNews(limit = 6): Promise<NewsArticle[]> {
  if (USE_MOCK) {
    const items: NewsArticle[] = Array.from({ length: limit }).map((_, i) => ({
      id: `news-${i}`,
      title: `Tin tài chính mẫu #${i + 1} — thay bằng RSS thật (CafeF/VnEconomy)`,
      summary: "Tóm tắt bài viết sẽ được lấy tự động từ RSS feed khi backend sẵn sàng.",
      imageUrl: `/logos/placeholder-news.svg`,
      source: i % 2 === 0 ? "CafeF" : "VnEconomy",
      url: "#",
      publishedAt: new Date().toISOString(),
    }));
    return mockDelay(items);
  }
  return apiFetch<NewsArticle[]>(`/news?limit=${limit}`);
}
