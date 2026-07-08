import { ChatResultCard } from "@/types";

export type ConvState =
  | "init"
  | "ask_income"
  | "ask_savings"
  | "ask_debt"
  | "show_analysis"
  | "ask_name"
  | "ask_phone"
  | "done";

export interface LeadProfile {
  goal: string | null;
  income: number | null; // triệu/tháng
  savings: number | null; // triệu
  debt: number | null; // triệu/tháng
  name: string | null;
  phone: string | null;
  email: string | null;
}

export const initialLeadProfile: LeadProfile = {
  goal: null,
  income: null,
  savings: null,
  debt: null,
  name: null,
  phone: null,
  email: null,
};

export function detectGoal(msg: string): string | null {
  const m = msg.toLowerCase();
  if (m.includes("nhà") || m.includes("house") || m.includes("mua nhà") || m.includes("home")) return "Mua nhà";
  if (m.includes("xe") || m.includes("car") || m.includes("ô tô")) return "Mua xe";
  if (m.includes("đầu tư") || m.includes("invest")) return "Đầu tư";
  if (m.includes("tiết kiệm") || m.includes("saving")) return "Tiết kiệm";
  if (m.includes("vay") || m.includes("loan") || m.includes("borrow")) return "Vay cá nhân";
  if (m.includes("bảo hiểm") || m.includes("insurance")) return "Bảo hiểm";
  if (m.includes("hưu") || m.includes("retire")) return "Hưu trí";
  return null;
}

export function extractNumber(msg: string): number | null {
  const lower = msg.toLowerCase().replace(/,/g, ".");
  let match = lower.match(/([\d.]+)\s*(tỷ|billion|b\b)/);
  if (match) return parseFloat(match[1]) * 1000;
  match = lower.match(/([\d.]+)\s*(triệu|tr\b|million|m\b)/);
  if (match) return parseFloat(match[1]);
  match = lower.match(/\b(\d{1,3})\b/);
  if (match && parseFloat(match[1]) >= 3 && parseFloat(match[1]) <= 500) return parseFloat(match[1]);
  return null;
}

function isNegative(lower: string): boolean {
  return (
    lower.includes("không") ||
    lower.includes("no") ||
    lower.includes("chưa") ||
    lower.includes("don't") ||
    lower.includes("none")
  );
}

export interface AnalysisFacts {
  maxEMI: number;
  loanCap: number;
  dtiPct: number;
  approval: number;
}

/** Same generic formula as the original HTML's calcAnalysis() — this part
 * never depended on fake bank data, just income/savings/debt math, so it's
 * safe to keep identical. */
export function calcAnalysis(profile: LeadProfile): AnalysisFacts {
  const inc = profile.income || 20;
  const sav = profile.savings || 0;
  const dbt = profile.debt || 0;
  const maxEMI = Math.round(inc * 0.4 - dbt);
  const loanCap = Math.max(0, Math.round(((maxEMI * 200) / 50)) * 50);
  const dtiPct = Math.round((dbt / inc) * 100);
  const approval = Math.min(
    94,
    Math.max(
      52,
      68 + (sav > 300 ? 12 : sav > 100 ? 6 : 0) + (dbt === 0 ? 10 : dbt < inc * 0.2 ? 4 : -5) + (inc > 30 ? 8 : inc > 15 ? 4 : 0),
    ),
  );
  return { maxEMI, loanCap, dtiPct, approval };
}

export interface FlowResult {
  nextState: ConvState;
  profile: LeadProfile;
  text: string;
  result?: ChatResultCard;
  /** A follow-up message to push ~2s later, matching the original's
   * setTimeout-based "gently ask name" behavior after showing analysis. */
  delayedFollowUp?: string;
}

/** Exact port of the original HTML's buildAIResponse() switch statement —
 * same states, same trigger conditions, same wording (Vietnamese). */
