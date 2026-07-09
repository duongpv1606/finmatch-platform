import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { HeroSearch } from "@/components/home/HeroSearch";
import { RateChart } from "@/components/home/RateChart";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { FinancialHealthCard } from "@/components/home/FinancialHealthCard";
import { NewsList } from "@/components/home/NewsList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trang chủ",
  description:
    "So sánh lãi suất vay, thẻ tín dụng, bảo hiểm, đầu tư và tiết kiệm từ các ngân hàng hàng đầu Việt Nam — tư vấn bằng AI, cập nhật realtime.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <AppShell title="Tổng quan">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <HeroSearch />

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
        </div>

        <div className="grid-main mb20">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <RateChart />
            <TrendingProducts />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FinancialHealthCard />
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
              Kết nối CMS để quản lý danh sách ưu đãi tại đây.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
