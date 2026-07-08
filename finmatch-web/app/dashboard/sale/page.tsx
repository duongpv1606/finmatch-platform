"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SaleDashboard } from "@/components/sale/SaleDashboard";

export default function SaleDashboardPage() {
  return (
    <AppShell title="Sale Dashboard">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <SaleDashboard />
      </div>
    </AppShell>
  );
}
