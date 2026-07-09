import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/home/ProductCard";
import { getProducts } from "@/services/productsService";

export const metadata: Metadata = {
  title: "Đầu tư",
  description: "So sánh sản phẩm đầu tư, quỹ mở, chứng chỉ quỹ phù hợp với khẩu vị rủi ro của bạn.",
  alternates: { canonical: "/invest" },
};

export default async function InvestPage() {
  const products = await getProducts("invest");
  return (
    <AppShell title="Đầu tư">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="sec-eyebrow">Sản phẩm</div>
          <h3>Đầu tư</h3>
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
