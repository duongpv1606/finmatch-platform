import { LeadProfile } from "@/lib/chatFlow";

function fmt(n: number | null): string {
  if (n === null) return "Chưa rõ";
  return `${n.toLocaleString("vi-VN")} triệu`;
}

export function ProfileCard({ profile }: { profile: LeadProfile }) {
  const fields = [
    { label: "Thu nhập hàng tháng", val: fmt(profile.income), icon: "ti-wallet" },
    { label: "Tiết kiệm", val: fmt(profile.savings), icon: "ti-coins" },
    { label: "Nợ hiện tại", val: fmt(profile.debt), icon: "ti-cash" },
    { label: "Mục tiêu", val: profile.goal ?? "Chưa rõ", icon: "ti-target-arrow" },
  ];

  return (
    <div className="card">
      <h3 className="mb14">Hồ sơ tài chính của bạn</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {fields.map((f) => (
          <div
            key={f.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              background: "var(--gray-50)",
              borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className={`ti ${f.icon}`} style={{ color: "var(--blue)", fontSize: 14 }} />
              <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{f.label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{f.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
