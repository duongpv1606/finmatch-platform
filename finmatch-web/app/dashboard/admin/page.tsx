"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <AppShell title="Admin Dashboard">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <AdminDashboard />
      </div>
    </AppShell>
  );
}
