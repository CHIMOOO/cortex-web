import type { APIRoute } from "astro";
import { site } from "../config/site";

// 动态端点：构建期生成 dist/robots.txt，域名读 config 单源（不写死 public）。
// 官网页面允许收录；安装包目录不收录（省爬虫带宽，二进制无收录价值）。
const body = `User-agent: *
Allow: /
Disallow: /downloads/

Sitemap: ${site.siteUrl}/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
