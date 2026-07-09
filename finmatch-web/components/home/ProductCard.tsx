"use client";

import { useRouter } from "next/navigation";
import { FinancialProduct } from "@/types";
import { BankLogo } from "@/components/shared/BankLogo";
import { useAppStore } from "@/store/useAppStore";

export function ProductCard({ product }: { product: FinancialProduct }) {
  const router = useRouter();
  const { openQuickLeadModal } = useAppStore();
  const aiScore = Math.round((product.rating / 5) * 100) || 70; // fallback so a 0-rating seed product still shows a sensible bar

  return (
    <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column" }}>
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
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
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

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 4 }}>
          <span style={{ color: "var(--gray-400)", fontWeight: 600 }}>AI Score</span>
          <span style={{ color: "var(--emerald-dark)", fontWeight: 700 }}>{aiScore}%</span>
        </div>
        <div style={{ height: 5, background: "var(--gray-100)", borderRadius: 20 }}>
          <div style={{ height: "100%", width: `${aiScore}%`, background: "var(--emerald)", borderRadius: 20 }} />
        </div>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--gray-400)", marginBottom: 10 }}>
        Cập nhật {new Date(product.updatedAt).toLocaleDateString("vi-VN")}
        {product.sourceUrl ? " · nguồn ngân hàng" : " · nhập CMS"}
      </div>

      <div style={{ display: "flex", gap: 7, marginTop: "auto" }}>
        <button
          onClick={() => router.push(`/ai?q=${encodeURIComponent(`Tư vấn giúp tôi về ${product.name} của ${product.bankName}`)}`)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            background: "var(--blue-light)",
            color: "var(--blue)",
            border: "none",
            borderRadius: 8,
            padding: "9px 8px",
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <i className="ti ti-sparkles" style={{ fontSize: 13 }} />
          Hỏi AI
        </button>
        <button
          onClick={openQuickLeadModal}
          style={{
            flex: 1,
            background: "var(--emerald)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "9px 8px",
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Đăng ký ngay →
        </button>
      </div>
    </div>
  );
}
