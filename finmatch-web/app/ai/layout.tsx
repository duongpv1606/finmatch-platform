import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tư vấn AI",
  description:
    "Trò chuyện với trợ lý tài chính AI — nhận tư vấn vay vốn, so sánh ngân hàng, và đề xuất sản phẩm phù hợp với hồ sơ của bạn.",
  alternates: { canonical: "/ai" },
};

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
