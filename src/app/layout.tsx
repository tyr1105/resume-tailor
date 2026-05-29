import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeTailor — AI简历定制工具",
  description: "上传你的简历，粘贴职位描述，AI帮你量身定制完美简历。支持中英文双语。Free: 3次/天",
  keywords: ["AI简历", "简历定制", "简历优化", "resume tailor", "AI resume", "求职"],
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
