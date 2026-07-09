"use client";

import { useState } from "react";
import { MembershipPlan, MembershipTier, checkoutStripe, checkoutVnpay } from "@/services/membershipService";

export function PlanCard({
  plan,
  currentTier,
}: {
  plan: MembershipPlan;
  currentTier: MembershipTier;
}) {
  const [providerOpen, setProviderOpen] = useState(false);
  const [loading, setLoading] = useState<"stripe" | "vnpay" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isCurrent = plan.id === currentTier;

  async function handlePay(provider: "stripe" | "vnpay") {
    if (plan.id === "free") return;
    setError(null);
    setLoading(provider);
    try {
      const url =
        provider === "stripe"
          ? await checkoutStripe(plan.id as "pro" | "elite")
          : await checkoutVnpay(plan.id as "pro" | "elite");
      window.location.href = url;
    } catch (e) {
      setError((e as Error).message);
      setLoading(null);
    }
  }

  return (
    <div className={`plan-card${plan.featured ? " featured" : ""}`}>
      <div className="plan-name">{plan.name}</div>
      <div className="plan-price">
        {plan.priceVnd.toLocaleString("vi-VN")}
        <span> đ {plan.period}</span>
      </div>
      <div className="plan-desc">{plan.desc}</div>
      <ul className="plan-feature-list">
        {plan.features.map((f) => (
          <li key={f.text} className={f.ok ? "" : "disabled"}>
            <i className={`ti ${f.ok ? "ti-circle-check" : "ti-circle-minus"}`} />
            {f.text}
          </li>
        ))}
      </ul>

      {plan.id === "free" ? (
        <button className={`plan-btn${isCurrent ? " current" : " outline"}`} disabled={isCurrent}>
          {isCurrent ? "Gói hiện tại" : "Miễn phí"}
        </button>
      ) : isCurrent ? (
        <button className="plan-btn current" disabled>
          Gói hiện tại
        </button>
      ) : !providerOpen ? (
        <button
          className={`plan-btn ${plan.featured ? "primary" : "outline"}`}
          onClick={() => setProviderOpen(true)}
        >
          Nâng cấp ngay
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            className="plan-btn primary"
            onClick={() => handlePay("stripe")}
            disabled={loading !== null}
          >
            {loading === "stripe" ? "Đang chuyển hướng..." : "💳 Thanh toán qua Stripe"}
          </button>
          <button
            className="plan-btn outline"
            onClick={() => handlePay("vnpay")}
            disabled={loading !== null}
          >
            {loading === "vnpay" ? "Đang chuyển hướng..." : "🏦 Thanh toán qua VNPay"}
          </button>
          <button
            onClick={() => setProviderOpen(false)}
            style={{ background: "none", border: "none", fontSize: 11, color: "var(--gray-400)", cursor: "pointer" }}
          >
            Huỷ
          </button>
        </div>
      )}
      {error && <div style={{ color: "#DC2626", fontSize: 11, marginTop: 8 }}>{error}</div>}
    </div>
  );
}
