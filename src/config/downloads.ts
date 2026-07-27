// ═══════════════════════════════════════════════════════════════════════════
// 下载配置 —— 官网唯一的下载事实源。
// 构建期被页面 import，值静态内联进 HTML；运行时零 fetch、零 JS 依赖。
// 页面上所有版本号、下载地址、平台状态都从这里渲染，改一处即全站生效。
//
// 【两种下载形态，二选一（可逐平台混用）】
//
//   ① 跨域 hub 托管（默认）：官网与下载服务器不同域。
//      url 用 hubUrl() 指向 admin 服务端匿名端点：
//        https://<hub>/updates/download/<version>/<platform>/<file>
//      该端点返回 Content-Disposition: attachment，普通 <a href> 导航即触发下载，
//      文件名以服务端为准（跨域 download 属性失效不影响）。
//      ⚠️ 要求官网与 hub 协议一致（同为 https，或同为 http）。
//         https 官网 + http hub = 浏览器静默阻断下载（混合内容），此时改用形态②。
//
//   ② 同域分发（跨域/内网证书不便时的兜底，对应「把安装包丢进打包目录」）：
//      把安装包文件放进  public/downloads/  目录（发布时拷入，git 忽略二进制），
//      url 写成站内相对路径  "/downloads/<file>"  即可。构建时 Astro 原样拷进 dist，
//      安装包随静态站同域部署，彻底规避跨域与混合内容问题。
//
// 【发新版本】改 version + 对应 entry 的 url/file/size/sha256，然后重新 build。
// ═══════════════════════════════════════════════════════════════════════════

export type PlatformKey =
  | "windows-x86_64"
  | "darwin-x86_64"
  | "darwin-aarch64"
  | "linux-x86_64";

export type OsFamily = "Windows" | "macOS" | "Linux";

export interface DownloadEntry {
  platform: PlatformKey;
  os: OsFamily;
  /** 展示名，如 'Windows 10/11 (x64)' */
  label: string;
  /** 架构副标注，如 'x86_64' */
  arch: string;
  /** ★ 绝对 URL（形态①）或站内相对路径 '/downloads/xxx'（形态②）；available=false 时可留空 */
  url: string;
  /** 展示用文件名 */
  file: string;
  /** 文件字节数，可选（页面格式化为 MB） */
  size?: number;
  /** 安装包 SHA-256，可选（终端风格展示校验值） */
  sha256?: string;
  /** false → 未发布，渲染为置灰「构建排期中」，不生成下载链接 */
  available: boolean;
}

export interface DownloadsConfig {
  /** 当前版本号 —— 全站版本文案的唯一来源 */
  version: string;
  /** 发布日期（ISO），可选 */
  releasedAt?: string;
  entries: DownloadEntry[];
}

/**
 * 构造 admin 服务端下载地址（与 server/src/routes/updates.ts 的 artifactUrl 同构）。
 * @param base  hub 基址，如 'https://hub.example.com'（无尾斜杠）
 */
export const hubUrl = (
  base: string,
  version: string,
  platform: PlatformKey,
  file: string,
): string =>
  `${base}/updates/download/${version}/${platform}/${encodeURIComponent(file)}`;

// ── hub 基址：跨域托管形态下改这里；同域形态下忽略（entry.url 直接写 /downloads/…）──
// 内网 admin 服务端（skillsHub-admin），与 deploy.env 的 SKILLSHUB_PUBLIC_URL 必须一致 ——
// latest.json 里的下载地址由服务端按该值生成，两处不一致会出现「官网能下、客户端更新下不到」。
const HUB_BASE = "http://192.168.75.203:41151";
const VERSION = "1.0.1";

/**
 * Windows 安装包文件名 —— 必须与 Tauri NSIS 产物**逐字符一致**（含空格），
 * 因为 url 里的文件名就是服务端 data/updates/<version>/<platform>/ 下的真实文件名。
 * 命名规则 `{productName}_{version}_{arch}-setup.exe`，productName 取自桌面端
 * deploy/preset.json 的 appName（「AIoT Cortex」，中间是**空格不是连字符**）。
 * hubUrl() 内部对文件名做 encodeURIComponent，空格会编码成 %20，无需在此预编码。
 */
const WIN_SETUP = `AIoT Cortex_${VERSION}_x64-setup.exe`;

export const downloads: DownloadsConfig = {
  version: VERSION,
  releasedAt: "2026-07-27",
  entries: [
    {
      platform: "windows-x86_64",
      os: "Windows",
      label: "Windows 10/11",
      arch: "x86_64",
      // 形态①（默认）：跨域 hub 托管
      url: hubUrl(HUB_BASE, VERSION, "windows-x86_64", WIN_SETUP),
      // 形态②（兜底）：把包丢进 public/downloads/ 后改成下面这行——
      // url: `/downloads/${WIN_SETUP}`,
      file: WIN_SETUP,
      size: 5_567_651,
      sha256: "236e94a9b39d3e6d254feebe51f3e7b2e0cd01f5aa59916f792bc731fe917292",
      available: true,
    },
    {
      platform: "darwin-aarch64",
      os: "macOS",
      label: "macOS (Apple Silicon)",
      arch: "aarch64",
      url: "",
      file: "",
      available: false,
    },
    {
      platform: "darwin-x86_64",
      os: "macOS",
      label: "macOS (Intel)",
      arch: "x86_64",
      url: "",
      file: "",
      available: false,
    },
    {
      platform: "linux-x86_64",
      os: "Linux",
      label: "Linux",
      arch: "x86_64",
      url: "",
      file: "",
      available: false,
    },
  ],
};

/** 首个可用平台（当前 = Windows），供 Hero 主 CTA 与 JSON-LD downloadUrl 复用 */
export const primaryDownload: DownloadEntry =
  downloads.entries.find((e) => e.available) ?? downloads.entries[0]!;

/** 字节数 → 人类可读，如 '48.2 MB' */
export const formatSize = (bytes?: number): string | null =>
  bytes == null ? null : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
