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
  return (
    <AppShell title="Tiết kiệm">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="sec-eyebrow">Sản phẩm</div>
          <h3>Tiết kiệm</h3>
          <p className="text-sm text-muted">
            Danh sách lấy trực tiếp từ services/productsService — sẵn sàng
            nối API ngân hàng thật, hiện đang dùng dữ liệu mẫu.
          </p>
        </div>
        <div className="grid3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
