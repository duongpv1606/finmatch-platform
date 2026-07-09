import { FinancialProduct } from "@/types";

function stars(rating: number): string {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

export function TopHotRanking({ products }: { products: FinancialProduct[] }) {
  if (products.length === 0) {
    return (
      <div style={{ padding: "20px 12px", textAlign: "center", color: "var(--gray-400)", fontSize: 12.5 }}>
        Chưa có sản phẩm nào để xếp hạng.
      </div>
    );
  }

  return (
    <div>
      {products.map((p, i) => {
        const rankClass = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "other";
        return (
          <div className="rank-row" key={p.id}>
            <div className={`rank-num ${rankClass}`}>{i + 1}</div>
            <div
              className="rank-logo"
              style={{
                background: p.bankLogoUrl ? "white" : "linear-gradient(135deg,var(--blue),var(--emerald))",
                backgroundImage: p.bankLogoUrl ? `url(${p.bankLogoUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {!p.bankLogoUrl && p.bankName.slice(0, 2).toUpperCase()}
            </div>
            <div className="rank-info">
              <div className="rank-name">
                {p.bankName}
                {i === 0 && <span className="rank-badge-hot hot">HOT</span>}
              </div>
              <div className="rank-stars">
                {stars(p.rating)} <span style={{ color: "var(--gray-400)", fontWeight: 600, marginLeft: 2 }}>{p.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="rank-trend flat" style={{ fontWeight: 700 }}>
              {p.interestRate}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
