"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/types";
import { streamChat, extractProfile, ExtractedProfile } from "@/services/aiChatService";

export function useChatSession(initialQuery?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [profile, setProfile] = useState<ExtractedProfile>({
    income: null,
    savings: null,
    debt: null,
    goal: null,
  });
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const startedRef = useRef(false);

  useEffect(() => {
    if (initialQuery && !startedRef.current) {
      startedRef.current = true;
      void send(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

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

    let history: ChatMessage[] = [];
    setMessages((prev) => {
      history = [...prev, userMsg];
      return [...prev, userMsg, aiMsg];
    });

    let acc = "";
    for await (const chunk of streamChat(history, sessionIdRef.current)) {
      acc += chunk;
      setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: acc } : m)));
    }
    const finalMessages = [...history, { ...aiMsg, content: acc, streaming: false }];
    setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, streaming: false } : m)));
    setSending(false);

    // Once there's been at least one full exchange, try to extract a
    // financial profile from the conversation — mirrors the original
    // HTML's behavior of showing the recommendation card once enough
    // context exists (chatHistory.length > 2).
    if (finalMessages.length > 2) {
      const extracted = await extractProfile(finalMessages);
      setProfile(extracted);
    }
  }

  return { messages, sending, send, profile };
}
