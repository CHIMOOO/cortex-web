// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { site } from "./src/config/site.ts";

// 纯静态输出（默认）；site 决定 canonical / sitemap / OG 的绝对地址。
// 换域名只改 src/config/site.ts 一处。
export default defineConfig({
  site: site.siteUrl,
  trailingSlash: "ignore",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      // 下载目录不进 sitemap（安装包无收录价值）
      filter: (page) => !page.includes("/downloads/"),
    }),
  ],
});
