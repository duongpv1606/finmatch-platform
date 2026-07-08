"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import * as authService from "@/services/authService";
import { UserRole } from "@/types";

export function AuthModal() {
  const { authModalOpen, authView, closeAuthModal, switchAuthView, setSession } =
    useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register fields
  const [regRole, setRegRole] = useState<Extract<UserRole, "customer" | "sale">>(
    "customer"
  );
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  async function handleQuickLogin(role: "customer" | "sale") {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.quickLogin(role);
      setSession(result.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setError(null);
    if (!loginEmail || !loginPass) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      const result = await authService.login(loginEmail, loginPass);
      setSession(result.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError(null);
    if (!regName || !regEmail || regPass.length < 6) {
      setError("Điền đủ thông tin — mật khẩu tối thiểu 6 ký tự");
      return;
    }
    setLoading(true);
    try {
      const result = await authService.register(regName, regEmail, regPass, regRole);
      setSession(result.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`auth-overlay${authModalOpen ? " open" : ""}`}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={closeAuthModal}>
          <i className="ti ti-x" />
        </button>
        <div className="auth-logo">
          <div className="auth-logo-dot" />
          <div className="auth-logo-text">FinMatch</div>
          <div className="auth-logo-badge">AI</div>
        </div>

        {authView === "login" ? (
          <div>
            <div className="auth-title">Đăng nhập</div>
            <div className="auth-sub">
              Chào mừng quay lại — tiếp tục hành trình tài chính của bạn
            </div>

            <div
              style={{
                background: "var(--gray-50)",
                border: "1px solid var(--gray-200)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--gray-400)",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 9,
                }}
              >
                Demo nhanh — Click để đăng nhập
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  onClick={() => handleQuickLogin("customer")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: 9,
                    cursor: "pointer",
                    background: "white",
                  }}
                >
                  <i className="ti ti-user" style={{ fontSize: 16, color: "var(--emerald)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)" }}>
                      Khách hàng
                    </div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
                      Xem sản phẩm, nhận tư vấn AI
                    </div>
                  </div>
                  <span className="role-badge role-badge-customer">Khách hàng</span>
                </div>
                <div
                  onClick={() => handleQuickLogin("sale")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: 9,
                    cursor: "pointer",
                    background: "white",
                  }}
                >
                  <i className="ti ti-chart-bar" style={{ fontSize: 16, color: "var(--blue)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)" }}>
                      Sale
                    </div>
                    <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
                      Mua lead, xem dashboard, viết content AI
                    </div>
                  </div>
                  <span className="role-badge role-badge-sale">Sale</span>
                </div>
              </div>
            </div>

            <div className="auth-divider">
              <span>hoặc đăng nhập bằng tài khoản</span>
            </div>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {error && (
              <div style={{ color: "var(--red, #DC2626)", fontSize: 12, marginBottom: 10 }}>
                {error}
              </div>
            )}
            <button className="auth-submit" onClick={handleLogin} disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập →"}
            </button>
            <div className="auth-switch">
              Chưa có tài khoản?{" "}
              <a onClick={() => switchAuthView("register")}>Đăng ký miễn phí</a>
            </div>
          </div>
        ) : (
          <div>
            <div className="auth-title">Tạo tài khoản</div>
            <div className="auth-sub">Chọn loại tài khoản phù hợp với bạn</div>
            <div className="auth-role-tabs" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div
                className={`auth-role-tab${regRole === "customer" ? " selected" : ""}`}
                onClick={() => setRegRole("customer")}
              >
                <i className="ti ti-user" />
                <span>Khách hàng</span>
                <small>Tìm sản phẩm</small>
              </div>
              <div
                className={`auth-role-tab${regRole === "sale" ? " selected" : ""}`}
                onClick={() => setRegRole("sale")}
              >
                <i className="ti ti-chart-bar" />
                <span>Sale</span>
                <small>Mua lead</small>
              </div>
            </div>
            <div className="auth-field">
              <label>Họ và tên</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="Ít nhất 6 ký tự"
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>
            {error && (
              <div style={{ color: "var(--red, #DC2626)", fontSize: 12, marginBottom: 10 }}>
                {error}
              </div>
            )}
            <button className="auth-submit" onClick={handleRegister} disabled={loading}>
              {loading ? "Đang xử lý..." : "Tạo tài khoản →"}
            </button>
            <div className="auth-switch">
              Đã có tài khoản? <a onClick={() => switchAuthView("login")}>Đăng nhập</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
