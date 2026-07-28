import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const WIDTH = 1200;
const HEIGHT = 630;
const SITE_DOMAIN = "sigortauzmani.net";

interface BlogCardRow {
  title: string;
  category: string | null;
  published_at: string | null;
  reading_time: number | null;
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

function clampTitle(title: string): string {
  return title.length > 120 ? `${title.slice(0, 120)}...` : title;
}

export default async function handler(request: Request): Promise<Response> {
  const slug = new URL(request.url).searchParams.get("slug");
  const post = slug ? await fetchPost(slug) : null;

  const title = clampTitle(post?.title ?? "Sigorta Uzmanı Blog");
  const category = post?.category ?? "Blog";
  const readingTime = post?.reading_time ?? 0;
  const publishedAt = formatDate(post?.published_at ?? null);
  const footerRight = [publishedAt, readingTime ? `${readingTime} dk okuma` : ""]
    .filter(Boolean)
    .join("  ·  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(circle at 12% 10%, rgba(61,139,255,0.35) 0%, rgba(61,139,255,0) 45%), radial-gradient(circle at 92% 90%, rgba(17,85,214,0.45) 0%, rgba(17,85,214,0) 40%), #0a1428",
          color: "white",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.95,
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: title.length > 80 ? 52 : title.length > 50 ? 60 : 68,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "1050px",
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: "24px",
            fontSize: 26,
            width: "100%",
          }}
        >
          <div style={{ fontWeight: 600 }}>{SITE_DOMAIN}</div>
          <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 24 }}>
            {footerRight}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "cache-control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
