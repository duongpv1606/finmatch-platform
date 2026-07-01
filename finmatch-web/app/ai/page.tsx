"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "@/components/ai/ChatPanel";

function AIPageInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? undefined;
  return (
    <AppShell title="Tư vấn AI">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <ChatPanel initialQuery={q} />
      </div>
    </AppShell>
  );
}

export default function AIPage() {
  return (
    <Suspense fallback={null}>
      <AIPageInner />
    </Suspense>
  );
}
