"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/types";
import { streamChat } from "@/services/aiChatService";
import {
  ConvState,
  LeadProfile,
  initialLeadProfile,
  runChatFlow,
  calcAnalysis,
  goalToCategory,
} from "@/lib/chatFlow";
import { createLead } from "@/services/leadsService";

export function useChatSession(initialQuery?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [profile, setProfile] = useState<LeadProfile>(initialLeadProfile);
  const stateRef = useRef<ConvState>("init");
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const startedRef = useRef(false);
  const leadCreatedRef = useRef(false);

  useEffect(() => {
    if (initialQuery && !startedRef.current) {
      startedRef.current = true;
      void send(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function pushMessage(m: ChatMessage) {
    setMessages((prev) => [...prev, m]);
  }

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    pushMessage(userMsg);

    const typingId = crypto.randomUUID();
    pushMessage({
      id: typingId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      streaming: true,
    });

    // Same "thinking" delay as the original (600-1200ms) before revealing
    // the reply — makes the scripted flow feel conversational, not instant.
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));

    if (stateRef.current === "done") {
      // Lead already captured — hand off to the real AI backend (grounded
      // in real DB products) for open-ended follow-up questions, instead
      // of the original's few hardcoded keyword replies.
      setMessages((prev) => prev.filter((m) => m.id !== typingId));
      const aiMsgId = crypto.randomUUID();
      pushMessage({
        id: aiMsgId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        streaming: true,
      });
      let acc = "";
      const history = [...messages, userMsg];
      try {
        for await (const chunk of streamChat(history, sessionIdRef.current)) {
          acc += chunk;
          setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: acc } : m)));
        }
      } catch (e) {
        acc = (e as Error).message;
      }
      setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: acc, streaming: false } : m)));
      setSending(false);
      return;
    }

    const flow = runChatFlow(stateRef.current, profile, text);
    stateRef.current = flow.nextState;
    setProfile(flow.profile);

    if (flow.nextState === "done" && flow.profile.phone && !leadCreatedRef.current) {
      leadCreatedRef.current = true;
      const analysis = calcAnalysis(flow.profile);
      void createLead({
        customerName: flow.profile.name ?? "Khách chưa rõ tên",
        phone: flow.profile.phone,
        email: flow.profile.email ?? undefined,
        productCategory: goalToCategory(flow.profile.goal),
        source: "ai_chat",
        score: analysis.approval,
        region: "Không rõ",
      }).catch(() => {
        // Non-critical — the chat UX shouldn't break if lead creation
        // fails (e.g. backend briefly unavailable). Sale marketplace
        // just won't see this one lead.
      });
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === typingId
          ? { ...m, content: flow.text, streaming: false, result: flow.result }
          : m
      )
    );
    setSending(false);

    if (flow.delayedFollowUp) {
      setTimeout(() => {
        stateRef.current = "ask_name";
        pushMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: flow.delayedFollowUp!,
          createdAt: new Date().toISOString(),
        });
      }, 2000);
    }
  }

  return { messages, sending, send, profile };
}
