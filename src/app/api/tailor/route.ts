import { NextRequest, NextResponse } from "next/server";

// AI简历定制的核心Prompt
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription, language = "zh" as string, tone = "professional" as string } = body;

    // 参数校验
    if (!resume || resume.trim().length < 20) {
      return NextResponse.json(
        { error: "请提供你的简历内容（至少20个字符）" },
        { status: 400 }
      );
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: "请提供目标职位描述（至少20个字符）" },
        { status: 400 }
      );
    }

    // 获取AI API配置
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "";
    const apiBase = process.env.AI_API_BASE || "https://api.deepseek.com";
    const model = process.env.AI_MODEL || "deepseek-chat";

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI服务未配置，请联系管理员" },
        { status: 500 }
      );
    }

    // 构建用户Prompt
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

    // 调用AI API
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
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
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI服务暂时不可用，请稍后重试" },
        { status: 502 }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AI返回结果为空" },
        { status: 502 }
      );
    }

    // 解析AI返回的JSON
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      // 如果JSON解析失败，尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: "AI返回格式异常" },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      tailoredResume: parsed.tailoredResume || "",
      coverLetter: parsed.coverLetter || "",
      matchScore: Math.min(100, Math.max(0, Number(parsed.matchScore) || 0)),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    });
  } catch (error) {
    console.error("Tailor API error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
