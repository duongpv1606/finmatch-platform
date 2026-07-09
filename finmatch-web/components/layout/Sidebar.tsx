"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { NAV_SECTIONS, isNavItemVisible } from "@/constants/nav";
import { useAppStore } from "@/store/useAppStore";
import * as authService from "@/services/authService";
import { getUnreadCount } from "@/services/messagesService";

export function Sidebar() {
  const pathname = usePathname();
  const { role, user, openAuthModal, logoutLocal } = useAppStore();

  const { data: unreadCount } = useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: getUnreadCount,
    enabled: !!user,
    refetchInterval: 15000,
  });

  async function handleLogout() {
    await authService.logout();
    logoutLocal();
  }

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div className="logo-dot" />
        <div className="logo-text">FinMatch</div>
        <div className="logo-badge">AI</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) =>
            isNavItemVisible(item, role)
          );
          if (visibleItems.length === 0) return null;
          return (
            <div className="nav-section" key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {visibleItems.map((item) => {
                const active = pathname === item.href;
                const liveBadge =
                  item.href === "/messages" && unreadCount && unreadCount > 0
                    ? { text: String(unreadCount), color: "var(--red, #DC2626)" }
                    : item.badge;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${active ? " active" : ""}`}
                  >
                    <i className={`ti ti-${item.icon}`} />
                    <span>{item.label}</span>
                    {liveBadge && (
                      <span
                        className="nav-badge"
                        style={{ background: liveBadge.color, color: "#fff" }}
                      >
                        {liveBadge.text}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!user ? (
          <div id="sidebarGuest">
            <button
              onClick={() => openAuthModal("login")}
              style={{
                width: "100%",
                background: "linear-gradient(135deg,var(--blue),#1D4ED8)",
                color: "white",
                border: "none",
                borderRadius: 9,
                padding: 11,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 7,
                boxShadow: "0 4px 12px rgba(37,99,235,.3)",
                letterSpacing: "-.1px",
              }}
            >
              <i className="ti ti-login" style={{ fontSize: 13, marginRight: 5 }} />
              Đăng nhập
            </button>
            <button
              onClick={() => openAuthModal("register")}
              style={{
                width: "100%",
                background: "rgba(255,255,255,.08)",
                color: "rgba(255,255,255,.6)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 9,
                padding: 9,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Đăng ký tài khoản
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 8px" }}>
            <div className="user-avatar">{user.name.charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name}
              </div>
              <div className="user-plan">{role}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,.5)",
                cursor: "pointer",
                fontSize: 15,
                padding: 4,
              }}
            >
              <i className="ti ti-logout" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
