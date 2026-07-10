"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AiDashboardPage } from "@/components/admin/AiDashboardPage";

export default function AiDashboardRoutePage() {
  return (
    <AppShell title="AI Dashboard">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <AiDashboardPage />
      </div>
    </AppShell>
  );
}
