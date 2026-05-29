// 核心类型定义

export interface TailorRequest {
  resume: string;        // 原始简历内容
  jobDescription: string; // 目标职位描述
  language: "zh" | "en";  // 输出语言
  tone: "professional" | "creative" | "concise"; // 风格
}

export interface TailorResponse {
  tailoredResume: string;     // 定制后的简历（Markdown格式）
  coverLetter: string;        // 生成的求职信
  matchScore: number;         // 匹配度评分 0-100
  keywords: string[];         // 提取的关键词
  suggestions: string[];      // 改进建议
}

export type Step = "input" | "processing" | "result";
