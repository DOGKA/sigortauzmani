/**
 * Blog Open Graph görsel üreteci (SVG)
 *
 * Kullanım: /api/og?slug=yazi-adresi
 */

export const config = { runtime: "edge" };

const WIDTH = 1200;
const HEIGHT = 630;
const SITE_DOMAIN = "sigortauzmani.net";
const ACCENT_HUE = 215;

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

export default async function handler(request: Request): Promise<Response> {
  const slug = new URL(request.url).searchParams.get("slug");
  const post = slug ? await fetchPost(slug) : null;

  const title = post?.title ?? "Sigorta Uzmanı Blog";
  const category = post?.category ?? "Blog";
  const readingTime = post?.reading_time ?? 0;
  const publishedAt = formatDate(post?.published_at ?? null);
  const displayTitle = title.length > 110 ? `${title.slice(0, 110)}...` : title;
  const footerRight = [publishedAt, readingTime ? `${readingTime} dk okuma` : ""]
    .filter(Boolean)
    .join("  ·  ");

  const fontSize =
    displayTitle.length > 70 ? 52 : displayTitle.length > 40 ? 62 : 72;

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

  <text x="96" y="103" fill="#fff" font-size="22" font-family="Inter, Arial, sans-serif" font-weight="700" letter-spacing="2" text-transform="uppercase">${escapeXml(
    category,
  )}</text>

  <foreignObject x="72" y="150" width="1056" height="330">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:${fontSize}px;line-height:1.15;color:#fff;font-weight:700;letter-spacing:-1.5px;">
      ${escapeXml(displayTitle)}
    </div>
  </foreignObject>

  <line x1="72" y1="560" x2="1128" y2="560" stroke="rgba(255,255,255,0.16)" />
  <text x="72" y="602" fill="#fff" font-size="26" font-family="Inter, Arial, sans-serif" font-weight="600">${SITE_DOMAIN}</text>
  <text x="1128" y="602" text-anchor="end" fill="rgba(255,255,255,0.6)" font-size="24" font-family="Inter, Arial, sans-serif">${escapeXml(
    footerRight,
  )}</text>
</svg>`.trim();

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
