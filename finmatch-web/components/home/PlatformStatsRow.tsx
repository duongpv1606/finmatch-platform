import { PlatformStats } from "@/services/platformService";

const CARDS = [
  { key: "totalCustomers" as const, icon: "ti-users", bg: "rgba(37,99,235,.18)", ic: "#60A5FA", label: "Khách hàng đã đăng ký" },
  { key: "totalLeads" as const, icon: "ti-target-arrow", bg: "rgba(16,185,129,.18)", ic: "#34D399", label: "Tổng số Lead" },
  { key: "totalConverted" as const, icon: "ti-file-check", bg: "rgba(124,58,237,.18)", ic: "#A78BFA", label: "Hồ sơ đã chốt thành công" },
  { key: "totalBanks" as const, icon: "ti-building-bank", bg: "rgba(245,158,11,.18)", ic: "#FBBF24", label: "Ngân hàng / tổ chức kết nối" },
];

export function PlatformStatsRow({ stats }: { stats: PlatformStats }) {
  return (
    <div className="platform-stats-row">
      {CARDS.map((c) => (
        <div className="platform-stat-card" key={c.key}>
          <div className="platform-stat-icon" style={{ background: c.bg }}>
            <i className={`ti ${c.icon}`} style={{ color: c.ic }} />
          </div>
          <div className="platform-stat-val">{stats[c.key].toLocaleString("vi-VN")}</div>
          <div className="platform-stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
