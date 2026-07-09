import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/home/ProductCard";
import { getProducts } from "@/services/productsService";

export const metadata: Metadata = {
  title: "Vay vốn",
  description: "So sánh lãi suất vay mua nhà, vay tiêu dùng từ các ngân hàng hàng đầu Việt Nam. Cập nhật lãi suất, hạn mức, điều kiện vay realtime.",
  alternates: { canonical: "/loans" },
};

export default async function LoansPage() {
  const products = await getProducts("loan");
  return (
    <AppShell title="Vay vốn">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="sec-eyebrow">Sản phẩm</div>
          <h3>Vay vốn</h3>
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
