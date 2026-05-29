import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeTailor - AI简历定制工具 | 30秒打造完美简历",
  description: "免费AI简历定制工具。粘贴简历+职位描述，AI自动优化简历、生成求职信、匹配度评分。支持中英双语，数据不离开浏览器。",
  keywords: ["AI简历", "简历定制", "简历优化", "resume tailor", "AI resume", "求职", "求职信", "cover letter", "ATS"],
  openGraph: {
    title: "ResumeTailor - AI简历定制工具",
    description: "30秒AI定制你的完美简历。免费、开源、隐私安全。",
    url: "https://tyr1105.github.io/resume-tailor/",
    siteName: "ResumeTailor",
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeTailor - AI简历定制工具",
    description: "30秒AI定制你的完美简历。免费、开源、隐私安全。",
  },
  metadataBase: new URL("https://tyr1105.github.io"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
