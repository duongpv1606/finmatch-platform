"use client";

import { ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";
import { UserRole } from "@/types";

export function RoleGate({
  allow,
  children,
}: {
  allow: UserRole[];
  children: ReactNode;
}) {
  const { user, role, openAuthModal } = useAppStore();

  if (!user) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">⚡</div>
        <h3>Cần đăng nhập</h3>
        <p>Khu vực này dành cho Sale/Agency/Bank/Admin — đăng nhập để tiếp tục.</p>
        <button
          onClick={() => openAuthModal("login")}
          style={{
            background: "var(--navy)",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "11px 24px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Đăng nhập →
        </button>
      </div>
    );
  }

  if (!allow.includes(role)) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">⚡</div>
        <h3>Không đủ quyền truy cập</h3>
        <p>
          Tài khoản {user.email} hiện có quyền &quot;{role}&quot; — khu vực này dành cho{" "}
          {allow.join(" / ")}.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
