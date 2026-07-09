"use client";

import { usePathname, useRouter } from "next/navigation";

const HIDDEN_ON = ["/ai", "/messages"];
const HIDDEN_PREFIX = ["/dashboard"];

export function FloatingAskAI() {
  const pathname = usePathname();
  const router = useRouter();

  if (HIDDEN_ON.includes(pathname) || HIDDEN_PREFIX.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <button
      onClick={() => router.push("/ai")}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 40,
        background: "var(--blue)",
        color: "white",
        border: "none",
        borderRadius: 30,
        padding: "13px 22px",
        fontSize: 13,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 8px 24px rgba(37,99,235,.35)",
        cursor: "pointer",
      }}
    >
      <span className="live-dot" style={{ background: "white" }} />
      <i className="ti ti-sparkles" style={{ fontSize: 15 }} />
      Hỏi AI ngay
    </button>
  );
}
