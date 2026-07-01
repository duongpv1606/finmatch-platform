import { AppShell } from "@/components/layout/AppShell";

export default function MarketplacePage() {
  return (
    <AppShell title="Marketplace Lead">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card">
          <div className="sec-eyebrow">Marketplace Lead</div>
          <h3 style={{ marginBottom: 8 }}>Marketplace Lead</h3>
          <p className="text-sm text-muted">
            TODO: hiển thị lead cho Sale/Bank/Agency mua — cần API leadService (chấm điểm, chống trùng).
          </p>
        </div>
      </div>
    </AppShell>
  );
}
