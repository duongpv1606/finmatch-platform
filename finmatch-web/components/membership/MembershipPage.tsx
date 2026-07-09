"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RoleGate } from "@/components/shared/RoleGate";
import { PlanCard } from "@/components/membership/PlanCard";
import { getPlans, getMyMembership } from "@/services/membershipService";

function MembershipContent() {
  const params = useSearchParams();
  const [banner, setBanner] = useState<{ type: "success" | "failed"; message: string } | null>(null);

  const { data: plans } = useQuery({ queryKey: ["membership", "plans"], queryFn: getPlans });
  const { data: myMembership } = useQuery({ queryKey: ["membership", "me"], queryFn: getMyMembership });

  useEffect(() => {
    const payment = params.get("payment");
    const message = params.get("message");
    if (payment === "success") {
      setBanner({ type: "success", message: message ?? "Thanh toán thành công! Gói của bạn đã được nâng cấp." });
    } else if (payment === "failed" || payment === "cancelled") {
      setBanner({ type: "failed", message: message ?? "Thanh toán không thành công hoặc đã huỷ." });
    }
  }, [params]);

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 28px" }}>
        <span className="sec-eyebrow" style={{ display: "block" }}>
          Gói thành viên FinMatch
        </span>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--navy)", marginBottom: 8, letterSpacing: "-.5px" }}>
          Chọn gói phù hợp với bạn
        </h2>
        <p className="text-sm text-muted">
          Sale &amp; CTV: AI hỗ trợ bán hàng, CRM, cộng đồng chia sẻ kiến thức. Nâng cấp để mở khoá toàn bộ sức mạnh AI.
        </p>
      </div>

      {banner && (
        <div
          className="card"
          style={{
            maxWidth: 900,
            margin: "0 auto 20px",
            background: banner.type === "success" ? "var(--emerald-light)" : "#FEF2F2",
            border: `1px solid ${banner.type === "success" ? "rgba(16,185,129,.2)" : "rgba(220,38,38,.2)"}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: banner.type === "success" ? "var(--emerald-dark)" : "#991B1B" }}>
            {banner.type === "success" ? "✅ " : "⚠️ "}
            {banner.message}
          </div>
        </div>
      )}

      {myMembership && myMembership.tier !== "free" && (
        <div style={{ maxWidth: 900, margin: "0 auto 20px" }}>
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg,var(--navy),#0D2040)",
              border: "1px solid rgba(255,255,255,.07)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: "rgba(16,185,129,.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className="ti ti-crown" style={{ color: "#34D399", fontSize: 19 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                Bạn đang dùng gói {myMembership.tier === "pro" ? "Sale Pro" : "Elite Agency"}
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.45)" }}>
                {myMembership.expiresAt
                  ? `Hết hạn ${new Date(myMembership.expiresAt).toLocaleDateString("vi-VN")}`
                  : "Đang hoạt động"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid3" style={{ maxWidth: 980, margin: "0 auto 28px" }}>
        {plans?.map((p) => (
          <PlanCard key={p.id} plan={p} currentTier={myMembership?.tier ?? "free"} />
        ))}
      </div>
    </div>
  );
}

export function MembershipPage() {
  return (
    <RoleGate allow={["customer", "sale", "agency", "bank", "admin", "super_admin"]}>
      <MembershipContent />
    </RoleGate>
  );
}
