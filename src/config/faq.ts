// FAQ 单一事实源 —— Faq.astro 渲染 + index.astro 生成 FAQPage JSON-LD 共用，
// 保证结构化数据与页面可见内容一字不差（Google 对二者不一致有人工惩罚）。

export interface FaqItem {
  q: string;
  a: string;
}

export const faqItems: FaqItem[] = [
  {
    q: "谁可以使用 AIoT Cortex？",
    a: "本软件仅面向组织内部成员，安装包由内部服务器分发，不对外部公开提供。",
  },
  {
    q: "同步会覆盖我本地手写的 skills 吗？",
    a: "不会。同步采用受管块写入机制，只更新由平台托管的内容块，你在本地手写的文件与段落原样保留。",
  },
  {
    q: "支持哪些操作系统？",
    a: "当前提供 Windows x64 安装包；macOS（Intel / Apple Silicon）与 Linux x64 版本在构建排期中，就绪后将在下载区开放下载。",
  },
  {
    q: "客户端如何更新版本？",
    a: "无需手动操作。客户端内置自动更新，管理端发布新版本后会推送通知并直达安装。",
  },
  {
    q: "需要一直开着窗口吗？",
    a: "不需要。客户端支持系统托盘常驻与开机自启，关闭窗口后仍在后台按计划同步。",
  },
];

/** 生成 schema.org FAQPage 结构化数据节点 */
export const faqJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
});
