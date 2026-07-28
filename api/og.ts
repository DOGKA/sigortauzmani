/**
 * Blog Open Graph görsel üreteci (PNG, Node.js Serverless Function)
 *
 * Kullanım: /api/og?slug=yazi-adresi
 *
 * WhatsApp, X ve LinkedIn gibi platformlar og:image için SVG kabul etmiyor
 * (yalnızca JPEG/PNG/WebP); bu yüzden SVG önce oluşturulup ardından
 * @resvg/resvg-js ile PNG'e dönüştürülür. resvg-js native bir binary
 * kullandığından bu fonksiyon Edge değil Node.js runtime'ında çalışır.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const WIDTH = 1200;
const HEIGHT = 630;
const SITE_DOMAIN = "sigortauzmani.net";
const ACCENT_HUE = 215;
const FONT_FAMILY = "Inter";

// Vercel'in Node.js fonksiyonları sistem fontu içermez; resvg-js metinleri
// sessizce boş bırakır. Bu yüzden fontlar repodan (api/fonts) doğrudan
// yükleniyor. vercel.json'daki `includeFiles` bu dosyaları bundle'a dahil eder.
function resolveFontFiles(): string[] {
  // package.json "type": "module" olduğundan bu dosya ESM olarak derlenir;
  // `__dirname` yok, bu yüzden `import.meta.url` kullanılıyor.
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(process.cwd(), "api/fonts"),
    join(moduleDir, "fonts"),
  ];
  for (const dir of candidates) {
    const regular = join(dir, "Inter-Regular.ttf");
    const bold = join(dir, "Inter-Bold.ttf");
    if (existsSync(regular) && existsSync(bold)) return [regular, bold];
  }
  return [];
}

interface BlogCardRow {
  title: string;
  category: string | null;
  published_at: string | null;
  reading_time: number | null;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function readEnv(name: string): string | undefined {
  const env = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env;
  return env?.[name];
}

async function fetchPost(slug: string): Promise<BlogCardRow | null> {
  const url = readEnv("VITE_SUPABASE_URL") ?? readEnv("SUPABASE_URL");
  const key =
    readEnv("VITE_SUPABASE_ANON_KEY") ?? readEnv("SUPABASE_ANON_KEY");
  if (!url || !key) return null;

  const endpoint =
    `${url}/rest/v1/blog_post_cards` +
    `?slug=eq.${encodeURIComponent(slug)}` +
    `&select=title,category,published_at,reading_time&limit=1`;

  try {
    const response = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as BlogCardRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function wrapLines(text: string, maxChars = 34, maxLines = 4): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines - 1) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?-]+$/g, "")}...`;
  }

  return lines.length ? lines : ["Sigorta Uzmanı Blog"];
}

export async function GET(request: Request): Promise<Response> {
  const slug = new URL(request.url).searchParams.get("slug");
  const post = slug ? await fetchPost(slug) : null;

  const title = post?.title ?? "Sigorta Uzmanı Blog";
  const category = post?.category ?? "Blog";
  const readingTime = post?.reading_time ?? 0;
  const publishedAt = formatDate(post?.published_at ?? null);
  const footerRight = [publishedAt, readingTime ? `${readingTime} dk okuma` : ""]
    .filter(Boolean)
    .join("  ·  ");

  const titleLines = wrapLines(title, 35, 4);
  const titleSize = titleLines.length >= 4 ? 58 : titleLines.length === 3 ? 64 : 72;
  const titleStartY = 210;
  const lineHeight = Math.round(titleSize * 1.16);

  const titleTspans = titleLines
    .map((line, index) => {
      const y = titleStartY + index * lineHeight;
      return `<tspan x="88" y="${y}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="g1" cx="12%" cy="8%" r="60%">
      <stop offset="0%" stop-color="hsla(${ACCENT_HUE},70%,50%,0.32)" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
    <radialGradient id="g2" cx="92%" cy="96%" r="55%">
      <stop offset="0%" stop-color="rgba(17,85,214,0.42)" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0a1428" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g1)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g2)" />

  <text x="88" y="110" fill="#ffffff" font-size="22" font-family="${FONT_FAMILY}" font-weight="700" letter-spacing="2">${escapeXml(
    category.toUpperCase(),
  )}</text>

  <text fill="#ffffff" font-size="${titleSize}" font-family="${FONT_FAMILY}" font-weight="700" letter-spacing="-1.2">
    ${titleTspans}
  </text>

  <line x1="72" y1="560" x2="1128" y2="560" stroke="rgba(255,255,255,0.16)" />
  <text x="72" y="602" fill="#ffffff" font-size="26" font-family="${FONT_FAMILY}" font-weight="700">${SITE_DOMAIN}</text>
  <text x="1128" y="602" text-anchor="end" fill="rgba(255,255,255,0.68)" font-size="24" font-family="${FONT_FAMILY}" font-weight="400">${escapeXml(
    footerRight,
  )}</text>
</svg>`.trim();

  const fontFiles = resolveFontFiles();
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
    font: {
      loadSystemFonts: false,
      fontFiles,
      defaultFontFamily: FONT_FAMILY,
    },
  });
  const pngBuffer = resvg.render().asPng();

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      "content-type": "image/png",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
