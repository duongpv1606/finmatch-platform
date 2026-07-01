import { AppShell } from "@/components/layout/AppShell";

export default function MembershipPage() {
  return (
    <AppShell title="Gói thành viên">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="card">
          <div className="sec-eyebrow">Gói thành viên</div>
          <h3 style={{ marginBottom: 8 }}>Gói thành viên</h3>
          <p className="text-sm text-muted">
            TODO: bảng giá + tích hợp Stripe/VNPay/Momo/ZaloPay qua paymentService.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
