export type MembershipTier = 'free' | 'pro' | 'elite';

export interface MembershipPlan {
  id: MembershipTier;
  name: string;
  priceVnd: number; // 0 for free
  period: string;
  desc: string;
  features: { ok: boolean; text: string }[];
  featured: boolean;
}

// Prices and copy match the original HTML's MEMBERSHIP_PLANS exactly.
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceVnd: 0,
    period: 'mãi mãi',
    desc: 'Bắt đầu khám phá nền tảng FinMatch AI.',
    featured: false,
    features: [
      { ok: true, text: 'Tư vấn AI cơ bản (5 câu hỏi/ngày)' },
      { ok: true, text: 'So sánh sản phẩm tài chính' },
      { ok: true, text: 'Truy cập Cộng đồng' },
      { ok: false, text: 'Mua Lead từ Marketplace' },
      { ok: false, text: 'CRM cá nhân & AI nhắc lịch' },
      { ok: false, text: 'Báo cáo hiệu suất nâng cao' },
    ],
  },
  {
    id: 'pro',
    name: 'Sale Pro',
    priceVnd: 299_000,
    period: '/tháng',
    desc: 'Dành cho Sale/CTV hoạt động chuyên nghiệp.',
    featured: true,
    features: [
      { ok: true, text: 'Tư vấn AI không giới hạn' },
      { ok: true, text: 'Mua Lead ưu tiên + giá tốt hơn 15%' },
      { ok: true, text: 'CRM cá nhân & AI nhắc lịch chăm sóc' },
      { ok: true, text: 'Mẫu kịch bản chăm sóc khách hàng' },
      { ok: true, text: 'Báo cáo hiệu suất nâng cao' },
      { ok: false, text: 'API riêng & White-label' },
    ],
  },
  {
    id: 'elite',
    name: 'Elite Agency',
    priceVnd: 899_000,
    period: '/tháng',
    desc: 'Dành cho team Sale/Đại lý quy mô lớn.',
    featured: false,
    features: [
      { ok: true, text: 'Toàn bộ quyền lợi Sale Pro' },
      { ok: true, text: 'Quản lý đa Sale trong 1 team' },
      { ok: true, text: 'AI Coach huấn luyện kỹ năng bán hàng' },
      { ok: true, text: 'Ưu tiên Lead Premium đầu tiên' },
      { ok: true, text: 'Hỗ trợ riêng 1-1 từ FinMatch' },
      { ok: true, text: 'API riêng & White-label báo cáo' },
    ],
  },
];

export function getPlan(id: MembershipTier): MembershipPlan {
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown membership plan: ${id}`);
  return plan;
}
