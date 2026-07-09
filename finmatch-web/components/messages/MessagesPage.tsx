"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleGate } from "@/components/shared/RoleGate";
import { useAppStore } from "@/store/useAppStore";
import {
  getConversations,
  getThread,
  sendMessage,
  ConversationSummary,
} from "@/services/messagesService";

const ROLE_LABEL: Record<string, string> = {
  sale: "Sale",
  customer: "Khách hàng",
  admin: "Admin",
  agency: "Agency",
  bank: "Ngân hàng",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
}

function MessagesContent() {
  const params = useSearchParams();
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activePartner, setActivePartner] = useState<{ id: string; name: string; role: string } | null>(
    null
  );
  const [input, setInput] = useState("");

  const { data: conversations } = useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: getConversations,
    refetchInterval: 8000,
  });

  const { data: thread } = useQuery({
    queryKey: ["messages", "thread", activePartner?.id],
    queryFn: () => getThread(activePartner!.id),
    enabled: !!activePartner,
    refetchInterval: activePartner ? 5000 : false,
  });

  useEffect(() => {
    const withId = params.get("with");
    const name = params.get("name");
    const role = params.get("role");
    if (withId && name) {
      setActivePartner({ id: withId, name, role: role ?? "customer" });
    }
  }, [params]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread]);

  async function handleSend() {
    if (!input.trim() || !activePartner) return;
    await sendMessage(activePartner.id, input);
    setInput("");
    queryClient.invalidateQueries({ queryKey: ["messages"] });
  }

  function openConversation(c: ConversationSummary) {
    setActivePartner({ id: c.userId, name: c.name, role: c.role });
  }

  return (
    <div className="grid-main" style={{ alignItems: "start", gridTemplateColumns: "320px 1fr" }}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 10px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Tin nhắn</h3>
        </div>
        <div style={{ maxHeight: 560, overflowY: "auto" }}>
          {conversations?.map((c) => (
            <div
              key={c.userId}
              onClick={() => openConversation(c)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                cursor: "pointer",
                background: activePartner?.id === c.userId ? "var(--blue-light)" : "transparent",
                borderBottom: "1px solid var(--gray-100)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,var(--blue),var(--emerald))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {c.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--navy)" }}>{c.name}</span>
                  <span style={{ fontSize: 9, color: "var(--gray-400)" }}>{ROLE_LABEL[c.role] ?? c.role}</span>
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--gray-400)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.lastMessage}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontSize: 10, color: "var(--gray-400)" }}>{timeAgo(c.lastMessageAt)}</span>
                {c.unreadCount > 0 && (
                  <span
                    style={{
                      background: "var(--blue)",
                      color: "white",
                      fontSize: 9,
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: "1px 6px",
                      minWidth: 16,
                      textAlign: "center",
                    }}
                  >
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
          {(!conversations || conversations.length === 0) && (
            <div style={{ padding: 20, textAlign: "center", color: "var(--gray-400)", fontSize: 12.5 }}>
              Chưa có cuộc trò chuyện nào. Nhắn tin cho ai đó từ trang Cộng đồng để bắt đầu.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", height: 610, padding: 0 }}>
        {!activePartner ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gray-400)",
              fontSize: 13,
            }}
          >
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        ) : (
          <>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--gray-100)", display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,var(--blue),var(--emerald))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {activePartner.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{activePartner.name}</div>
                <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{ROLE_LABEL[activePartner.role] ?? activePartner.role}</div>
              </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {thread?.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "9px 13px",
                        borderRadius: 12,
                        fontSize: 13,
                        lineHeight: 1.5,
                        background: isMe ? "var(--blue)" : "var(--gray-100)",
                        color: isMe ? "white" : "var(--gray-700)",
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
              {thread?.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--gray-400)", fontSize: 12.5 }}>
                  Bắt đầu cuộc trò chuyện với {activePartner.name}
                </div>
              )}
            </div>

            <div style={{ padding: 14, borderTop: "1px solid var(--gray-100)", display: "flex", gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Nhập tin nhắn..."
                style={{
                  flex: 1,
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 9,
                  padding: "9px 13px",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  background: "var(--blue)",
                  color: "white",
                  border: "none",
                  borderRadius: 9,
                  padding: "9px 16px",
                  cursor: "pointer",
                }}
              >
                <i className="ti ti-send" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function MessagesPage() {
  return (
    <RoleGate allow={["customer", "sale", "agency", "bank", "admin", "super_admin"]}>
      <MessagesContent />
    </RoleGate>
  );
}
