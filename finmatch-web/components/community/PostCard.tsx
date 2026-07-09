"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { CommunityPost, addComment, toggleLike } from "@/services/communityService";

const ROLE_STYLE: Record<string, { cls: string; label: string }> = {
  sale: { cls: "post-role-sale", label: "Sale" },
  customer: { cls: "post-role-customer", label: "Khách hàng" },
  admin: { cls: "post-role-sale", label: "Admin" },
  agency: { cls: "post-role-sale", label: "Agency" },
  bank: { cls: "post-role-sale", label: "Ngân hàng" },
};
const TAG_LABEL: Record<string, string> = { question: "Hỏi đáp", share: "Chia sẻ", review: "Đánh giá" };
const AVATAR_BG = "linear-gradient(135deg,var(--blue),var(--emerald))";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export function PostCard({ post }: { post: CommunityPost }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, openAuthModal } = useAppStore();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  async function handleLike() {
    if (!user) {
      openAuthModal("login");
      return;
    }
    const result = await toggleLike(post.id);
    setLiked(result.liked);
    setLikesCount(result.likesCount);
  }

  async function handleReply() {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!replyText.trim()) return;
    await addComment(post.id, replyText);
    setReplyText("");
    queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
  }

  function handleMessageAuthor() {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (post.authorId === user.id) return;
    router.push(
      `/messages?with=${post.authorId}&name=${encodeURIComponent(post.authorName)}&role=${post.authorRole}`
    );
  }

  const role = ROLE_STYLE[post.authorRole] ?? ROLE_STYLE.customer;

  return (
    <div className="post-card animate-in">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div className="post-avatar" style={{ background: AVATAR_BG }}>
          {post.authorName.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{post.authorName}</span>
            <span className={`post-role-pill ${role.cls}`}>{role.label}</span>
            <span className="post-tag">{TAG_LABEL[post.type]}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{timeAgo(post.createdAt)}</div>
        </div>
        {user && post.authorId !== user.id && (
          <button
            onClick={handleMessageAuthor}
            title={`Nhắn tin cho ${post.authorName}`}
            style={{
              background: "var(--gray-50)",
              border: "1px solid var(--gray-200)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--gray-500)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <i className="ti ti-mail" style={{ fontSize: 12 }} />
            Nhắn tin
          </button>
        )}
      </div>

      <p style={{ fontSize: 13, color: "var(--gray-700)", lineHeight: 1.65, marginBottom: 14 }}>{post.text}</p>

      {post.comments.map((c) => {
        const cRole = ROLE_STYLE[c.authorRole] ?? ROLE_STYLE.customer;
        return (
          <div className="comment-bubble" key={c.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: cRole.cls === "post-role-sale" ? "var(--blue)" : "var(--emerald)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {c.authorName.charAt(0)}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--navy)" }}>{c.authorName}</span>
              <span className={`post-role-pill ${cRole.cls}`} style={{ fontSize: 9, padding: "1px 6px" }}>
                {cRole.label}
              </span>
              {user && c.authorId !== user.id && (
                <button
                  onClick={() =>
                    router.push(
                      `/messages?with=${c.authorId}&name=${encodeURIComponent(c.authorName)}&role=${c.authorRole}`
                    )
                  }
                  title={`Nhắn tin cho ${c.authorName}`}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: "var(--gray-400)",
                    cursor: "pointer",
                    fontSize: 12,
                    padding: 2,
                  }}
                >
                  <i className="ti ti-mail" />
                </button>
              )}
            </div>
            {c.text}
          </div>
        );
      })}

      <div
        style={{
          display: "flex",
          gap: 7,
          paddingTop: 12,
          marginTop: 12,
          borderTop: "1px solid var(--gray-100)",
          flexWrap: "wrap",
        }}
      >
        <button
          className="vote-btn"
          onClick={handleLike}
          style={liked ? { borderColor: "var(--red, #DC2626)", color: "var(--red, #DC2626)" } : undefined}
        >
          <i className={`ti ${liked ? "ti-heart-filled" : "ti-heart"}`} style={{ fontSize: 13 }} />
          {likesCount}
        </button>
        <button className="vote-btn" onClick={() => setReplyOpen((v) => !v)}>
          <i className="ti ti-message-circle" style={{ fontSize: 13 }} />
          {post.comments.length}
        </button>
        <button className="vote-btn vote-btn-ai" style={{ marginLeft: "auto" }}>
          <i className="ti ti-sparkles" style={{ fontSize: 13 }} />
          Hỏi AI
        </button>
      </div>

      {replyOpen && (
        <div style={{ marginTop: 10 }}>
          {user ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder={user.role === "sale" ? "Tư vấn cho khách hàng..." : "Đặt câu hỏi thêm..."}
                style={{
                  flex: 1,
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 9,
                  padding: "9px 12px",
                  fontSize: 12,
                  outline: "none",
                }}
              />
              <button
                onClick={handleReply}
                style={{
                  background: "var(--blue)",
                  color: "white",
                  border: "none",
                  borderRadius: 9,
                  padding: "9px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Gửi
              </button>
            </div>
          ) : (
            <div
              style={{
                background: "var(--gray-50)",
                border: "1px solid var(--gray-200)",
                borderRadius: 9,
                padding: "10px 14px",
                fontSize: 12,
                color: "var(--gray-400)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Đăng nhập để bình luận</span>
              <button
                onClick={() => openAuthModal("login")}
                style={{
                  background: "var(--blue)",
                  color: "white",
                  border: "none",
                  borderRadius: 7,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
