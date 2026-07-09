"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productsService";
import { ProductCard } from "./ProductCard";

const VISIBLE_LIMIT = 6;

export function TrendingProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "trending"],
    queryFn: () => getProducts(),
  });

  // "Đánh giá cao nhất" — rank by rating first, then by best (lowest) rate
  // as a tiebreaker, and only show the top 6; the rest are one click away
  // via "Xem tất cả" instead of dumping the whole catalog on the homepage.
  const ranked = data
    ? [...data].sort((a, b) => b.rating - a.rating || a.interestRate - b.interestRate)
    : undefined;
  const visible = ranked?.slice(0, VISIBLE_LIMIT);

  return (
    <div className="card">
      <div className="sec-hd">
        <div>
          <div className="sec-eyebrow">Sản phẩm nổi bật</div>
          <h3>Được đánh giá cao nhất tuần này</h3>
        </div>
        <Link href="/compare">Xem tất cả →</Link>
      </div>
      <div className="grid3">
        {isLoading && <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Đang tải…</div>}
        {visible?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {visible?.length === 0 && (
          <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Chưa có sản phẩm nào.</div>
        )}
      </div>
    </div>
  );
}
