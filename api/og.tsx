/**
 * Blog Open Graph görsel üreteci
 *
 * Yazılarda kapak görseli kullanılmadığı için paylaşım kartı başlıktan
 * üretilir; aksi halde her yazı aynı jenerik site görselini paylaşırdı.
 *
 * Kullanım: /api/og?slug=yazi-adresi
 */

import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const SIZE = { width: 1200, height: 630 };
const SITE_DOMAIN = "sigortauzmani.net";
/** Marka mavisiyle uyumlu, düşük doygunluklu slate. */
const ACCENT_HUE = 215;

interface BlogCardRow {
  title: string;
  category: string | null;
  published_at: string | null;
  reading_time: number | null;
}

async function fetchPost(slug: string): Promise<BlogCardRow | null> {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
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
  } catch (error) {
    console.error("OG görseli için yazı alınamadı:", error);
    return null;
  }
}

export default async function handler(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  const post = slug ? await fetchPost(slug) : null;

  const title = post?.title ?? "Sigorta Uzmanı Blog";
  const category = post?.category ?? "Blog";
  const readingTime = post?.reading_time ?? 0;
  const publishedAt = post?.published_at
    ? new Date(post.published_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const accent = `hsl(${ACCENT_HUE}, 45%, 72%)`;
  const displayTitle = title.length > 110 ? `${title.slice(0, 110)}…` : title;
  const fontSize = displayTitle.length > 70 ? 52 : displayTitle.length > 40 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a1428",
          backgroundImage:
            `radial-gradient(circle at 12% 8%, hsla(${ACCENT_HUE}, 70%, 50%, 0.32) 0%, transparent 55%), ` +
            "radial-gradient(circle at 92% 96%, rgba(17, 85, 214, 0.42) 0%, transparent 50%)",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#ffffff",
              border: `2px solid ${accent}`,
              borderRadius: 999,
              padding: "8px 20px",
            }}
          >
            {category}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: -1.5,
            }}
          >
            {displayTitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.16)",
            paddingTop: 28,
          }}
        >
          <div
            style={{ display: "flex", fontSize: 26, fontWeight: 600, color: "#ffffff" }}
          >
            {SITE_DOMAIN}
          </div>
          <div
            style={{ display: "flex", fontSize: 24, color: "rgba(255, 255, 255, 0.6)" }}
          >
            {[publishedAt, readingTime ? `${readingTime} dk okuma` : ""]
              .filter(Boolean)
              .join("  ·  ")}
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
