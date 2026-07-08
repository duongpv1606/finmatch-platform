import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AnthropicProvider,
  ChatTurn,
  FINANCE_SYSTEM_PROMPT,
  GeminiProvider,
  OpenAIProvider,
} from './ai-providers';
import { ProductsService } from '../products/products.service';

@Injectable()
export class AiService {
  constructor(
    private readonly config: ConfigService,
    private readonly products: ProductsService,
  ) {}

  private getProvider(): AIProvider {
    const providerName = this.config.get<string>('AI_PROVIDER', 'openai');

    try {
      switch (providerName) {
        case 'anthropic':
          return new AnthropicProvider(
            this.config.getOrThrow<string>('ANTHROPIC_API_KEY'),
          );
        case 'gemini':
          return new GeminiProvider(this.config.getOrThrow<string>('GOOGLE_API_KEY'));
        default:
          return new OpenAIProvider(this.config.getOrThrow<string>('OPENAI_API_KEY'));
      }
    } catch {
      throw new InternalServerErrorException(
        `Chưa cấu hình API key cho AI_PROVIDER=${providerName}. ` +
          'Thêm OPENAI_API_KEY / ANTHROPIC_API_KEY / GOOGLE_API_KEY vào .env.',
      );
    }
  }

  /** Builds a compact, factual list of REAL products from the database and
   * appends it to the system prompt. This grounds the chat's advice in
   * actual data instead of letting the LLM invent bank names/rates —
   * important because the person is making real financial decisions. */
  private async buildGroundedSystemPrompt(): Promise<string> {
    let productLines = 'Hiện chưa có sản phẩm nào trong hệ thống.';
    try {
      const products = await this.products.findAll();
      if (products.length > 0) {
        productLines = products
          .slice(0, 30)
          .map(
            (p) =>
              `- [${p.category}] ${p.bankName} — ${p.name}: ${p.interestRate}%/năm, ` +
              `hạn mức ${Math.round(Number(p.minAmount) / 1e6)}-${Math.round(Number(p.maxAmount) / 1e6)} triệu`,
          )
          .join('\n');
      }
    } catch {
      // If the DB call fails for any reason, fall back to the prompt
      // without product data rather than breaking the whole chat.
    }

    return (
      FINANCE_SYSTEM_PROMPT +
      '\n\nDANH SÁCH SẢN PHẨM THẬT ĐANG CÓ TRONG HỆ THỐNG (chỉ được nhắc đến ' +
      'đúng những sản phẩm này khi tư vấn — KHÔNG được bịa thêm ngân hàng, ' +
      'sản phẩm hay lãi suất nào khác ngoài danh sách dưới đây; nếu không có ' +
      'sản phẩm phù hợp, nói rõ là hệ thống chưa có sản phẩm đó thay vì bịa ra):\n' +
      productLines
    );
  }

  async streamChat(messages: ChatTurn[]) {
    const systemPrompt = await this.buildGroundedSystemPrompt();
    return this.getProvider().streamChat(messages, systemPrompt);
  }

  /** Buffers a full response for one-shot generation tasks (not user-facing
   * streaming) — e.g. generating recommendation reasoning text. Reuses the
   * same provider abstraction, just collects all chunks before returning. */
  async complete(prompt: string, systemPrompt: string): Promise<string> {
    const provider = this.getProvider();
    let full = '';
    for await (const chunk of provider.streamChat(
      [{ role: 'user', content: prompt }],
      systemPrompt,
    )) {
      full += chunk;
    }
    return full;
  }

  /** Extracts a lightweight financial profile (income/savings/debt/goal)
   * from the conversation so far — mirrors the original HTML's regex-based
   * extractNumber()/detectGoal() functions, but using the LLM so it
   * understands natural phrasing ("lương 20 triệu", "khoảng 500tr tiết
   * kiệm"...) instead of a few hardcoded patterns. Returns null fields when
   * not yet mentioned — never guesses. */
  async extractProfile(messages: ChatTurn[]): Promise<{
    income: number | null;
    savings: number | null;
    debt: number | null;
    goal: string | null;
  }> {
    const conversation = messages
      .map((m) => `${m.role === 'user' ? 'Khách' : 'AI'}: ${m.content}`)
      .join('\n');
    const prompt =
      `Đọc đoạn hội thoại sau và trích ra CHÍNH XÁC các thông tin tài chính ` +
      `nếu khách hàng đã đề cập (đơn vị: triệu VNĐ). Nếu chưa đề cập, để null. ` +
      `KHÔNG suy đoán hay bịa số liệu.\n\n${conversation}\n\n` +
      `Trả lời CHỈ bằng JSON đúng định dạng: ` +
      `{"income": số hoặc null, "savings": số hoặc null, "debt": số hoặc null, "goal": "chuỗi mô tả mục tiêu hoặc null"}`;

    try {
      const raw = await this.complete(
        prompt,
        'Bạn trả lời CHỈ bằng JSON hợp lệ, không markdown, không giải thích thêm.',
      );
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      return {
        income: typeof parsed.income === 'number' ? parsed.income : null,
        savings: typeof parsed.savings === 'number' ? parsed.savings : null,
        debt: typeof parsed.debt === 'number' ? parsed.debt : null,
        goal: typeof parsed.goal === 'string' ? parsed.goal : null,
      };
    } catch {
      return { income: null, savings: null, debt: null, goal: null };
    }
  }
}
