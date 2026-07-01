"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productsService";
import { ProductCard } from "./ProductCard";

export function TrendingProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "trending"],
    queryFn: () => getProducts(),
  });

  return (
    <div className="card">
      <div className="sec-hd">
        <div>
          <div className="sec-eyebrow">Sản phẩm nổi bật</div>
          <h3>Được đánh giá cao nhất tuần này</h3>
        </div>
        <a>Xem tất cả →</a>
      </div>
      <div className="grid3">
        {isLoading && <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Đang tải…</div>}
        {data?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
