import Link from "next/link";

// Original hardcoded 4 "AI is proactively monitoring you" tips (e.g. "VCB
// vừa giảm lãi suất 0,3%") as if generated for the current person — they
// were static demo copy, not computed from anyone's real situation. Real
// personalized monitoring needs a saved profile + a scheduled job
// comparing it against live rates, which doesn't exist yet. Honest state:
// invite them to start the real AI Recommendation Engine instead of
// showing invented tips.
export function SmartRecommendationCard() {
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "linear-gradient(135deg,#2563EB,#10B981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="ti ti-sparkles" style={{ color: "white", fontSize: 13 }} />
          </div>
          <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "var(--navy)", letterSpacing: "-.2px" }}>
            AI theo dõi &amp; gợi ý cho bạn
          </h3>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "var(--gray-500)", lineHeight: 1.6, marginBottom: 12 }}>
        Trò chuyện với AI một lần — hệ thống sẽ nhớ hồ sơ và chủ động gợi ý sản phẩm phù hợp mỗi khi có lãi suất tốt hơn.
      </p>
      <Link
        href="/ai"
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--blue)",
          background: "var(--blue-light)",
          padding: "8px 14px",
          borderRadius: 8,
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        Bắt đầu ngay →
      </Link>
    </div>
  );
}
