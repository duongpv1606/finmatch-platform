"use client";

import { AppShell } from "@/components/layout/AppShell";
import { CommunityPage } from "@/components/community/CommunityPage";

export default function DashboardCommunityPage() {
  return (
    <AppShell title="Cộng đồng">
      <div className="page active">
        <CommunityPage />
      </div>
    </AppShell>
  );
}
