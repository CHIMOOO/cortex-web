// 生成 1200×630 OG 分享图 → public/og-cover.png
// 纯 Node（@napi-rs/canvas，预编译跨平台），不进构建链；发版或改品牌后手动 `pnpm gen:og`。
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const W = 1200;
const H = 630;
const cwd = process.cwd();

// —— 字体注册（拉丁自托管 woff；中文尝试系统雅黑，缺失则回退拉丁副题）——
const reg = (p, name) => {
  try {
    if (existsSync(p)) return GlobalFonts.registerFromPath(p, name);
  } catch {
    /* ignore */
  }
  return false;
};
reg(
  resolve(cwd, "node_modules/@fontsource/orbitron/files/orbitron-latin-900-normal.woff"),
  "OrbitronOG",
);
reg(
  resolve(cwd, "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff"),
  "JBMonoOG",
);
let hasCJK = false;
for (const [p, n] of [
  ["C:/Windows/Fonts/msyh.ttc", "CJKOG"],
  ["C:/Windows/Fonts/msyhbd.ttc", "CJKOG"],
  ["/System/Library/Fonts/PingFang.ttc", "CJKOG"],
]) {
  if (reg(p, n)) {
    hasCJK = true;
    break;
  }
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

// 底色
ctx.fillStyle = "#0a0a0f";
ctx.fillRect(0, 0, W, H);

// 角落霓虹雾
const glow = (x, y, r, color) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
};
glow(120, 40, 520, "rgba(0,255,136,0.18)");
glow(W - 80, 120, 460, "rgba(255,0,255,0.14)");
glow(W - 200, H, 480, "rgba(0,212,255,0.10)");

// circuit 网格
ctx.strokeStyle = "rgba(0,255,136,0.06)";
ctx.lineWidth = 1;
for (let x = 0; x <= W; x += 50) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, H);
  ctx.stroke();
}
for (let y = 0; y <= H; y += 50) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(W, y);
  ctx.stroke();
}

// 扫描线
ctx.fillStyle = "rgba(0,0,0,0.28)";
for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);

// 边框（霓虹描边）
ctx.strokeStyle = "rgba(0,255,136,0.5)";
ctx.lineWidth = 2;
ctx.strokeRect(28, 28, W - 56, H - 56);

const cx = 80;

// 顶部 label
ctx.font = '26px "JBMonoOG", monospace';
ctx.fillStyle = "#00ff88";
ctx.textBaseline = "alphabetic";
ctx.fillText("// INTERNAL PLATFORM", cx, 150);

// 主品牌词（chromatic aberration + glow）
const wordmark = "AIOT CORTEX";
ctx.font = '900 128px "OrbitronOG", sans-serif';
const drawWord = (dx, color, blur = 0) => {
  ctx.save();
  ctx.shadowColor = blur ? "rgba(0,255,136,0.6)" : "transparent";
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
  ctx.fillText(wordmark, cx + dx, 300);
  ctx.restore();
};
drawWord(-4, "#ff00ff"); // 品红左移
drawWord(4, "#00d4ff"); // 青右移
drawWord(0, "#00ff88", 32); // 主体绿 + 辉光

// 副标题
if (hasCJK) {
  ctx.font = '48px "CJKOG", sans-serif';
  ctx.fillStyle = "#e0e0e0";
  ctx.fillText("企业内部统一软件载体平台", cx, 390);
} else {
  ctx.font = '40px "OrbitronOG", sans-serif';
  ctx.fillStyle = "#e0e0e0";
  ctx.fillText("INTERNAL SOFTWARE DELIVERY PLATFORM", cx, 388);
}

// 终端行
ctx.font = '28px "JBMonoOG", monospace';
ctx.fillStyle = "#8a91a3";
ctx.fillText("> cortex sync --skills --target=claude,codex,cursor", cx, 470);

// 版本徽标（右下）
ctx.font = '26px "JBMonoOG", monospace';
ctx.fillStyle = "#00ff88";
const badge = "v0.5.0  [ STABLE ]";
const bw = ctx.measureText(badge).width;
ctx.strokeStyle = "rgba(0,255,136,0.6)";
ctx.strokeRect(W - 80 - bw - 24, H - 96, bw + 24, 44);
ctx.fillText(badge, W - 80 - bw - 12, H - 66);

const out = resolve(cwd, "public/og-cover.png");
writeFileSync(out, canvas.toBuffer("image/png"));
console.log(`OG cover written: ${out} (CJK subtitle: ${hasCJK})`);
