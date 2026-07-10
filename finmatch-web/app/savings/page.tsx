import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/home/ProductCard";
import { getProducts } from "@/services/productsService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tiết kiệm",
  description: "So sánh lãi suất tiết kiệm các kỳ hạn từ ngân hàng — tìm mức lãi suất tốt nhất cho khoản tiết kiệm của bạn.",
  alternates: { canonical: "/savings" },
};

export default async function SavingsPage() {
  const products = await getProducts("savings");
  // Savings interest — unlike loans, higher is better for the saver.
  const sorted = [...products].sort((a, b) => b.interestRate - a.interestRate);
  return (
    <AppShell title="Tiết kiệm">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="sec-eyebrow">Sản phẩm</div>
          <h3>Tiết kiệm</h3>
          <p className="text-sm text-muted">
            Sắp xếp theo lãi suất cao nhất — cập nhật realtime từ hệ thống.
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
