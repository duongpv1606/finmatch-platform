"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { getProducts, deleteProduct } from "@/services/productsService";
import { FinancialProduct } from "@/types";
import { AdminProductForm } from "./AdminProductForm";

export function AdminProductsManager() {
  const { user, role, openAuthModal } = useAppStore();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialProduct | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => getProducts(),
    enabled: role === "admin" || role === "super_admin",
  });

  if (!user) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">⚡</div>
        <h3>Chỉ dành cho Admin / Chủ sở hữu</h3>
        <p>Khu vực này được bảo vệ. Chỉ Admin mới có toàn quyền truy cập dashboard quản trị.</p>
        <button
          onClick={() => openAuthModal("login")}
          style={{
            background: "var(--navy)",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "11px 24px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Đăng nhập Admin →
        </button>
      </div>
    );
  }

  if (role !== "admin" && role !== "super_admin") {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">⚡</div>
        <h3>Không đủ quyền truy cập</h3>
        <p>Tài khoản {user.email} hiện có quyền &quot;{role}&quot; — khu vực này chỉ dành cho Admin.</p>
      </div>
    );
  }

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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="sec-eyebrow" style={{ color: "var(--red)", marginBottom: 0 }}>
              ⚡ Admin Portal
            </span>
            <span className="role-badge role-badge-admin">Toàn quyền</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 4, letterSpacing: "-.4px" }}>
            Quản lý sản phẩm
          </h2>
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
                  <td style={{ fontWeight: 700 }}>{p.bankName}</td>
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
