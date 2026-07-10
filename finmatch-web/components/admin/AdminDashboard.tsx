"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { AdminAccessGate } from "./AdminAccessGate";
import { AdminOverviewPage } from "./AdminOverviewPage";
import { AdminProductsManager } from "./AdminProductsManager";
import { AdminUsersManager } from "./AdminUsersManager";

type Tab = "overview" | "products" | "users";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "products", label: "Sản phẩm" },
  { id: "users", label: "Người dùng" },
];

export function AdminDashboard() {
  const { user } = useAppStore();
  const [tab, setTab] = useState<Tab>("overview");

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
          <p className="text-sm text-muted">Đăng nhập với {user?.email} — quản trị toàn bộ nền tảng.</p>
        </div>
      </div>

      <div className="tabs" style={{ maxWidth: 420 }}>
        {TABS.map((t) => (
          <div key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === "overview" && <AdminOverviewPage />}
      {tab === "products" && <AdminProductsManager />}
      {tab === "users" && <AdminUsersManager />}
    </AdminAccessGate>
  );
}
