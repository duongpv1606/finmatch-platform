"use client";

import { useState } from "react";
import { MarketplaceLead, purchaseLead } from "@/services/leadsService";

const GRADIENTS = [
  "linear-gradient(135deg,#2563EB,#1D4ED8)",
  "linear-gradient(135deg,#10B981,#059669)",
  "linear-gradient(135deg,#F59E0B,#D97706)",
  "linear-gradient(135deg,#8B5CF6,#7C3AED)",
];

const CATEGORY_LABEL: Record<string, string> = {
  loan: "Vay vốn",
  card: "Thẻ tín dụng",
  insurance: "Bảo hiểm",
  invest: "Đầu tư",
  savings: "Tiết kiệm",
};

export function LeadCard({
  lead,
  index,
  onPurchased,
}: {
  lead: MarketplaceLead;
  index: number;
  onPurchased: () => void;
}) {
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s = lead.score;
  const circ = 2 * Math.PI * 19;
  const dash = (s / 100) * circ;
  const premium = s >= 90;

  async function handleBuy() {
    setError(null);
    setBuying(true);
    try {
      await purchaseLead(lead.id);
      onPurchased();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className={`lead-card${premium ? " premium-lead" : ""}`}>
      {premium && <div className="premium-ribbon">⭐ Premium</div>}
      <div className="lead-card-header">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: GRADIENTS[index % GRADIENTS.length],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800,
            color: "white",
            flexShrink: 0,
          }}
        >
          {lead.customerNameMasked.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className={`lead-origin-badge ${lead.source === "ai_chat" ? "lead-origin-ai" : "lead-origin-product"}`}
          >
            <i className={`ti ${lead.source === "ai_chat" ? "ti-brain" : "ti-eye"}`} style={{ fontSize: 10 }} />
            {lead.source === "ai_chat" ? "AI Chat" : "Xem sản phẩm"}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginTop: 2 }}>
            {lead.customerNameMasked}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--gray-400)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 1,
            }}
          >
            <i className="ti ti-map-pin" style={{ fontSize: 10 }} />
            {lead.region}
          </div>
        </div>
        <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="24" cy="24" r="19" fill="none" stroke="var(--gray-100)" strokeWidth="5" />
            <circle
              cx="24"
              cy="24"
              r="19"
              fill="none"
              stroke={s >= 90 ? "#10B981" : "#2563EB"}
              strokeWidth="5"
              strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "var(--navy)",
            }}
          >
            {s}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--gray-50)",
          border: "1px solid var(--gray-100)",
          borderRadius: 10,
          padding: "10px 13px",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "var(--gray-400)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".05em",
            marginBottom: 3,
          }}
        >
          Nhu cầu
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
          {CATEGORY_LABEL[lead.productCategory] ?? lead.productCategory}
        </div>
      </div>

      <div className="lead-info-grid">
        <div className="lead-info-cell">
          <div className="lead-info-cell-label">AI Score</div>
          <div className="lead-info-cell-val" style={{ color: s >= 90 ? "var(--emerald)" : "var(--blue)" }}>
            {s}/100
          </div>
        </div>
        <div className="lead-info-cell">
          <div className="lead-info-cell-label">Ngày tạo</div>
          <div className="lead-info-cell-val">{new Date(lead.createdAt).toLocaleDateString("vi-VN")}</div>
        </div>
      </div>

      {error && <div style={{ color: "#DC2626", fontSize: 11, marginBottom: 8 }}>{error}</div>}

      <button className="lead-buy-btn" onClick={handleBuy} disabled={buying} style={{ width: "100%" }}>
        <i className="ti ti-bolt" style={{ fontSize: 14 }} />
        {buying ? "Đang xử lý..." : `Mua · ${lead.price} credit`}
      </button>
    </div>
  );
}
