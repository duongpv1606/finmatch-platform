"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATS = [
  { target: "50+", label: "Ngân hàng đối tác" },
  { target: "48K+", label: "Người dùng tin tưởng" },
  { target: "4.9★", label: "Đánh giá trung bình" },
  { target: "2.8 tỷ", label: "Doanh thu tháng" },
];

export function HeroSearch() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function goToAI() {
    router.push(`/ai${value ? `?q=${encodeURIComponent(value)}` : ""}`);
  }

  return (
    <div className="hero-search">
      <div className="hero-grid" />
      <div className="hero-search-badge">
        <div className="pulse" />
        <span>Nền tảng tài chính AI</span>
      </div>
      <h2>
        Trợ lý <span>Tài Chính AI</span> của bạn
      </h2>
      <p>Hỏi bất kỳ câu hỏi tài chính nào — AI sẽ phân tích và tư vấn ngay.</p>
      <div className="hero-input-wrap">
        <input
          className="hero-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goToAI()}
          placeholder="Tôi muốn mua nhà. Thu nhập 20 triệu/tháng..."
        />
        <button className="hero-send-btn" onClick={goToAI}>
          <i className="ti ti-arrow-right" />
        </button>
      </div>
      <div className="hero-stats">
        {STATS.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {i > 0 && <div style={{ width: 1, background: "rgba(255,255,255,.08)", marginRight: 24 }} />}
            <div>
              <div className="hero-stat-val">{s.target}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
