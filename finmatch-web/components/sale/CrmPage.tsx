"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { RoleGate } from "@/components/shared/RoleGate";
import { getSaleStats } from "@/services/salesService";
import { getMyLeads, PurchasedLead } from "@/services/leadsService";
import { updateLeadCrm } from "@/services/salesService";

const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  qualified: "Tiềm năng",
  converted: "Đã chốt",
  lost: "Không thành công",
};
const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];
const CATEGORY_LABEL: Record<string, string> = {
  loan: "Vay vốn",
  card: "Thẻ tín dụng",
  insurance: "Bảo hiểm",
  invest: "Đầu tư",
  savings: "Tiết kiệm",
};

function LeadDetailCard({ lead }: { lead: PurchasedLead }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleStatusChange(status: string) {
    await updateLeadCrm(lead.id, { status });
    queryClient.invalidateQueries({ queryKey: ["marketplace", "my-leads"] });
    queryClient.invalidateQueries({ queryKey: ["sale", "stats"] });
  }

  async function handleSaveNotes() {
    setSaving(true);
    try {
      await updateLeadCrm(lead.id, { notes });
      queryClient.invalidateQueries({ queryKey: ["marketplace", "my-leads"] });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid var(--gray-100)",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{lead.customerName}</div>
          <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
            {lead.phone} · {CATEGORY_LABEL[lead.productCategory] ?? lead.productCategory} · Score {lead.score}/100
          </div>
        </div>
        <select
          value={lead.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{
            fontSize: 12,
            padding: "5px 10px",
            borderRadius: 7,
            border: "1px solid var(--gray-200)",
          }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ghi chú chăm sóc khách hàng..."
        rows={2}
        style={{
          width: "100%",
          fontSize: 12.5,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid var(--gray-200)",
          fontFamily: "inherit",
          resize: "vertical",
          marginBottom: 8,
        }}
      />
      <button
        onClick={handleSaveNotes}
        disabled={saving}
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--blue)",
          background: "var(--blue-light)",
          border: "none",
          borderRadius: 7,
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        {saving ? "Đang lưu..." : "Lưu ghi chú"}
      </button>
    </div>
  );
}

function CrmContent() {
  const [tab, setTab] = useState<string>("all");
  const { data: myLeads } = useQuery({ queryKey: ["marketplace", "my-leads"], queryFn: getMyLeads });
  const { data: stats } = useQuery({ queryKey: ["sale", "stats"], queryFn: getSaleStats });

  const filtered = tab === "all" ? myLeads : myLeads?.filter((l) => l.status === tab);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <span className="sec-eyebrow">CRM cá nhân</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 4 }}>Quản lý khách hàng của tôi</h2>
          <p className="text-sm text-muted">Toàn bộ khách hàng bạn đã mua — cập nhật trạng thái và ghi chú chăm sóc.</p>
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
          <i className="ti ti-plus" style={{ fontSize: 15 }} />
          Mua thêm Lead
        </Link>
      </div>

      <div className="stats-row">
        {[
          { label: "Tổng khách hàng", val: stats?.totalPurchased ?? 0 },
          { label: "Đã chốt", val: stats?.converted ?? 0 },
          { label: "Conversion", val: `${stats?.conversionRate ?? 0}%` },
          { label: "Không thành công", val: stats?.lost ?? 0 },
        ].map((s) => (
          <div className="card" key={s.label} style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--gray-400)", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)" }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="sec-hd" style={{ marginBottom: 10 }}>
          <h3>Danh sách khách hàng</h3>
          <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{filtered?.length ?? 0} khách</span>
        </div>
        <div className="tabs" style={{ marginBottom: 14 }}>
          <div className={`tab${tab === "all" ? " active" : ""}`} onClick={() => setTab("all")}>
            Tất cả
          </div>
          {STATUSES.map((s) => (
            <div key={s} className={`tab${tab === s ? " active" : ""}`} onClick={() => setTab(s)}>
              {STATUS_LABEL[s]}
            </div>
          ))}
        </div>
        {filtered?.map((l) => (
          <LeadDetailCard key={l.id} lead={l} />
        ))}
        {filtered?.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--gray-400)", padding: 20 }}>
            Chưa có khách hàng nào ở trạng thái này.
          </div>
        )}
      </div>
    </div>
  );
}

export function CrmPage() {
  return (
    <RoleGate allow={["sale", "agency", "bank", "admin", "super_admin"]}>
      <CrmContent />
    </RoleGate>
  );
}
