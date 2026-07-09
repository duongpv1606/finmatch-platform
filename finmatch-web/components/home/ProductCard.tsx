import { FinancialProduct } from "@/types";
import { BankLogo } from "@/components/shared/BankLogo";

export function ProductCard({ product }: { product: FinancialProduct }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <BankLogo name={product.bankName} logoUrl={product.bankLogoUrl} size={32} />
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-600)" }}>
          {product.bankName}
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4, color: "var(--navy)" }}>
        {product.name}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "var(--blue)", marginBottom: 4 }}>
        {product.interestRate}%<span style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-400)" }}>/năm</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {product.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: "var(--blue-light)",
              color: "var(--blue)",
              padding: "3px 8px",
              borderRadius: 20,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
        Cập nhật {new Date(product.updatedAt).toLocaleDateString("vi-VN")}
        {product.sourceUrl ? " · nguồn ngân hàng" : " · nhập CMS"}
      </div>
    </div>
  );
}
