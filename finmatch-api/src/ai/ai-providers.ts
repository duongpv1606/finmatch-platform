import axios from 'axios';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  streamChat(messages: ChatTurn[], systemPrompt: string): AsyncGenerator<string>;
}

const FINANCE_SYSTEM_PROMPT =
  'Bạn là chuyên viên tư vấn tài chính của FinMatch — trò chuyện như một ' +
  'nhân viên ngân hàng thật đang tư vấn trực tiếp, KHÔNG phải một trợ lý AI ' +
  'giải thích lan man.\n\n' +
  'QUY TẮC BẮT BUỘC:\n' +
  '1. Câu trả lời PHẢI ngắn — tối đa 3-4 câu mỗi lượt, trừ khi người dùng ' +
  'yêu cầu giải thích chi tiết.\n' +
  '2. Mỗi lượt chỉ hỏi ĐÚNG MỘT câu hỏi, đơn giản, đúng nghiệp vụ ngân ' +
  'hàng — không hỏi dồn nhiều thứ cùng lúc.\n' +
  '3. Khi người dùng nêu nhu cầu (vay mua nhà, mua xe, mở thẻ...), thu ' +
  'thập lần lượt: (a) thu nhập hàng tháng, (b) khoản vay/hạn mức mong ' +
  'muốn, (c) nợ hiện tại nếu có, (d) lịch sử tín dụng (đã từng nợ xấu ' +
  'chưa) — hỏi từng cái một, không hỏi hết trong 1 tin nhắn.\n' +
  '4. Sau khi có đủ thông tin, đưa ra khuyến nghị NGẮN GỌN: 1-2 sản phẩm ' +
  'phù hợp nhất kèm lãi suất, kèm 1-2 lý do ngắn — không viết thành báo ' +
  'cáo dài.\n' +
  '5. Nếu người dùng muốn phân tích sâu (chấm điểm, xếp hạng nhiều sản ' +
  'phẩm), hướng họ dùng form "AI Recommendation Engine" ngay bên dưới ' +
  'khung chat — đó là công cụ chuyên cho việc đó.\n' +
  '6. Không dùng markdown phức tạp (không bảng, không heading nhiều cấp) ' +
  '— chỉ văn xuôi ngắn, có thể in đậm 1-2 từ khóa quan trọng.\n' +
  '7. Luôn dùng tiếng Việt, giọng điệu thân thiện, chuyên nghiệp như tư ' +
  'vấn viên ngân hàng, không nói "là một AI" hay giải thích về bản thân.';

export { FINANCE_SYSTEM_PROMPT };

// ── OpenAI (Chat Completions streaming) ──
export class OpenAIProvider implements AIProvider {
  constructor(private readonly apiKey: string, private readonly model = 'gpt-4o-mini') {}

  async *streamChat(messages: ChatTurn[], systemPrompt: string): AsyncGenerator<string> {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.model,
        stream: true,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      },
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        responseType: 'stream',
      },
    );
    for await (const line of iterSseLines(res.data)) {
      if (line === '[DONE]') return;
      try {
        const json = JSON.parse(line);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* ignore keep-alive/partial lines */
      }
    }
  }
}

// ── Anthropic (Messages API streaming) ──
export class AnthropicProvider implements AIProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model = 'claude-sonnet-4-6',
  ) {}

  async *streamChat(messages: ChatTurn[], systemPrompt: string): AsyncGenerator<string> {
    const res = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.model,
        max_tokens: 1024,
        system: systemPrompt,
        stream: true,
        messages,
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        responseType: 'stream',
      },
    );
    for await (const line of iterSseLines(res.data)) {
      try {
        const json = JSON.parse(line);
        if (json.type === 'content_block_delta' && json.delta?.text) {
          yield json.delta.text;
        }
      } catch {
        /* ignore */
      }
    }
  }
}

// ── Google Gemini (streamGenerateContent) ──
export class GeminiProvider implements AIProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model = 'gemini-2.0-flash',
  ) {}

  async *streamChat(messages: ChatTurn[], systemPrompt: string): AsyncGenerator<string> {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent` +
      `?key=${this.apiKey}&alt=sse`;
    const res = await axios.post(
      url,
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      },
      { responseType: 'stream' },
    );
    for await (const line of iterSseLines(res.data)) {
      try {
        const json = JSON.parse(line);
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        /* ignore */
      }
    }
  }
}

/** Parses an SSE stream (`data: ...` lines) from an axios stream response. */
async function* iterSseLines(stream: NodeJS.ReadableStream): AsyncGenerator<string> {
  let buffer = '';
  for await (const chunk of stream) {
    buffer += chunk.toString('utf8');
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload) yield payload;
    }
  }
}
