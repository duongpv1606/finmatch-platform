import { AppShell } from "@/components/layout/AppShell";

export default function CRMPage() {
  return (
    <AppShell title="CRM của tôi">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card">
          <div className="sec-eyebrow">CRM của tôi</div>
          <h3 style={{ marginBottom: 8 }}>CRM của tôi</h3>
          <p className="text-sm text-muted">
            TODO: danh sách khách hàng theo giai đoạn — nối leadService.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
