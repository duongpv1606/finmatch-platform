"use client";

import { AppShell } from "@/components/layout/AppShell";
import { MarketplacePage } from "@/components/marketplace/MarketplacePage";

export default function DashboardMarketplacePage() {
  return (
    <AppShell title="Marketplace Lead">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <MarketplacePage />
      </div>
    </AppShell>
  );
}
