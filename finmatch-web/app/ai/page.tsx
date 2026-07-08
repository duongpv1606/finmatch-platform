"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { SuggestedQuestions } from "@/components/ai/SuggestedQuestions";
import { ProfileCard } from "@/components/ai/ProfileCard";
import { AutoRecommendation } from "@/components/ai/AutoRecommendation";
import { useChatSession } from "@/hooks/useChatSession";

function AIPageInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? undefined;
  const { messages, sending, send, profile } = useChatSession(q);

  return (
    <AppShell title="Tư vấn AI">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="grid-main">
          <div>
            <ChatPanel messages={messages} sending={sending} onSend={send} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SuggestedQuestions onPick={send} />
            <ProfileCard profile={profile} />
            <AutoRecommendation profile={profile} />
          </div>
        </div>
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
