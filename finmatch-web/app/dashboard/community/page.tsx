import { AppShell } from "@/components/layout/AppShell";

export default function CommunityPage() {
  return (
    <AppShell title="Cộng đồng">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card">
          <div className="sec-eyebrow">Cộng đồng</div>
          <h3 style={{ marginBottom: 8 }}>Cộng đồng</h3>
          <p className="text-sm text-muted">
            TODO: bài đăng, bình luận — nối communityService (Postgres).
          </p>
        </div>
      </div>
    </AppShell>
  );
}
