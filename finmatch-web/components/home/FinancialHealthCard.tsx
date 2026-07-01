import { FinancialHealth } from "@/types";

const MOCK_HEALTH: FinancialHealth = { score: 78, label: "Tốt — Tiếp tục phát huy!" };

export function FinancialHealthCard({ health = MOCK_HEALTH }: { health?: FinancialHealth }) {
  return (
    <div className="card">
      <div className="sec-eyebrow">Sức khỏe tài chính</div>
      <h3 style={{ marginBottom: 12 }}>Điểm tài chính của bạn</h3>
      <div className="health-gauge">
        <div className="gauge-val">{health.score}</div>
        <div className="gauge-label">{health.label}</div>
        <div className="gauge-bar">
          <div className="gauge-fill" style={{ width: `${health.score}%` }} />
        </div>
        <div className="gauge-ticks">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}
