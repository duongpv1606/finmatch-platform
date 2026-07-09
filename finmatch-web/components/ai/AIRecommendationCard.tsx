"use client";

import { useState } from "react";
import { RecommendationResponse } from "@/types";

const BANK_STYLE: Record<string, { bg: string; initials: string }> = {
  VPBank: { bg: "linear-gradient(135deg,#00B0B9,#007A82)", initials: "VPB" },
  Techcombank: { bg: "linear-gradient(135deg,#E4032E,#B0021F)", initials: "TCB" },
  "MB Bank": { bg: "linear-gradient(135deg,#0E2A6B,#1D4ED8)", initials: "MB" },
  BIDV: { bg: "linear-gradient(135deg,#00A651,#00833A)", initials: "BID" },
  Vietcombank: { bg: "linear-gradient(135deg,#00743F,#00592F)", initials: "VCB" },
};

export function AIRecommendationCard({ data }: { data: RecommendationResponse }) {
  const [explainOpen, setExplainOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  const top = data.topMatches[0];
  if (!top) {
    return (
      <div className="ai-reco-card">
        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13 }}>
          Chưa tìm được sản phẩm phù hợp trong hệ thống với hồ sơ này.
        </div>
      </div>
    );
  }

  const bankStyle = BANK_STYLE[top.product.bankName] ?? {
    bg: "linear-gradient(135deg,#2563EB,#1D4ED8)",
    initials: top.product.bankName.slice(0, 3).toUpperCase(),
  };
  const circ = 2 * Math.PI * 36;
  const dash = (data.matchScore / 100) * circ;
  const gradeColor = data.healthGrade.startsWith("A")
    ? "#34D399"
    : data.healthGrade.startsWith("B")
      ? "#FBBF24"
      : "#F87171";

  const metrics = [
    { label: "Khả năng trả góp", val: data.affordability, color: "#60A5FA" },
    { label: "An toàn nợ", val: data.debtSafety, color: "#34D399" },
    { label: "Xác suất duyệt", val: data.approval, color: "#FBBF24" },
    { label: "Match Score", val: data.matchScore, color: "#C084FC" },
  ];

  return (
    <div className="ai-reco-card">
      <div className="ai-reco-header">
        <span className="ai-reco-badge">
          <span className="pulse" />✦ AI Recommendation Engine
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>Vừa cập nhật</span>
      </div>

      <div className="ai-reco-matchscore">
        <div className="ai-reco-ring">
          <svg viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
            <circle
              cx="45"
              cy="45"
              r="36"
              fill="none"
              stroke="#34D399"
              strokeWidth="8"
              strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="ai-reco-ring-val">
            <div className="ai-reco-ring-pct">{data.matchScore}%</div>
            <div className="ai-reco-ring-label">Match</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>
            Độ phù hợp tổng thể
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.45)", lineHeight: 1.5 }}>
            {data.aiSummary}
          </div>
        </div>
      </div>

      <div className="ai-reco-metrics">
        {metrics.map((m) => (
          <div className="ai-reco-metric" key={m.label}>
            <div className="ai-reco-metric-top">
              <span className="ai-reco-metric-label">{m.label}</span>
              <span className="ai-reco-metric-val">{m.val}%</span>
            </div>
            <div className="ai-reco-bar-bg">
              <div className="ai-reco-bar-fill" style={{ width: `${m.val}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="ai-reco-grade-box">
        <div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.45)", fontWeight: 600, marginBottom: 2 }}>
            Financial Health
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>Đánh giá tổng thể hồ sơ</div>
        </div>
        <div className="ai-reco-grade-letter" style={{ color: gradeColor }}>
          {data.healthGrade}
        </div>
      </div>

      <div className="ai-reco-bank-box">
        <div className="ai-reco-bank-top">
          {top.product.bankLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={top.product.bankLogoUrl}
              alt={top.product.bankName}
              className="ai-reco-bank-logo"
              style={{ objectFit: "cover", background: "white" }}
            />
          ) : (
            <div className="ai-reco-bank-logo" style={{ background: bankStyle.bg }}>
              {bankStyle.initials}
            </div>
          )}
          <div>
            <div className="ai-reco-bank-name">{top.product.bankName}</div>
            <div className="ai-reco-bank-rate">
              {top.product.name} — {top.product.interestRate}%/năm
            </div>
          </div>
        </div>
        {top.reasons.map((r) => (
          <div className="ai-reco-reason" key={r}>
            <i className="ti ti-circle-check" />
            {r}
          </div>
        ))}
      </div>

      {data.topMatches.length > 1 && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 10.5,
              color: "rgba(255,255,255,.45)",
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Lựa chọn khác
          </div>
          {data.topMatches.slice(1).map((m) => (
            <div
              key={m.product.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "rgba(255,255,255,.6)",
                padding: "6px 0",
                borderBottom: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <span>
                {m.product.bankName} — {m.product.name}
              </span>
              <span>
                {m.product.interestRate}% · {m.score}/100
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        className={`ai-explain-btn${explainOpen ? " open" : ""}`}
        onClick={() => setExplainOpen((v) => !v)}
      >
        <i className="ti ti-sparkles" style={{ fontSize: 13 }} />
        <span>Vì sao AI đề xuất điều này?</span>
        <i className="ti ti-chevron-down chevron" />
      </button>
      <div className={`ai-explain-panel${explainOpen ? " open" : ""}`}>
        <div className="ai-explain-item">
          <div className="ai-explain-item-icon">
            <i className="ti ti-percentage" />
          </div>
          <div className="ai-explain-item-text">
            <strong>Tỷ lệ DTI (Nợ/Thu nhập):</strong> hiện tại <strong>{data.dtiPct}%</strong>{" "}
            {data.dtiPct < 30 ? "— nằm trong vùng an toàn (dưới 30%)." : "— cần lưu ý để tối ưu khả năng duyệt."}
          </div>
        </div>
        <div className="ai-explain-item">
          <div className="ai-explain-item-icon">
            <i className="ti ti-wallet" />
          </div>
          <div className="ai-explain-item-text">
            <strong>Khả năng trả nợ:</strong> khả năng trả góp hàng tháng tối đa ước tính{" "}
            <strong>{data.maxEMI} triệu</strong>.
          </div>
        </div>
        <div className="ai-explain-item">
          <div className="ai-explain-item-icon">
            <i className="ti ti-building-bank" />
          </div>
          <div className="ai-explain-item-text">
            <strong>Sản phẩm phù hợp:</strong> {data.aiSummary}
          </div>
        </div>
      </div>

      <button
        className={`ai-explain-btn${roadmapOpen ? " open" : ""}`}
        onClick={() => setRoadmapOpen((v) => !v)}
        style={{ marginTop: 8 }}
      >
        <i className="ti ti-route" style={{ fontSize: 13 }} />
        <span>Lộ trình AI đề xuất để tăng khả năng duyệt</span>
        <i className="ti ti-chevron-down chevron" />
      </button>
      <div className={`ai-explain-panel${roadmapOpen ? " open" : ""}`}>
        {data.dtiPct >= 25 && (
          <div className="ai-explain-item">
            <div className="ai-explain-item-icon">
              <i className="ti ti-trending-down" />
            </div>
            <div className="ai-explain-item-text">
              Giảm tỷ lệ DTI xuống dưới 25% bằng cách trả bớt nợ hiện tại trước khi nộp hồ sơ.
            </div>
          </div>
        )}
        {data.approval < 80 && (
          <div className="ai-explain-item">
            <div className="ai-explain-item-icon">
              <i className="ti ti-piggy-bank" />
            </div>
            <div className="ai-explain-item-text">
              Tăng khoản tiết kiệm tích lũy để cải thiện độ tin cậy hồ sơ với ngân hàng.
            </div>
          </div>
        )}
        <div className="ai-explain-item">
          <div className="ai-explain-item-icon">
            <i className="ti ti-file-check" />
          </div>
          <div className="ai-explain-item-text">
            Chuẩn bị đầy đủ giấy tờ chứng minh thu nhập để rút ngắn thời gian duyệt hồ sơ.
          </div>
        </div>
      </div>
    </div>
  );
}
