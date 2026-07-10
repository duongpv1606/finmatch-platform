"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productsService";
import { ProductCard } from "./ProductCard";

export function TrendingProducts() {
  const { data: cards, isLoading: loadingCards } = useQuery({
    queryKey: ["products", "trending", "card"],
    queryFn: () => getProducts("card"),
  });
  const { data: loans, isLoading: loadingLoans } = useQuery({
    queryKey: ["products", "trending", "loan"],
    queryFn: () => getProducts("loan"),
  });

  const isLoading = loadingCards || loadingLoans;

  // "interestRate" means cashback % for cards (higher = better) but
  // annual rate for loans (lower = better) — so each list is sorted in
  // its own correct direction, not a generic "highest wins" rule.
  const topCards = cards ? [...cards].sort((a, b) => b.interestRate - a.interestRate).slice(0, 3) : [];
  const topLoans = loans ? [...loans].sort((a, b) => a.interestRate - b.interestRate).slice(0, 3) : [];

  return (
    <div className="card">
      <div className="sec-hd">
        <div>
          <div className="sec-eyebrow">Sản phẩm nổi bật</div>
          <h3>Thẻ hoàn tiền cao nhất &amp; Vay lãi suất thấp nhất</h3>
        </div>
        <Link href="/compare">Xem tất cả →</Link>
      </div>

      {isLoading && <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Đang tải…</div>}

      {!isLoading && topCards.length > 0 && (
        <div style={{ marginBottom: topLoans.length > 0 ? 18 : 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
            💳 Top 3 thẻ hoàn tiền cao nhất
          </div>
          <div className="grid3">
            {topCards.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && topLoans.length > 0 && (
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
            🏦 Top 3 vay lãi suất thấp nhất
          </div>
          <div className="grid3">
            {topLoans.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && topCards.length === 0 && topLoans.length === 0 && (
        <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Chưa có sản phẩm nào.</div>
      )}
    </div>
  );
}
