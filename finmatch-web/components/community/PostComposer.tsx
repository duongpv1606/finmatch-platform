"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { PostType, createPost } from "@/services/communityService";

const HINTS: Record<string, string> = {
  sale: "💼 Chia sẻ kinh nghiệm bán hàng hoặc trả lời câu hỏi của khách hàng",
  customer: "❓ Đặt câu hỏi về sản phẩm tài chính — Sale và chuyên gia sẽ tư vấn",
  admin: "📢 Đăng thông báo hoặc chia sẻ kiến thức với cộng đồng",
};

export function PostComposer() {
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [type, setType] = useState<PostType>("question");
  const [posting, setPosting] = useState(false);

  if (!user) return null;

  const TYPES: { id: PostType; label: string }[] = [
    { id: "question", label: "❓ Câu hỏi" },
    { id: "share", label: "💡 Chia sẻ" },
    { id: "review", label: "⭐ Đánh giá" },
  ];

  async function handlePost() {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await createPost(type, text);
      setText("");
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="card" style={{ padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          className="post-avatar"
          style={{ background: "linear-gradient(135deg,var(--blue),var(--emerald))", fontSize: 13 }}
        >
          {user?.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--gray-400)",
              marginBottom: 8,
              background: "var(--gray-50)",
              borderRadius: 7,
              padding: "7px 10px",
            }}
          >
            {HINTS[user.role] ?? HINTS.customer}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Chia sẻ nhu cầu, hỏi về sản phẩm tài chính, hay chia sẻ kinh nghiệm..."
            style={{
              width: "100%",
              border: "1.5px solid var(--gray-200)",
              borderRadius: 10,
              padding: "11px 13px",
              fontSize: 13,
              outline: "none",
              resize: "none",
              lineHeight: 1.5,
              fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  className={`filter-pill${type === t.id ? " active" : ""}`}
                  style={{ fontSize: 11, padding: "4px 11px" }}
                  onClick={() => setType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={handlePost}
              disabled={posting}
              style={{
                marginLeft: "auto",
                background: "var(--blue)",
                color: "white",
                border: "none",
                borderRadius: 9,
                padding: "8px 18px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {posting ? "Đang đăng..." : "Đăng bài"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
