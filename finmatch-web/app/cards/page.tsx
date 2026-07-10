import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/home/ProductCard";
import { getProducts } from "@/services/productsService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thẻ tín dụng",
  description: "So sánh thẻ tín dụng hoàn tiền, miễn phí năm đầu, ưu đãi tốt nhất từ các ngân hàng Việt Nam.",
  alternates: { canonical: "/cards" },
};

export default async function CardsPage() {
  const products = await getProducts("card");
  // "interestRate" doubles as cashback % for cards — higher is better,
  // opposite direction from loans/savings where lower is better.
  const sorted = [...products].sort((a, b) => b.interestRate - a.interestRate);
  return (
    <AppShell title="Thẻ tín dụng">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="sec-eyebrow">Sản phẩm</div>
          <h3>Thẻ tín dụng</h3>
          <p className="text-sm text-muted">
            Sắp xếp theo % hoàn tiền cao nhất — cập nhật realtime từ hệ thống.
          </p>
        </div>
        <div className="grid3">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {sorted.length === 0 && (
            <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Chưa có sản phẩm nào.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
