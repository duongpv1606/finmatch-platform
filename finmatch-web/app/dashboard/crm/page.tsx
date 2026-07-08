"use client";

import { AppShell } from "@/components/layout/AppShell";
import { CrmPage } from "@/components/sale/CrmPage";

export default function CrmRoutePage() {
  return (
    <AppShell title="CRM cá nhân">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <CrmPage />
      </div>
    </AppShell>
  );
}
