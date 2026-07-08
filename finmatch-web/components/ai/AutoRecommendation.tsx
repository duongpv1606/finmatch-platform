"use client";

import { useEffect, useRef, useState } from "react";
import { ExtractedProfile } from "@/services/aiChatService";
import { getRecommendation } from "@/services/recommendationService";
import { RecommendationResponse } from "@/types";
import { AIMatchingSteps } from "./AIMatchingSteps";
import { AIRecommendationCard } from "./AIRecommendationCard";

export function AutoRecommendation({
  profile,
  messageCount,
}: {
  profile: ExtractedProfile;
  messageCount: number;
}) {
  const [stage, setStage] = useState<"idle" | "matching" | "result">("idle");
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    // Original HTML showed the card once chatHistory.length > 2 AND income
    // was known. We mirror that threshold here.
    if (messageCount <= 2 || profile.income === null) return;

    const key = `${profile.income}-${profile.savings}-${profile.debt}-${profile.goal}`;
    if (key === lastKeyRef.current) return; // profile hasn't changed, don't refetch
    lastKeyRef.current = key;

    setStage("matching");
  }, [profile, messageCount]);

  async function handleMatchingComplete() {
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
        <AIMatchingSteps onComplete={handleMatchingComplete} />
      </div>
    );
  }

  if (stage === "result" && result) {
    return <AIRecommendationCard data={result} />;
  }

  return null;
}
