"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MessagesPage } from "@/components/messages/MessagesPage";

export default function MessagesRoutePage() {
  return (
    <AppShell title="Tin nhắn">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <Suspense fallback={null}>
          <MessagesPage />
        </Suspense>
      </div>
    </AppShell>
  );
}
