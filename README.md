# ResumeTailor — AI简历定制工具

🚀 AI驱动的简历定制工具。粘贴简历 + 职位描述 → AI量身定制 + 求职信 + 匹配度评分。

## ✨ 功能

- 🤖 AI智能匹配 — 根据JD关键词自动优化简历
- 📝 求职信生成 — 一键生成针对性求职信
- 📊 匹配度评分 — 量化你的简历与职位匹配程度
- 🌐 中英双语 — 支持中文和英文简历输出
- 🎨 多种风格 — 专业/创意/精简三种风格
- 🔒 隐私安全 — 数据仅用于本次处理，不存储

## 🛠 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: DeepSeek API (OpenAI兼容接口)
- **部署**: Vercel

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 AI API Key

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 📋 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | - |
| `AI_API_BASE` | API基础URL | `https://api.deepseek.com` |
| `AI_MODEL` | AI模型名称 | `deepseek-chat` |

## 💰 商业模式

- **免费层**: 3次/天
- **Pro**: $9/月 — 无限次 + 高级功能
- **Lifetime**: $49 — 买断制

## 📱 推广策略

1. **小红书SEO** — 发布求职技巧文章引流
2. **Product Hunt** — 英文版上线发布
3. **即刻** — 分享独立开发者过程
4. **V2EX** — 技术社区推广

## License

MIT
