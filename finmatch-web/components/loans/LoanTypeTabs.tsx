"use client";

import { useState } from "react";
import { FinancialProduct, LoanType, LOAN_TYPE_LABEL } from "@/types";
import { ProductCard } from "@/components/home/ProductCard";

const TABS: { id: LoanType | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "mua_nha", label: LOAN_TYPE_LABEL.mua_nha },
  { id: "mua_oto", label: LOAN_TYPE_LABEL.mua_oto },
  { id: "kinh_doanh", label: LOAN_TYPE_LABEL.kinh_doanh },
  { id: "tieu_dung", label: LOAN_TYPE_LABEL.tieu_dung },
  { id: "the_chap", label: LOAN_TYPE_LABEL.the_chap },
];

export function LoanTypeTabs({ products }: { products: FinancialProduct[] }) {
  const [tab, setTab] = useState<LoanType | "all">("all");

  const filtered = tab === "all" ? products : products.filter((p) => p.loanType === tab);

  return (
    <div>
      <div className="tabs" style={{ flexWrap: "wrap", maxWidth: "none" }}>
        {TABS.map((t) => (
          <div key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>
      <div className="grid3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {filtered.length === 0 && (
          <div style={{ color: "var(--gray-400)", fontSize: 13 }}>
            Chưa có sản phẩm nào ở loại vay này.
          </div>
        )}
      </div>
    </div>
  );
}
