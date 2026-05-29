"use client";

import { useState, useCallback } from "react";

export default function Home() {
  const [step, setStep] = useState<"input" | "processing" | "result">("input");
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const [tone, setTone] = useState<"professional" | "creative" | "concise">("professional");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"resume" | "coverLetter">("resume");
  const [apiKey, setApiKey] = useState("");

  // 系统提示词
  const SYSTEM_PROMPT = `你是一位世界级的简历定制专家和职业顾问。你的任务是根据目标职位描述，对用户的原始简历进行量身定制。

核心原则：
1. **不编造经历** — 只基于用户提供的真实经历进行优化重组
2. **关键词匹配** — 从职位描述中提取关键技能和要求的词汇，自然融入简历
3. **量化成就** — 尽可能用数字和结果来描述工作成就
4. **ATS友好** — 确保简历能通过ATS（申请人追踪系统）的筛选
5. **结构优化** — 突出最相关的经验，将不相关的精简或后移

输出格式（严格使用以下JSON结构）：
{
  "tailoredResume": "Markdown格式的定制简历",
  "coverLetter": "300字以内的求职信",
  "matchScore": 85,
  "keywords": ["关键词1", "关键词2"],
  "suggestions": ["改进建议1", "改进建议2"]
}`;

  // 提交简历定制请求
  const handleTailor = useCallback(async () => {
    if (!apiKey || apiKey.trim().length < 10) {
      setError("请先输入你的 DeepSeek API Key（用于调用AI）");
      return;
    }
    if (resume.trim().length < 20) {
      setError("请先粘贴你的简历内容（至少20个字符）");
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError("请粘贴目标职位描述（至少20个字符）");
      return;
    }

    setError("");
    setStep("processing");

    try {
      const languageInstruction = language === "zh"
        ? "请用中文输出简历和求职信"
        : "Please output the resume and cover letter in English";

      const toneInstructions: Record<string, string> = {
        professional: "使用专业、正式的措辞",
        creative: "使用有创意、有个人特色的措辞，适合创意行业",
        concise: "使用简洁有力的措辞，每条经历控制在1-2行",
      };
      const toneInstruction = toneInstructions[tone] || toneInstructions["professional"];

      const userPrompt = `请根据以下信息定制简历：

## 我的原始简历：
${resume}

## 目标职位描述：
${jobDescription}

## 要求：
- ${languageInstruction}
- ${toneInstruction}
- 匹配度评分请基于：技能匹配度、经验相关度、关键词覆盖度
- 简历使用Markdown格式，结构清晰
- 求职信要真诚、有针对性，不要套话

请严格按照JSON格式输出结果。`;

      // 直接在浏览器端调用DeepSeek API
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API调用失败 (${response.status}): ${errText.slice(0, 200)}`);
      }

      const aiResult = await response.json();
      const content = aiResult.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("AI返回结果为空");
      }

      // 解析JSON
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("AI返回格式异常");
        }
      }

      setResult(parsed);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
      setStep("input");
    }
  }, [resume, jobDescription, language, tone, apiKey, SYSTEM_PROMPT]);

  // 重新开始
  const handleReset = () => {
    setStep("input");
    setResult(null);
    setError("");
    setActiveTab("resume");
  };

  // 复制到剪贴板
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板！");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("已复制到剪贴板！");
    }
  };

  // 简单的Markdown转HTML
  const markdownToHtml = (md: string): string => {
    return md
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>[\s\S]*<\/li>)/, "<ul>$1</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
              RT
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
              ResumeTailor
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--primary)", color: "white" }}>
              AI
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
            <span>免费使用 · 中英双语 · 数据不离开浏览器</span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* ===== 步骤1：输入 ===== */}
        {step === "input" && (
          <div className="space-y-6">
            {/* Hero区 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3"
                style={{ color: "var(--foreground)" }}>
                AI 帮你定制<span style={{ color: "var(--primary)" }}>完美简历</span>
              </h1>
              <p className="text-lg" style={{ color: "var(--muted)" }}>
                粘贴简历 + 职位描述 → AI量身定制 + 求职信 + 匹配度评分
              </p>
            </div>

            {/* API Key 输入 */}
            <div className="rounded-xl border p-4"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">🔑 DeepSeek API Key</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  （你的key只在浏览器使用，不会上传到任何服务器）
                </span>
              </div>
              <input
                type="password"
                className="w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                }}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
                没有Key？<a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>免费注册获取</a>（DeepSeek API约 ¥1/百万token，非常便宜）
              </p>
            </div>

            {/* 双栏输入 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 左：简历输入 */}
              <div className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    style={{ background: "var(--primary)" }}>1</div>
                  <h2 className="font-semibold">你的简历</h2>
                </div>
                <textarea
                  className="w-full h-64 rounded-lg border p-3 text-sm resize-none focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--background)",
                    color: "var(--foreground)",
                  }}
                  placeholder={"粘贴你的简历内容...\n\n示例：\n张三 | 产品经理 | 5年经验\n\n工作经历：\n- XX公司 产品经理 (2021-至今)\n  负责XX产品线，DAU从10万提升至50万\n\n教育：\n- XX大学 计算机科学 本科"}
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
                <div className="flex justify-between text-xs" style={{ color: "var(--muted)" }}>
                  <span>支持纯文本或Markdown格式</span>
                  <span>{resume.length} 字符</span>
                </div>
              </div>

              {/* 右：职位描述 */}
              <div className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    style={{ background: "var(--accent)" }}>2</div>
                  <h2 className="font-semibold">目标职位描述</h2>
                </div>
                <textarea
                  className="w-full h-64 rounded-lg border p-3 text-sm resize-none focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--background)",
                    color: "var(--foreground)",
                  }}
                  placeholder={"粘贴目标职位的JD...\n\n示例：\n职位：高级产品经理\n公司：XX科技\n\n要求：\n- 5年以上互联网产品经验\n- 熟悉数据分析和用户增长\n- 有B端SaaS产品经验优先..."}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <div className="flex justify-between text-xs" style={{ color: "var(--muted)" }}>
                  <span>直接复制招聘网站的职位描述</span>
                  <span>{jobDescription.length} 字符</span>
                </div>
              </div>
            </div>

            {/* 选项区 */}
            <div className="flex flex-wrap items-center gap-6">
              {/* 语言选择 */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>输出语言：</span>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => setLanguage("zh")}
                    className="px-3 py-1.5 text-sm font-medium transition-colors"
                    style={{
                      background: language === "zh" ? "var(--primary)" : "var(--surface)",
                      color: language === "zh" ? "white" : "var(--foreground)",
                    }}
                  >中文</button>
                  <button
                    onClick={() => setLanguage("en")}
                    className="px-3 py-1.5 text-sm font-medium transition-colors"
                    style={{
                      background: language === "en" ? "var(--primary)" : "var(--surface)",
                      color: language === "en" ? "white" : "var(--foreground)",
                    }}
                  >English</button>
                </div>
              </div>

              {/* 风格选择 */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>风格：</span>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                  {([
                    { key: "professional" as const, label: "专业" },
                    { key: "creative" as const, label: "创意" },
                    { key: "concise" as const, label: "精简" },
                  ] as const).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTone(t.key)}
                      className="px-3 py-1.5 text-sm font-medium transition-colors"
                      style={{
                        background: tone === t.key ? "var(--primary)" : "var(--surface)",
                        color: tone === t.key ? "white" : "var(--foreground)",
                      }}
                    >{t.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="rounded-lg p-3 text-sm" style={{ background: "#fef2f2", color: "var(--danger)" }}>
                ⚠️ {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              onClick={handleTailor}
              className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
            >
              🚀 开始定制简历
            </button>
          </div>
        )}

        {/* ===== 步骤2：处理中 ===== */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="flex gap-2">
              <div className="loading-dot w-3 h-3 rounded-full" style={{ background: "var(--primary)" }}></div>
              <div className="loading-dot w-3 h-3 rounded-full" style={{ background: "var(--primary)" }}></div>
              <div className="loading-dot w-3 h-3 rounded-full" style={{ background: "var(--primary)" }}></div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                AI 正在为你定制简历...
              </h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                分析你的经历 · 匹配职位关键词 · 优化表述 · 生成求职信（约10-30秒）
              </p>
            </div>
          </div>
        )}

        {/* ===== 步骤3：结果展示 ===== */}
        {step === "result" && result && (
          <div className="space-y-6">
            {/* 顶部：匹配度 + 操作 */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button onClick={handleReset}
                  className="text-sm flex items-center gap-1 hover:underline" style={{ color: "var(--primary)" }}>
                  ← 重新开始
                </button>
                <div className="text-sm" style={{ color: "var(--muted)" }}>
                  匹配度：
                  <span className="font-bold text-lg ml-1"
                    style={{ color: Number(result.matchScore || 0) >= 70 ? "var(--success)" : Number(result.matchScore || 0) >= 40 ? "var(--warning)" : "var(--danger)" }}>
                    {String(result.matchScore)}%
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleCopy(activeTab === "resume" ? String(result.tailoredResume || "") : String(result.coverLetter || ""))}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  📋 复制
                </button>
              </div>
            </div>

            {/* Tab切换 */}
            <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--surface)" }}>
              <button
                onClick={() => setActiveTab("resume")}
                className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  background: activeTab === "resume" ? "var(--background)" : "transparent",
                  color: activeTab === "resume" ? "var(--primary)" : "var(--muted)",
                  boxShadow: activeTab === "resume" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                📄 定制简历
              </button>
              <button
                onClick={() => setActiveTab("coverLetter")}
                className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  background: activeTab === "coverLetter" ? "var(--background)" : "transparent",
                  color: activeTab === "coverLetter" ? "var(--primary)" : "var(--muted)",
                  boxShadow: activeTab === "coverLetter" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                ✉️ 求职信
              </button>
            </div>

            {/* 内容区 */}
            <div className="rounded-xl border p-6"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              {activeTab === "resume" ? (
                <div className="resume-preview whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(String(result.tailoredResume || "")) }}
                />
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed"
                  style={{ color: "var(--foreground)" }}>
                  {String(result.coverLetter || "")}
                </div>
              )}
            </div>

            {/* 侧栏信息 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* 关键词 */}
              {Array.isArray(result.keywords) && (result.keywords as unknown[]).length > 0 && (
                <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <h3 className="font-semibold mb-2">🎯 匹配关键词</h3>
                  <div className="flex flex-wrap gap-2">
                    {(result.keywords as unknown[]).map((kw, i) => (
                      <span key={i} className="px-2 py-1 rounded-md text-xs font-medium"
                        style={{ background: "var(--primary)", color: "white", opacity: 0.8 + (0.2 * Number(i) / (result.keywords as unknown[]).length) }}>
                        {String(kw)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 改进建议 */}
              {Array.isArray(result.suggestions) && result.suggestions.length > 0 && (
                <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <h3 className="font-semibold mb-2">💡 改进建议</h3>
                  <ul className="space-y-1 text-sm">
                    {(result.suggestions as unknown[]).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span style={{ color: "var(--warning)" }}>•</span>
                        <span style={{ color: "var(--foreground)" }}>{String(s)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t py-6 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        <p>ResumeTailor — AI驱动的简历定制工具 · 支持中英双语</p>
        <p className="mt-1 text-xs">所有数据仅在浏览器本地处理，不会上传到任何服务器</p>
        <p className="mt-2 text-xs">
          Powered by <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>DeepSeek AI</a>
          {" · "}Open Source on <a href="https://github.com/tyr1105/resume-tailor" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>GitHub</a>
        </p>
      </footer>
    </div>
  );
}
