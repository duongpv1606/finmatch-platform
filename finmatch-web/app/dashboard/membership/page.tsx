"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MembershipPage } from "@/components/membership/MembershipPage";

export default function DashboardMembershipPage() {
  return (
    <AppShell title="Gói thành viên">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <Suspense fallback={null}>
          <MembershipPage />
        </Suspense>
      </div>
    </AppShell>
  );
}
