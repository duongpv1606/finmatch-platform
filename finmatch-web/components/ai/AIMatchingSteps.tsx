"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { icon: "ti-scan", text: "Phân tích hồ sơ" },
  { icon: "ti-adjustments", text: "Chuẩn hóa dữ liệu" },
  { icon: "ti-arrows-shuffle", text: "So sánh sản phẩm thật trong hệ thống" },
  { icon: "ti-trending-up", text: "Dự đoán khả năng phê duyệt" },
  { icon: "ti-target-arrow", text: "Tính điểm phù hợp" },
  { icon: "ti-sparkles", text: "AI sinh giải thích" },
];

export function AIMatchingSteps({ onComplete }: { onComplete: () => void }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [doneIndices, setDoneIndices] = useState<number[]>([]);

  useEffect(() => {
    let i = 0;
    const stepDelay = 340;
    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      if (i > 0) {
        setDoneIndices((prev) => [...prev, i - 1]);
      }
      if (i < STEPS.length) {
        setActiveIndex(i);
        i++;
        timer = setTimeout(tick, stepDelay);
      } else {
        timer = setTimeout(onComplete, 260);
      }
    }
    timer = setTimeout(tick, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressPct = Math.round(((activeIndex + 1) / STEPS.length) * 100);

  return (
    <div className="ai-reco-skeleton">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span className="pulse" />
        <span
          style={{
            fontSize: 10,
            color: "#34D399",
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          AI Matching Engine
        </span>
      </div>
      <div className="ai-match-progress-bg">
        <div className="ai-match-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div>
        {STEPS.map((s, i) => {
          const isActive = i === activeIndex && !doneIndices.includes(i);
          const isDone = doneIndices.includes(i);
          return (
            <div
              key={s.text}
              className={`ai-match-step${isActive ? " active" : ""}${isDone ? " done" : ""}`}
            >
              <div className="ai-match-step-icon">
                <i className={`ti ${isDone ? "ti-check" : isActive ? "ti-loader-2" : s.icon}`} />
              </div>
              <div className="ai-match-step-text">{s.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
