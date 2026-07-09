"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { createLead } from "@/services/leadsService";

const PHONE_REGEX = /^0\d{9}$/;

export function QuickLeadModal() {
  const { quickLeadModalOpen, closeQuickLeadModal } = useAppStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    if (!PHONE_REGEX.test(phone)) {
      setError("Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx)");
      return;
    }
    setSubmitting(true);
    try {
      // Reuses the same public, already-tested Lead creation endpoint the
      // AI chat flow uses — a phone-book style opt-in, no account needed.
      await createLead({
        customerName: name.trim(),
        phone,
        productCategory: "loan",
        source: "manual",
        score: 60, // no AI-derived profile here, so a neutral baseline score
        region: "Không rõ",
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    closeQuickLeadModal();
    // Reset for next time, after the close animation would finish.
    setTimeout(() => {
      setName("");
      setPhone("");
      setDone(false);
      setError(null);
    }, 300);
  }

  return (
    <div className={`auth-overlay${quickLeadModalOpen ? " open" : ""}`}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={handleClose}>
          <i className="ti ti-x" />
        </button>
        <div className="auth-logo">
          <div className="auth-logo-dot" />
          <div className="auth-logo-text">FinMatch</div>
          <div className="auth-logo-badge">AI</div>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--emerald-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <i className="ti ti-check" style={{ fontSize: 24, color: "var(--emerald-dark)" }} />
            </div>
            <div className="auth-title" style={{ fontSize: 18 }}>
              Đã ghi nhận!
            </div>
            <div className="auth-sub" style={{ marginBottom: 20 }}>
              Chuyên viên tư vấn sẽ liên hệ bạn qua số {phone} trong 15–30 phút.
            </div>
            <button className="auth-submit" onClick={handleClose}>
              Đóng
            </button>
          </div>
        ) : (
          <div>
            <div className="auth-title">Đăng ký nhận tư vấn</div>
            <div className="auth-sub">
              Để lại thông tin — chuyên viên sẽ gọi lại tư vấn miễn phí, không cần tạo tài khoản.
            </div>
            <div className="auth-field">
              <label>Họ và tên</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label>Số điện thoại</label>
              <input
                type="tel"
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                maxLength={10}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            {error && (
              <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 10 }}>{error}</div>
            )}
            <button className="auth-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi yêu cầu tư vấn →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
