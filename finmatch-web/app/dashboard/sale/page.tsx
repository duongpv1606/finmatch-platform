import { AppShell } from "@/components/layout/AppShell";

export default function SaleDashboardPage() {
  return (
    <AppShell title="Sale Dashboard">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card">
          <div className="sec-eyebrow">Sale Dashboard</div>
          <h3 style={{ marginBottom: 8 }}>Sale Dashboard</h3>
          <p className="text-sm text-muted">
            TODO: doanh số, hoa hồng, top khách hàng — nối vào analyticsService.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
