import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { LoanTypeTabs } from "@/components/loans/LoanTypeTabs";
import { getProducts } from "@/services/productsService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vay vốn",
  description: "So sánh lãi suất vay mua nhà, vay mua ô tô, vay kinh doanh, vay tiêu dùng, vay thế chấp từ các ngân hàng hàng đầu Việt Nam. Cập nhật lãi suất, hạn mức, điều kiện vay realtime.",
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
            So sánh vay mua nhà, mua ô tô, kinh doanh, tiêu dùng và thế chấp từ nhiều ngân hàng — lọc theo đúng nhu cầu của bạn.
          </p>
        </div>
        <LoanTypeTabs products={products} />
      </div>
    </AppShell>
  );
}
