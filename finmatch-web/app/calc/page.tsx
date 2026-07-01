import { AppShell } from "@/components/layout/AppShell";
import { MortgageCalculator } from "@/components/calc/MortgageCalculator";

export default function CalcPage() {
  return (
    <AppShell title="Máy tính tài chính">
      <div className="page active" style={{ padding: "22px 28px" }}>
        <div className="mb20">
          <div className="sec-eyebrow">Công cụ tính</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
            Máy tính tài chính
          </h2>
          <p className="text-sm text-muted">
            Tính toán chính xác — được thiết kế riêng cho thị trường Việt Nam.
          </p>
        </div>
        <MortgageCalculator />
        <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 16 }}>
          TODO: thêm các máy tính còn lại từ file gốc (khả năng vay, đầu tư
          tích luỹ, quỹ khẩn cấp, DTI, hưu trí) theo cùng pattern component
          này — công thức gốc nằm trong <code>runCalc()</code> của file HTML.
        </p>
      </div>
    </AppShell>
  );
}
