"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import { getPosts, getTopMembers, getHotTopics, getAiSummary } from "@/services/communityService";

const TABS: { id: "all" | "question" | "share" | "review"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "question", label: "❓ Hỏi đáp" },
  { id: "share", label: "💡 Chia sẻ" },
  { id: "review", label: "⭐ Đánh giá" },
];

export function CommunityPage() {
  const { user, openAuthModal } = useAppStore();
  const [tab, setTab] = useState<"all" | "question" | "share" | "review">("all");

  const { data: posts, isLoading } = useQuery({ queryKey: ["community", "posts"], queryFn: getPosts });
  const { data: topMembers } = useQuery({ queryKey: ["community", "top-members"], queryFn: getTopMembers });
  const { data: hotTopics } = useQuery({ queryKey: ["community", "hot-topics"], queryFn: getHotTopics });
  const { data: aiSummary } = useQuery({ queryKey: ["community", "ai-summary"], queryFn: getAiSummary });

  const filtered = tab === "all" ? posts : posts?.filter((p) => p.type === tab);

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: 20 }}>
        <div className="sec-eyebrow">Cộng đồng</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 4, letterSpacing: "-.4px" }}>
          Cộng đồng FinMatch
        </h2>
        <p className="text-sm text-muted">Khách hàng đặt câu hỏi — Sale và chuyên gia tư vấn. Minh bạch, thực tế.</p>
      </div>

      {!user && (
        <div
          style={{
            background: "linear-gradient(135deg,var(--navy),#0D2040)",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <i className="ti ti-users" style={{ fontSize: 28, color: "#34D399", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 3 }}>
              Đăng nhập để tham gia thảo luận
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
              Đăng bài, bình luận và đặt câu hỏi cho chuyên gia
            </div>
          </div>
          <button
            onClick={() => openAuthModal("login")}
            style={{
              background: "var(--emerald)",
              color: "white",
              border: "none",
              borderRadius: 9,
              padding: "9px 18px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Đăng nhập
          </button>
        </div>
      )}

      <div className="grid-main" style={{ alignItems: "start" }}>
        <div>
          <PostComposer />

          <div className="tabs" style={{ maxWidth: 420, marginBottom: 16 }}>
            {TABS.map((t) => (
              <div key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </div>
            ))}
          </div>

          {isLoading && <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Đang tải...</div>}
          {filtered?.map((p) => (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <PostCard post={p} />
            </div>
          ))}
          {filtered?.length === 0 && !isLoading && (
            <div className="card" style={{ textAlign: "center", color: "var(--gray-400)" }}>
              Chưa có bài viết nào. {user ? "Hãy là người đầu tiên chia sẻ!" : "Đăng nhập để bắt đầu thảo luận."}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <i className="ti ti-sparkles" style={{ color: "var(--amber)", fontSize: 15 }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>AI Tổng hợp · Cộng đồng</h3>
            </div>
            <p style={{ fontSize: 12, color: "var(--gray-500)", lineHeight: 1.6 }}>
              {aiSummary ?? "Đang tổng hợp..."}
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>Top thành viên</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topMembers?.map((m, i) => (
                <div key={m.name + i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 700, color: "var(--gray-400)", width: 16 }}>#{i + 1}</span>
                  <span style={{ flex: 1, color: "var(--navy)", fontWeight: 600 }}>{m.name}</span>
                  <span style={{ color: "var(--gray-400)" }}>{m.score} điểm</span>
                </div>
              ))}
              {(!topMembers || topMembers.length === 0) && (
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>Chưa có hoạt động nào.</div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
              Chủ đề đang thảo luận
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {hotTopics
                ?.filter((t) => t.count > 0)
                .map((t) => (
                  <span
                    key={t.type}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      background: "var(--gray-100)",
                      color: "var(--gray-600)",
                      padding: "5px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {t.type === "question" ? "❓" : t.type === "share" ? "💡" : "⭐"} {t.count}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
