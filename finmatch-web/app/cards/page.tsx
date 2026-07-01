import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/home/ProductCard";
import { getProducts } from "@/services/productsService";

export default async function CardsPage() {
  const products = await getProducts("card");
  return (
    <AppShell title="Thẻ tín dụng">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="sec-eyebrow">Sản phẩm</div>
          <h3>Thẻ tín dụng</h3>
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
