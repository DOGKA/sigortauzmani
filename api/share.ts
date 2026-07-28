/**
 * Sosyal paylaşım için sunucu tarafında OG meta döndüren köprü sayfa.
 *
 * Kullanım: /api/share?slug=yazi-slug
 * İnsan kullanıcılar anında /blog/:slug sayfasına yönlenir.
 */

export const config = { runtime: "edge" };

interface ShareRow {
  title: string;
  excerpt: string | null;
}

function readEnv(name: string): string | undefined {
  const env = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env;
  return env?.[name];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function fetchShareMeta(slug: string): Promise<ShareRow | null> {
  const url = readEnv("VITE_SUPABASE_URL") ?? readEnv("SUPABASE_URL");
  const key =
    readEnv("VITE_SUPABASE_ANON_KEY") ?? readEnv("SUPABASE_ANON_KEY");
  if (!url || !key) return null;

  const endpoint =
    `${url}/rest/v1/blog_post_cards` +
    `?slug=eq.${encodeURIComponent(slug)}` +
    `&select=title,excerpt&limit=1`;

  try {
    const response = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as ShareRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function handler(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("slug");
  const origin = requestUrl.origin;

  if (!slug) {
    return Response.redirect(`${origin}/blog`, 302);
  }

  const blogUrl = `${origin}/blog/${encodeURIComponent(slug)}`;
  const ogImage = `${origin}/api/og?slug=${encodeURIComponent(slug)}`;
  const post = await fetchShareMeta(slug);

  const title = post?.title
    ? `${post.title} | Sigorta Uzmanı`
    : "Blog | Sigorta Uzmanı";
  const description =
    post?.excerpt ??
    "Sigorta Uzmanı blog yazıları: araç, sağlık, konut ve poliçe süreçleri.";

  const html = `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(blogUrl)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Sigorta Uzmanı" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(blogUrl)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(blogUrl)}" />
  </head>
  <body>
    <p>Yönlendiriliyor: <a href="${escapeHtml(blogUrl)}">${escapeHtml(
      blogUrl,
    )}</a></p>
    <script>window.location.replace(${JSON.stringify(blogUrl)});</script>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control":
        "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
