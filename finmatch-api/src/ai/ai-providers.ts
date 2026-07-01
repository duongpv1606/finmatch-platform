import axios from 'axios';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  streamChat(messages: ChatTurn[], systemPrompt: string): AsyncGenerator<string>;
}

const FINANCE_SYSTEM_PROMPT =
  'Bạn là trợ lý tài chính AI của FinMatch, chuyên tư vấn vay vốn, thẻ tín ' +
  'dụng, bảo hiểm, đầu tư và tiết kiệm tại thị trường Việt Nam. Trả lời ' +
  'ngắn gọn, chính xác, có cấu trúc (dùng markdown khi hữu ích), và luôn ' +
  'nói rõ khi một khuyến nghị cần xác minh thêm với chuyên viên tư vấn ' +
  'thật hoặc ngân hàng trước khi quyết định.';

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
