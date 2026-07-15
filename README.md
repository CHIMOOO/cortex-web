# cortex-web

**AIoT Cortex 官网** —— 组织内部桌面软件载体平台的静态官网。
Astro 5（纯静态输出，默认零 JS）+ Tailwind CSS 4，遵循 [`Cyberpunk.md`](./Cyberpunk.md) 设计系统。

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # 产出 dist/（纯静态）
pnpm preview    # 本地验收 dist/
```

部署：`dist/` 是纯静态资源（HTML/CSS/woff2/图片 + sitemap + robots），任意静态托管即可，
无需 Node 运行时、无 rewrite 规则（纯静态路由）。nginx 示例：`root /path/to/dist;`。

## 两处关键配置

### 1. 站点域名与文案 —— `src/config/site.ts`

`siteUrl` 是 canonical / sitemap / OG / JSON-LD 所有绝对地址的**唯一来源**。
换正式域名时只改这一处，然后 `pnpm build`。

### 2. 下载地址 —— `src/config/downloads.ts`

页面上所有版本号、下载按钮、平台状态都从这里渲染。发新版改 `version` 与对应 entry 即可。

支持两种下载形态（可逐平台混用）：

| 形态 | 何时用 | `url` 写法 |
| --- | --- | --- |
| ① 跨域 hub 托管（默认） | 官网与下载服务器不同域，且**协议一致** | `hubUrl(HUB_BASE, version, platform, file)` |
| ② 同域分发（兜底） | 跨域/内网证书不便，或 hub 无 https | `"/downloads/<file>"`，把安装包丢进 `public/downloads/` |

> ⚠️ **混合内容警告**：若官网走 **https** 而下载 hub 走 **http**（内网常态），
> 浏览器会**静默阻断**下载，用户几乎无感知。此时**必须切形态②**（同域分发）：
> 把安装包文件拷进 `public/downloads/`，把对应 entry 的 `url` 改成 `/downloads/<file>`，重新 build。
> 安装包随静态站同域部署，彻底规避跨域与混合内容。

安装包一律用 `<a href>` 导航下载（hub 端点已返回 `Content-Disposition: attachment` 兜底文件名），
**不要用 fetch 下载**。

## 目录

```
src/config/     site.ts（站点/SEO 单源）· downloads.ts（下载单源）
src/styles/     global.css（设计令牌 + 工具类 + reduced-motion 降级）
src/layouts/    Base.astro（SEO head / JSON-LD / 扫描线层）
src/components/  九个分区组件
src/pages/      index.astro · 404.astro · robots.txt.ts（动态端点，域名读 config）
public/         图标 · og-cover.png · downloads/（安装包，git 忽略二进制）
scripts/        gen-og.mjs（生成 1200×630 分享图）
```

## 说明

- **图标** `public/{favicon.ico,favicon-32x32.png,apple-touch-icon.png,logo.png}` 为客户端
  `src-tauri/icons/` 的一次性只读拷贝，与桌面端同源，不建立跨仓构建依赖。
- **版本漂移**：admin 发新版后，官网需改 `downloads.ts` 的 `version` 并重新 build 才会更新显示。
  （自动拉取 `latest.json` 生成配置属后续演进，本期不做。）
- **安装包不进 git**：`public/downloads/` 下二进制被 `.gitignore` 忽略，发布/部署时再注入。
- **OG 分享图**：`pnpm gen:og` 生成 `public/og-cover.png`（1200×630）。
