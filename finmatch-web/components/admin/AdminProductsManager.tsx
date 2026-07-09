"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "@/services/productsService";
import { FinancialProduct } from "@/types";
import { AdminProductForm } from "./AdminProductForm";
import { BankLogo } from "@/components/shared/BankLogo";

export function AdminProductsManager() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialProduct | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => getProducts(),
  });

  async function handleDelete(product: FinancialProduct) {
    if (!confirm(`Xoá sản phẩm "${product.name}"?`)) return;
    await deleteProduct(product.id);
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  }

  function handleDone() {
    setFormOpen(false);
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Quản lý sản phẩm</h3>
          <p className="text-sm text-muted">Thêm, sửa, xoá sản phẩm tài chính — dữ liệu thật, cập nhật ngay lập tức.</p>
        </div>
        {!formOpen && (
          <button
            className="btn-calc"
            style={{ width: "auto", padding: "10px 20px" }}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <i className="ti ti-plus" style={{ marginRight: 6 }} />
            Thêm sản phẩm
          </button>
        )}
      </div>

      {formOpen && (
        <AdminProductForm
          editing={editing}
          onDone={handleDone}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      <div className="card">
        <div className="table-wrap" style={{ overflowX: "auto" }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Ngân hàng</th>
                <th>Sản phẩm</th>
                <th>Lãi suất</th>
                <th>Hạn mức</th>
                <th>Cập nhật</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)" }}>
                    Đang tải...
                  </td>
                </tr>
              )}
              {products?.map((p) => (
                <tr key={p.id}>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: 700 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <BankLogo name={p.bankName} logoUrl={p.bankLogoUrl} size={22} />
                      {p.bankName}
                    </div>
                  </td>
                  <td>{p.name}</td>
                  <td style={{ color: "var(--blue)", fontWeight: 800 }}>{p.interestRate}%</td>
                  <td>
                    {(p.minAmount / 1e6).toLocaleString("vi-VN")}–{(p.maxAmount / 1e6).toLocaleString("vi-VN")} triệu
                  </td>
                  <td style={{ color: "var(--gray-400)", fontSize: 12 }}>
                    {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                        title="Sửa"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--blue)" }}
                      >
                        <i className="ti ti-edit" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        title="Xoá"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#DC2626" }}
                      >
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)" }}>
                    Chưa có sản phẩm nào. Bấm &quot;Thêm sản phẩm&quot; để bắt đầu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
