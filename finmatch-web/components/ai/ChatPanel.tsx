"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/types";
import { ChatBubble } from "./ChatBubble";

export function ChatPanel({
  messages,
  sending,
  onSend,
}: {
  messages: ChatMessage[];
  sending: boolean;
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  }

  return (
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
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Nhập câu hỏi tài chính của bạn..."
        />
        <button className="send-btn" onClick={handleSend} disabled={sending}>
          <i className="ti ti-send" />
        </button>
      </div>
    </div>
  );
}
