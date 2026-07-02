"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/types";
import { streamChat } from "@/services/aiChatService";
import { ChatBubble } from "./ChatBubble";

const SUGGESTIONS = [
  "Tôi thu nhập 20 triệu/tháng, có thể vay mua nhà bao nhiêu?",
  "So sánh lãi suất vay mua nhà VCB vs Techcombank",
  "Thẻ tín dụng nào hoàn tiền tốt nhất 2025?",
];

export function ChatPanel({ initialQuery }: { initialQuery?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (initialQuery && !startedRef.current) {
      startedRef.current = true;
      void send(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const aiMsgId = crypto.randomUUID();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      streaming: true,
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");

    let acc = "";
    for await (const chunk of streamChat([...messages, userMsg], sessionIdRef.current)) {
      acc += chunk;
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMsgId ? { ...m, content: acc } : m))
      );
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === aiMsgId ? { ...m, streaming: false } : m))
    );
    setSending(false);
  }

  return (
    <div className="grid-main">
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="sec-eyebrow">Tư vấn AI</div>
          <h3 style={{ marginBottom: 4 }}>Trợ lý tài chính thông minh</h3>
          <p className="text-sm text-muted mb14">
            Đặt câu hỏi tài chính bằng ngôn ngữ tự nhiên. AI sẽ phân tích và tư vấn chiến lược tốt nhất cho bạn.
          </p>
          <div className="ai-chat-wrap" ref={scrollRef}>
            {messages.length === 0 && (
              <div style={{ color: "var(--gray-400)", fontSize: 13 }}>
                Bắt đầu trò chuyện với AI bên dưới…
              </div>
            )}
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
          </div>
          <div className="chat-input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Nhập câu hỏi tài chính của bạn..."
            />
            <button className="send-btn" onClick={() => send(input)} disabled={sending}>
              <i className="ti ti-send" />
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <h3 className="mb14">Câu hỏi gợi ý</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  textAlign: "left",
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-100)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12.5,
                  color: "var(--gray-700)",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
