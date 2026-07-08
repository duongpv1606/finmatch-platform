"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ProductCategory } from "@/types";
import { searchProducts, ProductSearchParams } from "@/services/productsService";

const TABS: { id: ProductCategory; label: string }[] = [
  { id: "loan", label: "Vay mua nhà" },
  { id: "card", label: "Thẻ tín dụng" },
  { id: "insurance", label: "Bảo hiểm" },
  { id: "savings", label: "Tiết kiệm" },
];

type SortField = "interestRate" | "rating" | "bankName" | "updatedAt";

const SORT_LABEL: Record<SortField, string> = {
  interestRate: "Lãi suất",
  rating: "Đánh giá",
  bankName: "Ngân hàng",
  updatedAt: "Cập nhật",
};

export function CompareTable() {
  const [tab, setTab] = useState<ProductCategory>("loan");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("interestRate");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [page, setPage] = useState(1);
  const limit = 5;

  // Debounce search input so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [tab, sortBy, sortOrder]);

  const params: ProductSearchParams = {
    category: tab,
    q: debouncedSearch || undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["products", "search", params],
    queryFn: () => searchProducts(params),
  });

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  }

  function sortIcon(field: SortField) {
    if (sortBy !== field) return "";
    return sortOrder === "ASC" ? " ↑" : " ↓";
  }

  return (
    <>
      <div className="tabs" style={{ maxWidth: 500 }}>
        {TABS.map((t) => (
          <div key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <i
              className="ti ti-search"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", fontSize: 14 }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên ngân hàng hoặc sản phẩm..."
              style={{
                width: "100%",
                padding: "9px 12px 9px 34px",
                borderRadius: 9,
                border: "1px solid var(--gray-200)",
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(Object.keys(SORT_LABEL) as SortField[]).map((f) => (
              <button
                key={f}
                onClick={() => toggleSort(f)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--gray-200)",
                  background: sortBy === f ? "var(--blue-light)" : "white",
                  color: sortBy === f ? "var(--blue)" : "var(--gray-500)",
                  cursor: "pointer",
                }}
              >
                {SORT_LABEL[f]}
                {sortIcon(f)}
              </button>
            ))}
          </div>
        </div>

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
              {isLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)" }}>
                    Đang tải...
                  </td>
                </tr>
              )}
              {data?.items.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.bankName}</td>
                  <td>{p.name}</td>
                  <td style={{ color: "var(--blue)", fontWeight: 800 }}>{p.interestRate}%</td>
                  <td>
                    {(p.minAmount / 1e6).toLocaleString("vi-VN")}–
                    {(p.maxAmount / 1e6).toLocaleString("vi-VN")} triệu
                  </td>
                  <td>★ {Number(p.rating).toFixed(1)}</td>
                  <td style={{ color: "var(--gray-400)", fontSize: 12 }}>
                    {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)" }}>
                    {debouncedSearch
                      ? `Không tìm thấy sản phẩm nào khớp "${debouncedSearch}"`
                      : "Chưa có sản phẩm nào trong danh mục này."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
            <span style={{ fontSize: 12, color: "var(--gray-400)" }}>
              Trang {data.page}/{data.totalPages} · {data.total} sản phẩm
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  border: "1px solid var(--gray-200)",
                  background: "white",
                  fontSize: 12,
                  fontWeight: 600,
                  color: page <= 1 ? "var(--gray-300)" : "var(--gray-600)",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                }}
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  border: "1px solid var(--gray-200)",
                  background: "white",
                  fontSize: 12,
                  fontWeight: 600,
                  color: page >= data.totalPages ? "var(--gray-300)" : "var(--gray-600)",
                  cursor: page >= data.totalPages ? "not-allowed" : "pointer",
                }}
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
