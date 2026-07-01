import { AppShell } from "@/components/layout/AppShell";

export default function AdminPage() {
  return (
    <AppShell title="Admin Dashboard">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card">
          <div className="sec-eyebrow">Admin Dashboard</div>
          <h3 style={{ marginBottom: 8 }}>Admin Dashboard</h3>
          <p className="text-sm text-muted">
            TODO: CMS quản lý banner/FAQ/blog/lãi suất/ngân hàng, chỉ role admin/super_admin truy cập (dùng useAppStore.role để guard).
          </p>
        </div>
      </div>
    </AppShell>
  );
}
