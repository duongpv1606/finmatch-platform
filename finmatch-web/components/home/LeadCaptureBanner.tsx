"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export function LeadCaptureBanner() {
  const router = useRouter();
  const { user, openAuthModal } = useAppStore();

  if (user) return null; // already a lead/customer — no need to prompt

  return (
    <div
      className="card"
      style={{
        marginBottom: 16,
        background: "linear-gradient(135deg,var(--navy) 0%,#0D1B33 100%)",
        border: "1px solid rgba(255,255,255,.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(37,99,235,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i className="ti ti-rocket" style={{ color: "#60A5FA", fontSize: 22 }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 3 }}>
            Tìm sản phẩm phù hợp trong 2 phút
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
            Đăng ký để lưu hồ sơ, hoặc hỏi AI ngay để nhận tư vấn miễn phí
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => router.push("/ai")}
          style={{
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            color: "white",
            borderRadius: 9,
            padding: "10px 18px",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          <i className="ti ti-message-circle" style={{ fontSize: 14 }} />
          Hỏi AI ngay
        </button>
        <button
          onClick={() => openAuthModal("register")}
          style={{
            background: "var(--blue)",
            border: "none",
            color: "white",
            borderRadius: 9,
            padding: "10px 18px",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Đăng ký ngay →
        </button>
      </div>
    </div>
  );
}
