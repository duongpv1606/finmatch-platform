import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finmatch-platform.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FinMatch AI — Trợ lý Tài Chính AI",
    template: "%s | FinMatch AI",
  },
  description:
    "So sánh lãi suất vay, thẻ tín dụng, bảo hiểm, đầu tư và tiết kiệm từ các ngân hàng hàng đầu Việt Nam. Tư vấn tài chính bằng AI, miễn phí.",
  keywords: [
    "vay mua nhà",
    "so sánh lãi suất",
    "thẻ tín dụng",
    "tư vấn tài chính AI",
    "vay ngân hàng",
    "lãi suất ngân hàng",
    "FinMatch",
  ],
  authors: [{ name: "FinMatch AI" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "FinMatch AI",
    title: "FinMatch AI — Trợ lý Tài Chính AI",
    description:
      "So sánh lãi suất vay, thẻ tín dụng, bảo hiểm, đầu tư và tiết kiệm từ các ngân hàng hàng đầu Việt Nam.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "FinMatch AI — Trợ lý Tài Chính AI",
    description: "So sánh lãi suất & sản phẩm tài chính, tư vấn bằng AI, miễn phí.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* Inter font + Tabler icons — same as the original design, loaded at runtime */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/tabler-icons.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "FinMatch AI",
              url: SITE_URL,
              description:
                "Nền tảng Fintech Marketplace tích hợp AI — so sánh sản phẩm tài chính và tư vấn thông minh.",
            }),
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
