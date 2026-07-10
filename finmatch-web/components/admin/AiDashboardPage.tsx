"use client";

import { useQuery } from "@tanstack/react-query";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler } from "chart.js";
import { Line } from "react-chartjs-2";
import { RoleGate } from "@/components/shared/RoleGate";
import { getAiOverview } from "@/services/platformService";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler);

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

function AiDashboardContent() {
  const { data } = useQuery({ queryKey: ["admin", "ai-overview"], queryFn: getAiOverview });

  const CARDS = [
    { val: data?.chatsToday, icon: "ti-message-circle", bg: "var(--blue-light)", ic: "var(--blue)", label: "Tin nhắn AI hôm nay" },
    { val: data?.totalLeadsFromAi, icon: "ti-target-arrow", bg: "var(--emerald-light)", ic: "var(--emerald)", label: "Lead tạo từ AI Chat" },
  ];

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg,var(--navy),#0D1B33)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className="live-dot" style={{ background: "#34D399" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#34D399", letterSpacing: ".1em", textTransform: "uppercase" }}>
            AI Operations · Realtime
          </span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 4 }}>Dashboard AI</h2>
        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.5)" }}>
          Số liệu thật từ hệ thống chat và lead — không hiển thị số liệu chưa đo được (độ hài lòng, uptime %...).
        </p>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {CARDS.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="stat-card-icon" style={{ background: c.bg }}>
              <i className={`ti ${c.icon}`} style={{ color: c.ic }} />
            </div>
            <div className="stat-card-val">{c.val?.toLocaleString("vi-VN") ?? "…"}</div>
            <div className="stat-card-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-eyebrow">Hoạt động AI</div>
              <h3>Số tin nhắn AI theo giờ (hôm nay)</h3>
            </div>
          </div>
          <div style={{ height: 220 }}>
            {data && (
              <Line
                data={{
                  labels: data.hourlyChats.map((h) => `${h.hour}h`),
                  datasets: [
                    {
                      label: "Tin nhắn",
                      data: data.hourlyChats.map((h) => h.count),
                      borderColor: "#2563EB",
                      backgroundColor: "rgba(37,99,235,.08)",
                      fill: true,
                      tension: 0.3,
                      pointRadius: 0,
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
              <div className="sec-eyebrow">Live Feed</div>
              <h3>Hoạt động gần đây</h3>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data?.recentActivity.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--gray-100)",
                  fontSize: 12,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--emerald)", marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ color: "var(--gray-600)" }}>{a.text}</div>
                  <div style={{ color: "var(--gray-400)", fontSize: 10.5 }}>{timeAgo(a.createdAt)}</div>
                </div>
              </div>
            ))}
            {(!data || data.recentActivity.length === 0) && (
              <div style={{ color: "var(--gray-400)", fontSize: 12.5 }}>Chưa có hoạt động nào.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AiDashboardPage() {
  return (
    <RoleGate allow={["admin", "super_admin"]}>
      <AiDashboardContent />
    </RoleGate>
  );
}
