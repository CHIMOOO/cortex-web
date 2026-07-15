// 站点级单一事实源 —— canonical / sitemap / OG / JSON-LD 的所有绝对地址都从这里生成。
// 换正式域名时只改 siteUrl 一处，然后重新 `pnpm build`。
//
// ⚠️ 混合内容提醒：若本站走 https，而下载走 http 的内网 hub，浏览器会静默阻断下载。
//    此时请改用「同域分发形态」——见 src/config/downloads.ts 顶部说明。

export const site = {
  /** 官网正式域名（无尾斜杠）。TODO: 上线前替换为真实域名后重建。 */
  siteUrl: "https://cortex.example.com",
  /** 软件/站点名（用于 title、OG、JSON-LD） */
  name: "AIoT Cortex",
  /** 大标题英文品牌词（拉丁 glitch 字体渲染） */
  wordmark: "AIOT CORTEX",
  /** 中文定位副标题 */
  tagline: "企业内部统一软件载体平台",
  /** SEO 描述（≤78 汉字，覆盖核心关键词） */
  description:
    "AIoT Cortex 是面向组织内部成员的桌面软件载体平台，将团队 Skills 技能库自动同步至 Claude Code、Codex、Cursor 目录，支持部门订阅、实时推送与自动更新。",
  /** OG/分享用短描述 */
  shortDescription:
    "团队 Skills 技能库一键同步到 Claude Code / Codex / Cursor，部门订阅、实时推送、自动更新。",
  keywords: [
    "AIoT Cortex",
    "企业内部软件平台",
    "Skills 同步",
    "Claude Code",
    "AI 编程工具",
    "桌面客户端",
  ],
  /** html lang */
  locale: "zh-CN",
  /** og:locale */
  ogLocale: "zh_CN",
  /** 移动端地址栏与强制深色 */
  themeColor: "#0a0a0f",
  /** 页脚版权年份 */
  copyrightYear: 2026,
} as const;

/** 拼接站内绝对 URL（OG image / JSON-LD 等需要绝对地址） */
export const absUrl = (path = "/"): string =>
  new URL(path, site.siteUrl + "/").href;
