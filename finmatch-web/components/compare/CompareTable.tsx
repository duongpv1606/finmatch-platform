"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProductCategory } from "@/types";
import { getProducts } from "@/services/productsService";

const TABS: { id: ProductCategory; label: string }[] = [
  { id: "loan", label: "Vay mua nhà" },
  { id: "card", label: "Thẻ tín dụng" },
  { id: "insurance", label: "Bảo hiểm" },
  { id: "savings", label: "Tiết kiệm" },
];

export function CompareTable() {
  const [tab, setTab] = useState<ProductCategory>("loan");
  const { data } = useQuery({
    queryKey: ["products", "compare", tab],
    queryFn: () => getProducts(tab),
  });

  return (
    <>
      <div className="tabs" style={{ maxWidth: 500 }}>
        {TABS.map((t) => (
          <div
            key={t.id}
            className={`tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap" style={{ overflowX: "auto" }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Ngân hàng</th>
                <th>Sản phẩm</th>
                <th>Lãi suất</th>
                <th>Hạn mức</th>
                <th>Đánh giá</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.bankName}</td>
                  <td>{p.name}</td>
                  <td style={{ color: "var(--blue)", fontWeight: 800 }}>{p.interestRate}%</td>
                  <td>
                    {(p.minAmount / 1e6).toLocaleString("vi-VN")}–
                    {(p.maxAmount / 1e6).toLocaleString("vi-VN")} triệu
                  </td>
                  <td>★ {p.rating.toFixed(1)}</td>
                  <td style={{ color: "var(--gray-400)", fontSize: 12 }}>
                    {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)" }}>
                    Chưa có sản phẩm nào trong danh mục này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
