"use client";

import { useState } from "react";
import { AIRecommendationInput, RecommendationResponse } from "@/types";
import { getRecommendation } from "@/services/recommendationService";
import { AIMatchingSteps } from "./AIMatchingSteps";
import { AIRecommendationCard } from "./AIRecommendationCard";

type Stage = "form" | "matching" | "result";

const GOALS = ["Mua nhà", "Mua xe", "Đầu tư", "Tiết kiệm", "Vay cá nhân", "Bảo hiểm"];

export function AIRecommendationSection() {
  const [stage, setStage] = useState<Stage>("form");
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingInput, setPendingInput] = useState<AIRecommendationInput | null>(null);

  const [income, setIncome] = useState(20);
  const [savings, setSavings] = useState(100);
  const [debt, setDebt] = useState(0);
  const [occupation, setOccupation] = useState("");
  const [age, setAge] = useState(30);
  const [loanAmount, setLoanAmount] = useState(1000);
  const [creditHistory, setCreditHistory] = useState<AIRecommendationInput["creditHistory"]>("good");
  const [goal, setGoal] = useState(GOALS[0]);

  function handleSubmit() {
    setError(null);
    const input: AIRecommendationInput = {
      income,
      savings,
      debt,
      occupation: occupation || "Không rõ",
      age,
      loanAmount,
      creditHistory,
      goal,
    };
    setPendingInput(input);
    setStage("matching");
  }

  async function handleMatchingComplete() {
    if (!pendingInput) return;
    try {
      const data = await getRecommendation(pendingInput);
      setResult(data);
      setStage("result");
    } catch (e) {
      setError((e as Error).message);
      setStage("form");
    }
  }

  if (stage === "matching") {
    return (
      <div className="card" style={{ background: "var(--navy)", borderRadius: 18 }}>
        <AIMatchingSteps onComplete={handleMatchingComplete} />
      </div>
    );
  }

  if (stage === "result" && result) {
    return (
      <div>
        <AIRecommendationCard data={result} />
        <button
          onClick={() => setStage("form")}
          style={{
            marginTop: 12,
            background: "transparent",
            border: "1px solid var(--gray-200)",
            borderRadius: 9,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--gray-500)",
            cursor: "pointer",
          }}
        >
          ← Nhập lại hồ sơ khác
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="sec-eyebrow">AI Recommendation Engine</div>
      <h3 style={{ marginBottom: 4 }}>Tìm sản phẩm vay phù hợp nhất với bạn</h3>
      <p className="text-sm text-muted mb14">
        Nhập hồ sơ tài chính — AI sẽ chấm điểm và xếp hạng sản phẩm thật trong hệ thống, kèm giải thích lý do.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="calc-input-group">
          <label className="calc-label">Thu nhập (triệu/tháng)</label>
          <input className="calc-input" type="number" value={income} onChange={(e) => setIncome(+e.target.value)} />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Tiết kiệm hiện có (triệu)</label>
          <input className="calc-input" type="number" value={savings} onChange={(e) => setSavings(+e.target.value)} />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Nợ hiện tại (triệu/tháng)</label>
          <input className="calc-input" type="number" value={debt} onChange={(e) => setDebt(+e.target.value)} />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Tuổi</label>
          <input className="calc-input" type="number" value={age} onChange={(e) => setAge(+e.target.value)} />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Nghề nghiệp</label>
          <input
            className="calc-input"
            type="text"
            placeholder="VD: Kỹ sư, Kinh doanh..."
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Số tiền muốn vay (triệu)</label>
          <input
            className="calc-input"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(+e.target.value)}
          />
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Lịch sử tín dụng</label>
          <select
            className="calc-input"
            value={creditHistory}
            onChange={(e) => setCreditHistory(e.target.value as AIRecommendationInput["creditHistory"])}
          >
            <option value="good">Tốt — chưa từng nợ xấu</option>
            <option value="average">Trung bình</option>
            <option value="poor">Có nợ xấu</option>
            <option value="none">Chưa có lịch sử tín dụng</option>
          </select>
        </div>
        <div className="calc-input-group">
          <label className="calc-label">Mục tiêu</label>
          <select className="calc-input" value={goal} onChange={(e) => setGoal(e.target.value)}>
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 10 }}>
          {error}
        </div>
      )}

      <button className="btn-calc" onClick={handleSubmit}>
        <i className="ti ti-sparkles" style={{ marginRight: 6 }} />
        Phân tích với AI
      </button>
    </div>
  );
}
