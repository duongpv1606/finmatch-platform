import { AppShell } from "@/components/layout/AppShell";
import { CompareTable } from "@/components/compare/CompareTable";

export default function ComparePage() {
  return (
    <AppShell title="So sánh">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="mb20">
          <div className="sec-eyebrow">So sánh</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
            So sánh sản phẩm chi tiết
          </h2>
          <p className="text-sm text-muted">
            So sánh lãi suất, phí, điều kiện và đánh giá AI của từng sản phẩm.
          </p>
        </div>
        <CompareTable />
      </div>
    </AppShell>
  );
}
