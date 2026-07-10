"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { getAdminOverview } from "@/services/platformService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

const CARDS = [
  { key: "totalUsers" as const, icon: "ti-users", bg: "var(--blue-light)", ic: "var(--blue)", label: "Tổng Users" },
  { key: "leadsThisMonth" as const, icon: "ti-bolt", bg: "var(--emerald-light)", ic: "var(--emerald)", label: "Lead tháng này" },
  { key: "totalLeads" as const, icon: "ti-target-arrow", bg: "var(--amber-light)", ic: "var(--amber)", label: "Tổng Lead" },
  { key: "totalBanks" as const, icon: "ti-building-bank", bg: "var(--purple-light)", ic: "var(--purple)", label: "Đối tác ngân hàng" },
];

export function AdminOverviewPage() {
  const { data } = useQuery({ queryKey: ["admin", "overview"], queryFn: getAdminOverview });

  return (
    <div>
      {data?.topProductName && (
        <div
          style={{
            background: "linear-gradient(135deg,var(--navy),#0D1B33)",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <i className="ti ti-sparkles" style={{ color: "#34D399", fontSize: 18 }} />
          <span style={{ fontSize: 12.5, color: "white" }}>
            Sản phẩm được đánh giá cao nhất hiện tại: <strong>{data.topProductName}</strong>
          </span>
        </div>
      )}

      <div className="stats-row">
        {CARDS.map((c) => (
          <div className="stat-card" key={c.key}>
            <div className="stat-card-icon" style={{ background: c.bg }}>
              <i className={`ti ${c.icon}`} style={{ color: c.ic }} />
            </div>
            <div className="stat-card-val">{data ? data[c.key].toLocaleString("vi-VN") : "…"}</div>
            <div className="stat-card-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-eyebrow">Nền tảng</div>
              <h3>Lead theo tháng (6 tháng gần nhất)</h3>
            </div>
          </div>
          <div style={{ height: 220 }}>
            {data && (
              <Bar
                data={{
                  labels: data.monthlyLeads.map((m) => m.month),
                  datasets: [
                    {
                      label: "Lead",
                      data: data.monthlyLeads.map((m) => m.count),
                      backgroundColor: "#2563EB",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                }}
              />
            )}
          </div>
        </div>

        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-eyebrow">Phân tích</div>
              <h3>Phân bố chất lượng Lead</h3>
            </div>
          </div>
          <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {data && (
              <Doughnut
                data={{
                  labels: ["Điểm cao (≥80)", "Trung bình (50-79)", "Thấp (<50)"],
                  datasets: [
                    {
                      data: [data.leadQuality.high, data.leadQuality.medium, data.leadQuality.low],
                      backgroundColor: ["#34D399", "#FBBF24", "#F87171"],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
