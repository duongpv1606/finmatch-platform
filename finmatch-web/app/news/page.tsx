import { AppShell } from "@/components/layout/AppShell";
import { getExchangeRates, getGoldPrices, getNews } from "@/services/marketService";

const CATEGORIES = ["Lãi suất", "Vay vốn", "Thẻ tín dụng", "Đầu tư", "Bảo hiểm", "Crypto"];

export default async function NewsPage() {
  const [news, gold, fx] = await Promise.all([
    getNews(8),
    getGoldPrices(),
    getExchangeRates(),
  ]);

  return (
    <AppShell title="Tin tức">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="mb20">
          <div className="sec-eyebrow">Tin tức</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
            Tin tài chính mới nhất
          </h2>
        </div>
        <div className="grid-main">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {news.map((n) => (
              <a
                key={n.id}
                href={n.url}
                className="card"
                style={{ display: "flex", gap: 14, textDecoration: "none", color: "inherit" }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--gray-500)", marginBottom: 6 }}>
                    {n.summary}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
                    {n.source} · {new Date(n.publishedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <h3 className="mb14">Chủ đề</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: "var(--gray-100)",
                      color: "var(--gray-600)",
                      padding: "6px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="mb14">Giá vàng hôm nay</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {gold.map((g) => (
                  <div key={g.brand} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ fontWeight: 700 }}>{g.brand}</span>
                    <span style={{ color: "var(--gray-500)" }}>
                      {(g.buy / 1e6).toFixed(1)} / {(g.sell / 1e6).toFixed(1)} tr
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="mb14">Tỷ giá ngoại tệ</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {fx.map((f) => (
                  <div key={f.currency} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ fontWeight: 700 }}>{f.currency}</span>
                    <span style={{ color: "var(--gray-500)" }}>
                      {f.buy.toLocaleString("vi-VN")} / {f.sell.toLocaleString("vi-VN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
