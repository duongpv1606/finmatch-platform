import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { getExchangeRates, getGoldPrices, getNews } from "@/services/marketService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tin tức tài chính",
  description:
    "Tin tức tài chính, ngân hàng mới nhất, giá vàng SJC/DOJI và tỷ giá ngoại tệ cập nhật realtime.",
  alternates: { canonical: "/news" },
};

const CATEGORIES = ["Lãi suất", "Vay vốn", "Thẻ tín dụng", "Đầu tư", "Bảo hiểm", "Crypto"];

const GOLD_ICON: Record<string, string> = { SJC: "🥇", DOJI: "🏅", PNJ: "💛" };
const FX_FLAG: Record<string, string> = { USD: "🇺🇸", EUR: "🇪🇺", JPY: "🇯🇵", GBP: "🇬🇧", CNY: "🇨🇳" };

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "18px 8px",
        color: "var(--gray-400)",
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.5 }}>{icon}</div>
      <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

export default async function NewsPage() {
  const [news, gold, fx] = await Promise.all([
    getNews(8),
    getGoldPrices(),
    getExchangeRates(),
  ]);

  const lastUpdated = gold[0]?.updatedAt ?? fx[0]?.updatedAt;

  return (
    <AppShell title="Tin tức">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="mb20" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="sec-eyebrow">Tin tức</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
              Tin tài chính mới nhất
            </h2>
          </div>
          <div className="trust-badge trust-badge-live" style={{ margin: 0 }}>
            <span className="live-dot" />
            <span>
              Dữ liệu realtime{lastUpdated ? ` · cập nhật ${new Date(lastUpdated).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : ""}
            </span>
          </div>
        </div>

        <div className="grid-main">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {news.map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{ display: "flex", gap: 14, textDecoration: "none", color: "inherit", alignItems: "flex-start" }}
              >
                {n.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.imageUrl}
                    alt=""
                    style={{ width: 84, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "var(--gray-100)" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 84,
                      height: 64,
                      borderRadius: 10,
                      background: "var(--gray-100)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 22,
                    }}
                  >
                    📰
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 4, lineHeight: 1.4 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--gray-500)", marginBottom: 6, lineHeight: 1.5 }}>
                    {n.summary}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--gray-400)", display: "flex", alignItems: "center", gap: 6 }}>
                    <i className="ti ti-news" style={{ fontSize: 12 }} />
                    {n.source} · {new Date(n.publishedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </a>
            ))}
            {news.length === 0 && (
              <div className="card">
                <EmptyState icon="📰" text="Chưa có tin tức nào — hệ thống sẽ tự động cập nhật trong ít phút." />
              </div>
            )}
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ margin: 0 }}>Giá vàng hôm nay</h3>
                {gold.length > 0 && <span className="live-dot" />}
              </div>
              {gold.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {gold.map((g) => (
                    <div
                      key={g.brand}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        background: "var(--gray-50)",
                        borderRadius: 10,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{GOLD_ICON[g.brand] ?? "🪙"}</span>
                      <span style={{ fontWeight: 700, fontSize: 12.5, color: "var(--navy)", flex: 1 }}>{g.brand}</span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--emerald-dark)" }}>
                          {(g.sell / 1e6).toFixed(2)} tr
                        </div>
                        <div style={{ fontSize: 10, color: "var(--gray-400)" }}>
                          Mua {(g.buy / 1e6).toFixed(2)} tr
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🥇" text="Đang cập nhật giá vàng — dữ liệu sẽ xuất hiện trong lần đồng bộ tiếp theo (tối đa 30 phút)." />
              )}
            </div>

            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ margin: 0 }}>Tỷ giá ngoại tệ</h3>
                {fx.length > 0 && <span className="live-dot" />}
              </div>
              {fx.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {fx.map((f) => (
                    <div
                      key={f.currency}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        background: "var(--gray-50)",
                        borderRadius: 10,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{FX_FLAG[f.currency] ?? "💱"}</span>
                      <span style={{ fontWeight: 700, fontSize: 12.5, color: "var(--navy)", flex: 1 }}>{f.currency}</span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--blue)" }}>
                          {f.sell.toLocaleString("vi-VN")}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--gray-400)" }}>
                          Mua {f.buy.toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="💱" text="Đang cập nhật tỷ giá — dữ liệu sẽ xuất hiện trong lần đồng bộ tiếp theo (tối đa 1 giờ)." />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
