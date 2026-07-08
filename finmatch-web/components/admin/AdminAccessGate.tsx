"use client";

import { ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";

export function AdminAccessGate({ children }: { children: ReactNode }) {
  const { user, role, openAuthModal } = useAppStore();

  if (!user) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">⚡</div>
        <h3>Chỉ dành cho Admin / Chủ sở hữu</h3>
        <p>Khu vực này được bảo vệ. Chỉ Admin mới có toàn quyền truy cập dashboard quản trị.</p>
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
          Đăng nhập Admin →
        </button>
      </div>
    );
  }

  if (role !== "admin" && role !== "super_admin") {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">⚡</div>
        <h3>Không đủ quyền truy cập</h3>
        <p>
          Tài khoản {user.email} hiện có quyền &quot;{role}&quot; — khu vực này chỉ dành cho Admin.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
