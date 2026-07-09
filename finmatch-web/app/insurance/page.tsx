import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/home/ProductCard";
import { getProducts } from "@/services/productsService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bảo hiểm",
  description: "So sánh sản phẩm bảo hiểm nhân thọ, sức khỏe, tài sản từ các công ty bảo hiểm uy tín.",
  alternates: { canonical: "/insurance" },
};

export default async function InsurancePage() {
  const products = await getProducts("insurance");
  return (
    <AppShell title="Bảo hiểm">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="sec-eyebrow">Sản phẩm</div>
          <h3>Bảo hiểm</h3>
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
