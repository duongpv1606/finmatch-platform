import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { ProductCategory } from '../products/product.entity';
import { AiService } from '../ai/ai.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';

interface ScoredProduct {
  product: Awaited<ReturnType<ProductsService['findAll']>>[number];
  score: number;
}

@Injectable()
export class RecommendationService {
  constructor(
    private readonly products: ProductsService,
    private readonly ai: AiService,
  ) {}

  async recommend(input: RecommendationRequestDto) {
    // ── 1. Deterministic financial-health metrics (transparent formulas,
    //    same shape the original UI displayed, but now driven by real
    //    numbers the person entered — no hardcoded bank pool). ──
    const { income, savings, debt, loanAmount, creditHistory } = input;
    const maxEMI = Math.max(0, income * 0.4 - debt);
    const dtiPct = income > 0 ? Math.round((debt / income) * 100) : 0;

    const creditBonus =
      creditHistory === 'good' ? 10 : creditHistory === 'average' ? 2 : creditHistory === 'poor' ? -12 : 0;

    const approval = clamp(
      68 +
        (savings > 300 ? 12 : savings > 100 ? 6 : 0) +
        (debt === 0 ? 10 : debt < income * 0.2 ? 4 : -5) +
        (income > 30 ? 8 : income > 15 ? 4 : 0) +
        creditBonus,
      35,
      96,
    );

    const affordability = clamp(
      100 - (debt / Math.max(income * 0.5, 1)) * 35 - (savings < 50 ? 8 : 0) + (income > 25 ? 6 : 0),
      30,
      98,
    );

    const debtSafety = clamp(100 - dtiPct * 1.6 - (debt > income * 0.5 ? 15 : 0), 25, 97);

    const healthAvg = (approval + affordability + debtSafety) / 3;
    const healthGrade =
      healthAvg >= 90 ? 'A+' : healthAvg >= 82 ? 'A' : healthAvg >= 72 ? 'B+' : healthAvg >= 62 ? 'B' : 'C+';

    // ── 2. Score REAL loan products from the database against this profile. ──
    const allLoans = await this.products.findAll(ProductCategory.LOAN);
    const eligible = allLoans.filter(
      (p) => loanAmount * 1_000_000 <= Number(p.maxAmount) && loanAmount * 1_000_000 >= Number(p.minAmount) * 0.5,
    );
    const pool = eligible.length > 0 ? eligible : allLoans;

    const rates = pool.map((p) => Number(p.interestRate));
    const minRate = Math.min(...rates, 999);
    const maxRate = Math.max(...rates, 0);

    const scored: ScoredProduct[] = pool.map((product) => {
      const rate = Number(product.interestRate);
      const rateScore =
        maxRate > minRate ? 100 - ((rate - minRate) / (maxRate - minRate)) * 100 : 80;
      const amountFit =
        loanAmount * 1_000_000 >= Number(product.minAmount) &&
        loanAmount * 1_000_000 <= Number(product.maxAmount)
          ? 100
          : 55;
      const ratingScore = (Number(product.rating) / 5) * 100;

      const score = clamp(
        rateScore * 0.4 + amountFit * 0.25 + debtSafety * 0.2 + ratingScore * 0.15,
        0,
        100,
      );
      return { product, score: Math.round(score) };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 3);
    const matchScore = clamp(
      Math.round(approval * 0.4 + affordability * 0.3 + debtSafety * 0.3),
      0,
      98,
    );

    // ── 3. Real AI reasoning — the deterministic numbers above are the
    //    "facts"; the LLM's job is to explain them in natural language,
    //    grounded in the actual top product names/rates, not to invent
    //    numbers itself. ──
    const aiSummary = await this.generateReasoning(input, {
      matchScore,
      approval,
      affordability,
      debtSafety,
      dtiPct,
      healthGrade,
      top,
    });

    const perProductReasons = await this.generatePerProductReasons(input, top);

    return {
      matchScore,
      affordability: Math.round(affordability),
      debtSafety: Math.round(debtSafety),
      approval: Math.round(approval),
      healthGrade,
      dtiPct,
      maxEMI: Math.round(maxEMI),
      topMatches: top.map((t, i) => ({
        product: t.product,
        score: t.score,
        reasons: perProductReasons[i] ?? [],
      })),
      aiSummary,
    };
  }

  private async generateReasoning(
    input: RecommendationRequestDto,
    facts: {
      matchScore: number;
      approval: number;
      affordability: number;
      debtSafety: number;
      dtiPct: number;
      healthGrade: string;
      top: ScoredProduct[];
    },
  ): Promise<string> {
    const topNames = facts.top
      .map((t) => `${t.product.bankName} — ${t.product.name} (${t.product.interestRate}%/năm, điểm ${t.score}/100)`)
      .join('; ');

    const prompt =
      `Hồ sơ khách hàng: thu nhập ${input.income} triệu/tháng, tiết kiệm ${input.savings} triệu, ` +
      `nợ hiện tại ${input.debt} triệu/tháng, nghề nghiệp ${input.occupation}, tuổi ${input.age}, ` +
      `muốn vay ${input.loanAmount} triệu cho mục tiêu "${input.goal}", lịch sử tín dụng: ${input.creditHistory}.\n\n` +
      `Số liệu đã tính toán sẵn (KHÔNG được đổi số liệu này, chỉ diễn giải): ` +
      `Match Score ${facts.matchScore}%, khả năng duyệt ${facts.approval}%, khả năng chi trả ${facts.affordability}%, ` +
      `an toàn nợ ${facts.debtSafety}%, DTI ${facts.dtiPct}%, xếp hạng sức khỏe tài chính ${facts.healthGrade}.\n` +
      `Top sản phẩm phù hợp nhất: ${topNames}.\n\n` +
      `Viết đoạn tóm tắt 3-4 câu bằng tiếng Việt, giải thích vì sao hồ sơ này phù hợp với các sản phẩm trên, ` +
      `dựa đúng vào số liệu đã cho. Không bịa thêm số liệu mới.`;

    try {
      return await this.ai.complete(
        prompt,
        'Bạn là chuyên gia tư vấn tài chính. Chỉ diễn giải số liệu được cung cấp, không tự tạo số liệu mới.',
      );
    } catch {
      // AI provider not configured (e.g. missing API key) — fall back to a
      // deterministic sentence built from the same facts, so the feature
      // still works end-to-end without an LLM key.
      return (
        `Với thu nhập ${input.income} triệu/tháng và DTI ${facts.dtiPct}%, hồ sơ của bạn đạt ` +
        `Match Score ${facts.matchScore}% (xếp hạng ${facts.healthGrade}). Sản phẩm phù hợp nhất hiện tại: ${topNames}.`
      );
    }
  }

  private async generatePerProductReasons(
    input: RecommendationRequestDto,
    top: ScoredProduct[],
  ): Promise<string[][]> {
    if (top.length === 0) return [];
    const prompt =
      `Cho hồ sơ: thu nhập ${input.income} triệu/tháng, vay ${input.loanAmount} triệu, tín dụng ${input.creditHistory}. ` +
      `Với mỗi sản phẩm sau, viết đúng 2 lý do ngắn (dưới 12 từ mỗi lý do) vì sao phù hợp: ` +
      top.map((t, i) => `(${i + 1}) ${t.product.bankName} ${t.product.name} ${t.product.interestRate}%`).join(', ') +
      `.\nTrả lời CHỈ ở định dạng JSON mảng, ví dụ: [["lý do 1","lý do 2"],["lý do 1","lý do 2"]]. Không thêm text khác.`;

    try {
      const raw = await this.ai.complete(
        prompt,
        'Bạn trả lời CHỈ bằng JSON hợp lệ, không markdown, không giải thích thêm.',
      );
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return top.map((t) => [
        `Lãi suất ${t.product.interestRate}%/năm cạnh tranh trong nhóm`,
        `Điểm phù hợp ${t.score}/100 với hồ sơ của bạn`,
      ]);
    }
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}
