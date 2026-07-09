"use client";

import Link from "next/link";

// Original HTML hardcoded score=78 here as if it were "your" real score —
// but nothing in that app ever computed it from an actual profile. We
// don't fabricate a number for something the person hasn't told us yet;
// the honest state is an invite to run the real AI Recommendation Engine
// (components/ai/AutoRecommendation.tsx), which DOES compute a real score
// from real answers.
export function FinancialHealthCard() {
  return (
    <div className="card">
      <div className="sec-eyebrow">Sức khỏe tài chính</div>
      <h3 style={{ marginBottom: 12 }}>Điểm tài chính của bạn</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "14px 8px 6px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--gray-50)",
            border: "2px dashed var(--gray-200)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <i className="ti ti-report-analytics" style={{ fontSize: 22, color: "var(--gray-300)" }} />
        </div>
        <div style={{ fontSize: 12.5, color: "var(--gray-500)", lineHeight: 1.6, marginBottom: 14 }}>
          Chưa có dữ liệu — trò chuyện với AI để tính điểm tài chính thật của bạn.
        </div>
        <Link
          href="/ai"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "white",
            background: "var(--blue)",
            padding: "8px 18px",
            borderRadius: 9,
            textDecoration: "none",
          }}
        >
          Bắt đầu phân tích →
        </Link>
      </div>
    </div>
  );
}
