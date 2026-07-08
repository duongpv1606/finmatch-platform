"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AdminProductsManager } from "@/components/admin/AdminProductsManager";

export default function AdminPage() {
  return (
    <AppShell title="Admin Dashboard">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <AdminProductsManager />
      </div>
    </AppShell>
  );
}
