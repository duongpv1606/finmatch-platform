"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { AdminAccessGate } from "./AdminAccessGate";
import { AdminProductsManager } from "./AdminProductsManager";
import { AdminUsersManager } from "./AdminUsersManager";

type Tab = "products" | "users";

export function AdminDashboard() {
  const { user } = useAppStore();
  const [tab, setTab] = useState<Tab>("products");

  return (
    <AdminAccessGate>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="sec-eyebrow" style={{ color: "var(--red)", marginBottom: 0 }}>
              ⚡ Admin Portal
            </span>
            <span className="role-badge role-badge-admin">Toàn quyền</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 4, letterSpacing: "-.4px" }}>
            Admin Dashboard
          </h2>
          <p className="text-sm text-muted">Đăng nhập với {user?.email} — quản trị sản phẩm và người dùng.</p>
        </div>
      </div>

      <div className="tabs" style={{ maxWidth: 320 }}>
        <div className={`tab${tab === "products" ? " active" : ""}`} onClick={() => setTab("products")}>
          Sản phẩm
        </div>
        <div className={`tab${tab === "users" ? " active" : ""}`} onClick={() => setTab("users")}>
          Người dùng
        </div>
      </div>

      {tab === "products" ? <AdminProductsManager /> : <AdminUsersManager />}
    </AdminAccessGate>
  );
}
