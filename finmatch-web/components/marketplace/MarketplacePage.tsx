"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleGate } from "@/components/shared/RoleGate";
import { LeadCard } from "@/components/marketplace/LeadCard";
import { getMarketplaceLeads, getMyLeads } from "@/services/leadsService";
import { getMyProfile } from "@/services/authService";

type Tab = "marketplace" | "mine";

const CATEGORY_LABEL: Record<string, string> = {
  loan: "Vay vốn",
  card: "Thẻ tín dụng",
  insurance: "Bảo hiểm",
  invest: "Đầu tư",
  savings: "Tiết kiệm",
};

function MarketplaceContent() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("marketplace");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["marketplace", "leads"],
    queryFn: getMarketplaceLeads,
  });
  const { data: myLeads } = useQuery({
    queryKey: ["marketplace", "my-leads"],
    queryFn: getMyLeads,
  });
  const { data: profile } = useQuery({
    queryKey: ["marketplace", "my-profile"],
    queryFn: getMyProfile,
  });

  function handlePurchased() {
    queryClient.invalidateQueries({ queryKey: ["marketplace"] });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="sec-eyebrow">Marketplace</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>Lead Marketplace</h2>
          <p className="text-sm text-muted">Mua lead thật từ khách hàng đã chat AI, chấm điểm minh bạch.</p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--emerald-light)",
            border: "1.5px solid rgba(16,185,129,.2)",
            borderRadius: 11,
            padding: "9px 16px",
          }}
        >
          <i className="ti ti-coin" style={{ color: "var(--emerald-dark)", fontSize: 16 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--emerald-dark)" }}>
            {profile ? `${profile.credits} credit` : "..."}
          </span>
        </div>
      </div>

      <div className="tabs" style={{ maxWidth: 320 }}>
        <div className={`tab${tab === "marketplace" ? " active" : ""}`} onClick={() => setTab("marketplace")}>
          Marketplace ({leads?.length ?? 0})
        </div>
        <div className={`tab${tab === "mine" ? " active" : ""}`} onClick={() => setTab("mine")}>
          Đã mua ({myLeads?.length ?? 0})
        </div>
      </div>

      {tab === "marketplace" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {isLoading && <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Đang tải...</div>}
          {leads?.map((lead, i) => (
            <LeadCard key={lead.id} lead={lead} index={i} onPurchased={handlePurchased} />
          ))}
          {leads?.length === 0 && !isLoading && (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--gray-400)" }}>
              Chưa có lead nào trong Marketplace. Lead sẽ tự xuất hiện khi có khách hàng chat AI và để lại thông tin liên hệ.
            </div>
          )}
        </div>
      )}

      {tab === "mine" && (
        <div className="card">
          <div className="table-wrap" style={{ overflowX: "auto" }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Nhu cầu</th>
                  <th>Score</th>
                  <th>Trạng thái</th>
                  <th>Ngày mua</th>
                </tr>
              </thead>
              <tbody>
                {myLeads?.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.customerName}</td>
                    <td>{l.phone}</td>
                    <td>{CATEGORY_LABEL[l.productCategory] ?? l.productCategory}</td>
                    <td style={{ color: "var(--blue)", fontWeight: 700 }}>{l.score}/100</td>
                    <td>{l.status}</td>
                    <td style={{ color: "var(--gray-400)", fontSize: 12 }}>
                      {new Date(l.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
                {myLeads?.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)" }}>
                      Bạn chưa mua lead nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function MarketplacePage() {
  return (
    <RoleGate allow={["sale", "agency", "bank", "admin", "super_admin"]}>
      <MarketplaceContent />
    </RoleGate>
  );
}
