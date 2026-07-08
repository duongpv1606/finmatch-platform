"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { RoleGate } from "@/components/shared/RoleGate";
import { getSaleStats } from "@/services/salesService";
import { getMyLeads } from "@/services/leadsService";
import { generateSaleContent } from "@/services/salesService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  qualified: "Tiềm năng",
  converted: "Đã chốt",
  lost: "Không thành công",
};
const STATUS_COLOR: Record<string, string> = {
  new: "#94A3B8",
  contacted: "#60A5FA",
  qualified: "#FBBF24",
  converted: "#34D399",
  lost: "#F87171",
};

function SaleDashboardContent() {
  const { data: stats } = useQuery({ queryKey: ["sale", "stats"], queryFn: getSaleStats });
  const { data: myLeads } = useQuery({ queryKey: ["marketplace", "my-leads"], queryFn: getMyLeads });

  const [contentType, setContentType] = useState<"sms" | "email" | "zalo" | "call">("sms");
  const [contentResult, setContentResult] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  async function handleGenerateContent() {
    const target = myLeads?.[0];
    if (!target) {
      setContentError("Bạn cần mua ít nhất 1 lead trước khi tạo nội dung AI.");
      return;
    }
    setContentError(null);
    setGenerating(true);
    try {
      const content = await generateSaleContent(target.id, contentType);
      setContentResult(content);
    } catch (e) {
      setContentError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  const kpis = [
    {
      label: "Lead mua tháng này",
      value: stats?.leadsThisMonth ?? 0,
      icon: "ti-bolt",
      color: "var(--emerald)",
      bg: "var(--emerald-light)",
    },
    {
      label: "Đã chốt thành công",
      value: stats?.converted ?? 0,
      icon: "ti-check",
      color: "var(--blue)",
      bg: "var(--blue-light)",
      sub: `Conversion ${stats?.conversionRate ?? 0}%`,
    },
    {
      label: "Tổng lead đã mua",
      value: stats?.totalPurchased ?? 0,
      icon: "ti-coins",
      color: "var(--amber)",
      bg: "var(--amber-light)",
    },
    {
      label: "Xếp hạng",
      value: stats?.rank ? `#${stats.rank}` : "—",
      icon: "ti-star",
      color: "var(--purple)",
      bg: "var(--purple-light)",
      sub: stats?.totalSales ? `/ ${stats.totalSales} sale` : undefined,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="sec-eyebrow">Sale Portal</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 4 }}>Sale Dashboard</h2>
          <p className="text-sm text-muted">Số liệu thật từ lead bạn đã mua — không phải dữ liệu mẫu.</p>
        </div>
        <Link
          href="/dashboard/marketplace"
          style={{
            background: "var(--blue)",
            color: "white",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 7,
            textDecoration: "none",
          }}
        >
          <i className="ti ti-bolt" style={{ fontSize: 15 }} />
          Mua Lead mới
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {kpis.map((k) => (
          <div className="sale-metric" style={{ ["--metric-color" as string]: k.color }} key={k.label}>
            <div className="sale-metric-accent" />
            <div className="metric-icon" style={{ background: k.bg, marginBottom: 10 }}>
              <i className={`ti ${k.icon}`} style={{ color: k.color, fontSize: 17 }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)", marginBottom: 4 }}>{k.value}</div>
            {k.sub && <div style={{ fontSize: 12, color: k.color }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid-main" style={{ alignItems: "start", gridTemplateColumns: "1.4fr 1fr" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ background: "linear-gradient(145deg,#0A1628,#0F2040)", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#34D399", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>
                  ✦ Quản lý khách hàng
                </div>
                <h3 style={{ color: "white", fontSize: 15, fontWeight: 700 }}>Xem &amp; chăm sóc từng khách hàng tại CRM</h3>
              </div>
              <Link
                href="/dashboard/crm"
                style={{
                  background: "linear-gradient(135deg,var(--emerald),#059669)",
                  borderRadius: 9,
                  padding: "10px 18px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <i className="ti ti-address-book" style={{ fontSize: 15 }} />
                Mở CRM →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {(myLeads ?? []).slice(0, 3).map((l) => (
                <div key={l.id} style={{ background: "rgba(255,255,255,.06)", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "white", marginBottom: 3 }}>{l.customerName}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>{STATUS_LABEL[l.status] ?? l.status}</div>
                </div>
              ))}
              {(!myLeads || myLeads.length === 0) && (
                <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                  Chưa có khách hàng nào — mua lead ở Marketplace để bắt đầu.
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="sec-hd">
              <h3>Lead mua theo tháng (6 tháng gần nhất)</h3>
            </div>
            <div style={{ position: "relative", height: 200 }}>
              {stats && (
                <Bar
                  data={{
                    labels: stats.monthly.map((m) => m.month),
                    datasets: [
                      {
                        label: "Lead",
                        data: stats.monthly.map((m) => m.count),
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
              <h3>Funnel chuyển đổi</h3>
            </div>
            {stats &&
              Object.entries(stats.byStatus).map(([status, count]) => {
                const pct = stats.totalPurchased > 0 ? Math.round((count / stats.totalPurchased) * 100) : 0;
                return (
                  <div key={status} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "var(--gray-600)", fontWeight: 600 }}>{STATUS_LABEL[status]}</span>
                      <span style={{ color: "var(--gray-400)" }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: "var(--gray-100)", borderRadius: 20 }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: STATUS_COLOR[status],
                          borderRadius: 20,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="content-writer-card">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#34D399", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>
                ✦ AI Content Writer
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 6, lineHeight: 1.3 }}>
                Viết nội dung chăm sóc khách tự động
              </h4>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginBottom: 16, lineHeight: 1.6 }}>
                AI viết SMS, email, Zalo và kịch bản gọi điện — cá nhân hóa theo lead đầu tiên trong danh sách của bạn.
              </p>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as typeof contentType)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.13)",
                  borderRadius: 9,
                  padding: "10px 13px",
                  fontSize: 12,
                  color: "rgba(255,255,255,.8)",
                  marginBottom: 10,
                }}
              >
                <option value="sms">📱 Tin nhắn SMS follow-up</option>
                <option value="email">📧 Email tư vấn chuyên nghiệp</option>
                <option value="zalo">💬 Zalo chăm sóc khách hàng</option>
                <option value="call">📞 Kịch bản gọi điện</option>
              </select>
              <button
                onClick={handleGenerateContent}
                disabled={generating}
                style={{
                  width: "100%",
                  background: "var(--emerald)",
                  border: "none",
                  borderRadius: 9,
                  padding: 11,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <i className="ti ti-sparkles" style={{ fontSize: 15 }} />
                {generating ? "Đang tạo..." : "Tạo nội dung AI"}
              </button>
              {contentError && (
                <div style={{ color: "#FCA5A5", fontSize: 11, marginTop: 8 }}>{contentError}</div>
              )}
              {contentResult && (
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      background: "rgba(255,255,255,.07)",
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 10,
                      padding: 14,
                      fontSize: 12,
                      color: "rgba(255,255,255,.78)",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {contentResult}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(contentResult)}
                    style={{
                      marginTop: 9,
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,.18)",
                      borderRadius: 8,
                      padding: "7px 14px",
                      fontSize: 11,
                      color: "rgba(255,255,255,.55)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <i className="ti ti-copy" style={{ fontSize: 13 }} />
                    Copy nội dung
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SaleDashboard() {
  return (
    <RoleGate allow={["sale", "agency", "bank", "admin", "super_admin"]}>
      <SaleDashboardContent />
    </RoleGate>
  );
}
