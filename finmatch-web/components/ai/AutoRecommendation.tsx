"use client";

import { useEffect, useRef, useState } from "react";
import { LeadProfile } from "@/lib/chatFlow";
import { getRecommendation } from "@/services/recommendationService";
import { RecommendationResponse } from "@/types";
import { AIMatchingSteps } from "./AIMatchingSteps";
import { AIRecommendationCard } from "./AIRecommendationCard";

export function AutoRecommendation({ profile }: { profile: LeadProfile }) {
  const [stage, setStage] = useState<"idle" | "matching" | "result">("idle");
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const hasShownOnceRef = useRef(false);
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    // Mirrors the original: the sidebar card appears as soon as income is
    // known (`if (leadProfile.income) { ...renderAIRecoCard(true) }`).
    if (profile.income === null) return;

    const key = `${profile.income}-${profile.savings}-${profile.debt}-${profile.goal}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    if (!hasShownOnceRef.current) {
      hasShownOnceRef.current = true;
      setStage("matching");
    } else {
      // Profile updated after the first reveal (e.g. savings/debt just
      // answered) — refresh data quietly instead of replaying the full
      // "AI is thinking" animation every single message.
      void fetchAndShow();
    }
  }, [profile]);

  async function fetchAndShow() {
    const income = profile.income ?? 20;
    const savings = profile.savings ?? 0;
    const debt = profile.debt ?? 0;
    const maxEMI = Math.max(0, income * 0.4 - debt);
    const estimatedLoanAmount = Math.max(100, Math.round((maxEMI * 200) / 50) * 50);

    try {
      const data = await getRecommendation({
        income,
        savings,
        debt,
        occupation: "Không rõ",
        age: 30,
        loanAmount: estimatedLoanAmount,
        creditHistory: "average",
        goal: profile.goal ?? "Vay vốn",
      });
      setResult(data);
      setStage("result");
    } catch {
      setStage("idle");
    }
  }

  if (stage === "idle") return null;

  if (stage === "matching") {
    return (
      <div className="card" style={{ background: "var(--navy)", borderRadius: 18 }}>
        <AIMatchingSteps onComplete={fetchAndShow} />
      </div>
    );
  }

  if (stage === "result" && result) {
    return <AIRecommendationCard data={result} />;
  }

  return null;
}
