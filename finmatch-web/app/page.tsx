import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { HeroSearch } from "@/components/home/HeroSearch";
import { LeadCaptureBanner } from "@/components/home/LeadCaptureBanner";
import { RateChart } from "@/components/home/RateChart";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { FinancialHealthCard } from "@/components/home/FinancialHealthCard";
import { SmartRecommendationCard } from "@/components/home/SmartRecommendationCard";
import { TopHotRanking } from "@/components/home/TopHotRanking";
import { PlatformStatsRow } from "@/components/home/PlatformStatsRow";
import { PartnerLogosRow } from "@/components/home/PartnerLogosRow";
import { NewsList } from "@/components/home/NewsList";
import { getPlatformStats } from "@/services/platformService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trang chủ",
  description:
    "So sánh lãi suất vay, thẻ tín dụng, bảo hiểm, đầu tư và tiết kiệm từ các ngân hàng hàng đầu Việt Nam — tư vấn bằng AI, cập nhật realtime.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const stats = await getPlatformStats();

  return (
    <AppShell title="Tổng quan">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <HeroSearch />

        <LeadCaptureBanner />

        <div className="trust-strip">
          <div className="trust-badges">
            <div className="trust-badge trust-badge-verified">
              <i className="ti ti-rosette-discount-check" />
              <span>AI Verified</span>
            </div>
            <div className="trust-badge trust-badge-secure">
              <i className="ti ti-lock" />
              <span>Secure Connection</span>
            </div>
            <div className="trust-badge trust-badge-live">
              <span className="live-dot" />
              <span>Dữ liệu cập nhật realtime</span>
            </div>
          </div>
          <PartnerLogosRow />
        </div>

        <PlatformStatsRow stats={stats} />

        <div className="grid-main mb20">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <RateChart />
            <TrendingProducts />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FinancialHealthCard />
            <SmartRecommendationCard />
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  background: "linear-gradient(135deg,#FF6B35,#F7374F)",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="ti ti-flame" style={{ color: "white", fontSize: 18 }} />
                  <h3 style={{ color: "white", fontSize: 14, fontWeight: 800, letterSpacing: "-.2px" }}>
                    TOP HOT — Bảng xếp hạng
                  </h3>
                </div>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "rgba(255,255,255,.2)",
                    padding: "3px 9px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  <span className="live-dot" style={{ background: "white" }} />
                  LIVE
                </span>
              </div>
              <div style={{ padding: "6px 12px 12px" }}>
                <TopHotRanking products={stats.topProducts} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid2">
          <NewsList />
          <div className="card">
            <div className="sec-hd">
              <div>
                <div className="sec-eyebrow">Cơ hội</div>
                <h3>Ưu đãi đang diễn ra</h3>
              </div>
            </div>
            <div style={{ color: "var(--gray-400)", fontSize: 13 }}>
              Chưa có ưu đãi nào được cấu hình — Admin có thể thêm ở CMS (sắp có).
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