export function runChatFlow(state: ConvState, profile: LeadProfile, msg: string): FlowResult {
  const lower = msg.toLowerCase();
  const num = extractNumber(msg);

  switch (state) {
    case "init": {
      const goal = detectGoal(msg);
      const nextProfile = { ...profile, goal: goal ?? profile.goal };
      let text: string;
      if (goal === "Mua nhà") {
        text = "Mua nhà là quyết định lớn — rất đáng để chuẩn bị kỹ. Để tính được hạn mức vay phù hợp, cho tôi hỏi: thu nhập hàng tháng của bạn khoảng bao nhiêu triệu?";
      } else if (goal === "Mua xe") {
        text = "Mua xe rất thú vị! Để tìm gói vay lãi suất tốt nhất phù hợp với bạn, thu nhập hàng tháng của bạn khoảng bao nhiêu?";
      } else if (goal === "Đầu tư") {
        text = "Đầu tư thông minh bắt đầu từ việc biết rõ nguồn lực của mình. Bạn đang có thu nhập hàng tháng khoảng bao nhiêu để mình tính được dòng tiền đầu tư phù hợp?";
      } else {
        text = "Tôi có thể giúp bạn phân tích tài chính và tìm sản phẩm phù hợp nhất. Trước tiên — thu nhập hàng tháng của bạn khoảng bao nhiêu triệu?";
      }
      return { nextState: "ask_income", profile: nextProfile, text };
    }

    case "ask_income": {
      if (num !== null) {
        const nextProfile = { ...profile, income: num };
        const incStr = `${num} triệu/tháng`;
        const text =
          profile.goal === "Mua nhà" || profile.goal === "Mua xe" || profile.goal === "Vay cá nhân"
            ? `Được rồi — ${incStr}. Một câu nữa thôi: bạn đang có khoảng bao nhiêu tiền tiết kiệm sẵn có? (phần vốn tự có sẽ ảnh hưởng lớn đến lãi suất bạn nhận được)`
            : `${incStr} — ổn đấy. Bạn hiện đang có khoảng bao nhiêu tiền tích lũy? Để mình tính được danh mục đầu tư phù hợp nhất.`;
        return { nextState: "ask_savings", profile: nextProfile, text };
      }
      return {
        nextState: "ask_income",
        profile,
        text: 'Bạn có thể cho mình biết con số cụ thể không — ví dụ "15 triệu" hay "30 triệu"? Để mình tính được hạn mức chính xác hơn.',
      };
    }

    case "ask_savings": {
      if (num !== null) {
        const nextProfile = { ...profile, savings: num };
        return {
          nextState: "ask_debt",
          profile: nextProfile,
          text: `Hiểu rồi. Cuối cùng: hiện bạn có đang trả góp hay thanh toán khoản nợ nào hàng tháng không? (trả lời "không" nếu không có)`,
        };
      }
      if (isNegative(lower)) {
        const nextProfile = { ...profile, savings: 0 };
        return {
          nextState: "ask_debt",
          profile: nextProfile,
          text: "Chưa có tiết kiệm — hoàn toàn bình thường. Và hiện bạn có đang trả góp hay khoản nợ nào hàng tháng không?",
        };
      }
      return {
        nextState: "ask_savings",
        profile,
        text: 'Bạn có thể ước tính không — ví dụ "200 triệu" hay "1 tỷ"? Hoặc nếu chưa có tiết kiệm thì cứ nói "không có" nhé.',
      };
    }

    case "ask_debt": {
      const debt = isNegative(lower) ? 0 : num !== null ? num : 0;
      const nextProfile = { ...profile, debt };
      const a = calcAnalysis(nextProfile);
      const goalStr = nextProfile.goal || "tài chính";
      const introText = `Tốt — tôi đã có đủ thông tin để phân tích. Đây là bức tranh tài chính của bạn cho mục tiêu **${goalStr}**:`;
      const result: ChatResultCard = {
        title: "PHÂN TÍCH TÀI CHÍNH",
        rows: [
          ["Hạn mức vay tối đa", a.loanCap > 0 ? `${(a.loanCap / 1000).toFixed(1)} tỷ VND` : "—", "good"],
          ["Trả góp tối đa/tháng", `${a.maxEMI} triệu`, null],
          ["Tỷ lệ nợ/thu nhập", nextProfile.debt && nextProfile.debt > 0 ? `${a.dtiPct}%` : "0% ✓", "good"],
          ["Xác suất được duyệt", `${a.approval}%`, "good"],
        ],
      };
      const delayedFollowUp = `Xác suất được duyệt ${a.approval}% là rất tốt 👍 Để tôi kết nối bạn với chuyên viên tư vấn phù hợp — bạn tên gì để mình xưng hô cho tiện?`;
      return { nextState: "show_analysis", profile: nextProfile, text: introText, result, delayedFollowUp };
    }

    case "show_analysis":
    case "ask_name": {
      const words = msg.trim().split(/\s+/);
      const looksLikeName = words.length >= 1 && words.length <= 4 && extractNumber(msg) === null && !lower.includes("?");
      if (looksLikeName) {
        const nextProfile = { ...profile, name: msg.trim() };
        const nameStr = nextProfile.name!.split(" ").pop();
        return {
          nextState: "ask_phone",
          profile: nextProfile,
          text: `Vui được gặp bạn, ${nameStr}! Để chuyên viên có thể liên hệ tư vấn trực tiếp — bạn có thể để lại số điện thoại không? (hoàn toàn bảo mật, chỉ dùng để gọi tư vấn 1 lần)`,
        };
      }
      return {
        nextState: "ask_name",
        profile,
        text: "Bạn có thể cho mình biết tên không? Để tư vấn được cá nhân hóa hơn.",
      };
    }

    case "ask_phone": {
      const phoneMatch = msg.match(/0[0-9]{9}/);
      const emailMatch = msg.match(/\S+@\S+\.\S+/);
      if (phoneMatch) {
        const nextProfile = { ...profile, phone: phoneMatch[0] };
        return {
          nextState: "done",
          profile: nextProfile,
          text: `Cảm ơn ${nextProfile.name ? nextProfile.name.split(" ").pop() : "bạn"}! ✅ Chuyên viên sẽ gọi trong **15–30 phút**. Trong lúc chờ, tôi đề xuất xem ngay top sản phẩm phù hợp nhất với hồ sơ của bạn — xem ở khung bên phải nhé.`,
        };
      }
      if (emailMatch) {
        const nextProfile = { ...profile, email: emailMatch[0] };
        return {
          nextState: "done",
          profile: nextProfile,
          text: "Đã ghi nhận email của bạn. Báo cáo tài chính đầy đủ sẽ được gửi trong ít phút. Bạn có muốn tôi gợi ý thêm sản phẩm phù hợp không?",
        };
      }
      if (isNegative(lower) || lower.includes("thôi") || lower.includes("skip")) {
        return {
          nextState: "done",
          profile,
          text: "Không sao cả! Bạn có thể quay lại bất kỳ lúc nào. Có gì tôi có thể giúp thêm về tài chính không?",
        };
      }
      return {
        nextState: "ask_phone",
        profile,
        text: "Bạn có thể nhập số điện thoại (10 số) hoặc email? Hoặc nếu không muốn để lại, cứ tự nhiên hỏi tiếp — tôi vẫn sẵn sàng tư vấn.",
      };
    }

    case "done": {
      if (lower.includes("nhà") || lower.includes("house")) {
        return {
          nextState: "done",
          profile,
          text: "Để tư vấn chi tiết hơn về vay mua nhà, bạn có muốn tôi so sánh ngay các sản phẩm vay mua nhà đang có trong hệ thống không?",
        };
      }
      if (lower.includes("lãi") || lower.includes("rate")) {
        return {
          nextState: "done",
          profile,
          text: "Bạn có thể xem chi tiết lãi suất từng ngân hàng ở khung phân tích bên phải, hoặc hỏi mình so sánh cụ thể 2 sản phẩm nào đó.",
        };
      }
      return {
        nextState: "done",
        profile,
        text: "Tôi đang theo dõi hồ sơ của bạn. Bạn muốn biết thêm gì — so sánh ngân hàng, tính EMI, hay chiến lược tối ưu lãi suất?",
      };
    }
  }
}
