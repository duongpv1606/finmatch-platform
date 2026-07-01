"use client";

import { useAppStore } from "@/store/useAppStore";

export function Topbar({ title }: { title: string }) {
  const { lang, setLang } = useAppStore();

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-search">
        <i className="ti ti-search" />
        <input type="text" placeholder="Tìm kiếm sản phẩm, tư vấn..." />
      </div>
      <div className="topbar-actions">
        <div className="lang-switcher">
          <button
            className={`lang-btn${lang === "vi" ? " active" : ""}`}
            onClick={() => setLang("vi")}
          >
            🇻🇳 VI
          </button>
          <button
            className={`lang-btn${lang === "en" ? " active" : ""}`}
            onClick={() => setLang("en")}
          >
            🇬🇧 EN
          </button>
        </div>
        <div className="icon-btn notif-dot">
          <i className="ti ti-bell" />
        </div>
        <div className="icon-btn">
          <i className="ti ti-help" />
        </div>
      </div>
    </div>
  );
}
