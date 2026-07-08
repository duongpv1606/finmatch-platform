// ────────────────────────────────────────────────────────────
// AI Chat service.
//
// REAL BACKEND CONTRACT:
//   POST /api/ai/chat  (Server-Sent Events or chunked stream)
//     body: { messages: ChatMessage[], provider?: 'openai'|'claude'|'gemini' }
//     -> streams { delta: string } chunks, client appends to last message
//
// Provider is swappable server-side (NestJS service picks the client
// based on env/config), so the frontend never needs to know which LLM
// is behind it. You bring your own API key(s) via backend .env:
//   OPENAI_API_KEY / ANTHROPIC_API_KEY / GOOGLE_API_KEY
//
// Until that backend exists, `streamChatMock` below simulates the same
// token-by-token UX (used by the AI Chat page) so the interface,
// typing animation and markdown rendering are already production-shaped.
// ────────────────────────────────────────────────────────────

import { ChatMessage } from "@/types";
import { API_BASE_URL, USE_MOCK } from "./apiClient";

const MOCK_REPLY =
  "Dựa trên thông tin bạn cung cấp, đây là phân tích sơ bộ:\n\n" +
  "- **Khả năng vay ước tính**: phù hợp với thu nhập bạn nêu\n" +
  "- **Ngân hàng gợi ý**: Vietcombank, Techcombank (lãi suất cạnh tranh nhất hiện tại)\n" +
  "- **Bước tiếp theo**: cung cấp thêm lịch sử tín dụng để AI chấm điểm chính xác hơn\n\n" +
  "_Đây là phản hồi mẫu — kết nối OpenAI/Claude/Gemini ở backend để có tư vấn thật._";

export interface ExtractedProfile {
  income: number | null;
  savings: number | null;
  debt: number | null;
  goal: string | null;
}

export async function extractProfile(messages: ChatMessage[]): Promise<ExtractedProfile> {
  if (USE_MOCK) {
    return { income: null, savings: null, debt: null, goal: null };
  }
  const res = await fetch(`${API_BASE_URL}/ai/extract-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) return { income: null, savings: null, debt: null, goal: null };
  return res.json();
}
export async function* streamChat(
  messages: ChatMessage[],
  sessionId: string
): AsyncGenerator<string> {
  if (USE_MOCK) {
    for (const word of MOCK_REPLY.split(" ")) {
      await new Promise((r) => setTimeout(r, 35));
      yield word + " ";
    }
    return;
  }

  const res = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI chat request failed (${res.status}): ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
