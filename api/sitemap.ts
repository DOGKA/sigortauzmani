/**
 * sitemap.xml — dinamik üretim.
 *
 * Blog yazıları Supabase'de tutulup panelden yayınlandığı için sitemap
 * derleme anında değil istek anında üretilir; böylece yeni yazı için yeniden
 * dağıtım gerekmez. vercel.json `/sitemap.xml` yolunu buraya yönlendirir.
 */

import { comparisons } from "../src/data/comparisons";
import { products } from "../src/data/products";
import { SITE_URL } from "../src/lib/seo/config";
import { staticPages } from "../src/lib/seo/pages";
import { ROUTES } from "../src/lib/seo/routes";
import { fetchPostSlugs } from "./_shared/supabase";
import { escapeXml } from "./_shared/text";

export const config = { runtime: "edge" };

interface UrlEntry {
  path: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
}

function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function renderUrl(entry: UrlEntry): string {
  const parts = [
    `    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>`,
    entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : "",
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority.toFixed(1)}</priority>`,
  ].filter(Boolean);
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

export default async function handler(): Promise<Response> {
  const posts = await fetchPostSlugs();

  const entries: UrlEntry[] = [
    ...staticPages.map((page) => ({
      path: page.path,
      changefreq: page.changefreq,
      priority: page.priority,
    })),
    // Teklif sayfaları dönüşüm hedefli; ana sayfadan sonra en yüksek öncelik.
    ...products.map((product) => ({
      path: ROUTES.quote(product.slug),
      changefreq: "monthly",
      priority: 0.9,
    })),
    ...comparisons.map((comparison) => ({
      path: ROUTES.comparison(comparison.slug),
      changefreq: "monthly",
      priority: comparison.popular ? 0.8 : 0.7,
    })),
    ...posts.map((post) => ({
      path: ROUTES.blogPost(post.slug),
      lastmod: isoDate(post.updated_at) ?? isoDate(post.published_at),
      changefreq: "monthly",
      priority: 0.7,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(renderUrl).join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control":
        "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
      "x-robots-tag": "noindex",
    },
  });
}
