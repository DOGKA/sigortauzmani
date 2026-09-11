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
import { LOCALES } from "../src/lib/i18n/locales";
import {
  localizedPath,
  parsePath,
  isTrOnlyPage,
  type PageKey,
} from "../src/lib/i18n/paths";
import { fetchPostSlugs } from "./_shared/supabase";
import { escapeXml } from "./_shared/text";

export const config = { runtime: "edge" };

interface UrlEntry {
  path: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
  page?: PageKey | "unknown";
  slug?: string;
}

function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function xhtmlLinks(page: PageKey, slug?: string): string {
  const locales = isTrOnlyPage(page) ? (["tr"] as const) : LOCALES;
  const links = locales.map(
    (locale) =>
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${SITE_URL}${localizedPath(locale, page, { slug })}`)}" />`,
  );
  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${SITE_URL}${localizedPath("tr", page, { slug })}`)}" />`,
  );
  return links.join("\n");
}

function renderUrl(entry: UrlEntry): string {
  const parsed = parsePath(entry.path);
  const page = entry.page ?? parsed.page;
  const slug = entry.slug ?? (page === "quote" ? parsed.internalSlug : parsed.slug);
  const parts = [
    `    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>`,
    page !== "unknown" ? xhtmlLinks(page, slug) : "",
    entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : "",
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority.toFixed(1)}</priority>`,
  ].filter(Boolean);
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

function localeCopies(path: string, changefreq: string, priority: number): UrlEntry[] {
  const parsed = parsePath(path);
  if (parsed.page === "unknown") {
    return [{ path, changefreq, priority }];
  }
  const page = parsed.page;
  const slug = page === "quote" ? parsed.internalSlug : parsed.slug;
  if (isTrOnlyPage(page)) {
    return [
      {
        path: localizedPath("tr", page, { slug }),
        changefreq,
        priority,
        page,
        slug,
      },
    ];
  }
  return LOCALES.map((locale) => ({
    path: localizedPath(locale, page, { slug }),
    changefreq,
    priority: locale === "tr" ? priority : Math.max(0.3, priority - 0.1),
    page: parsed.page,
    slug,
  }));
}

export default async function handler(): Promise<Response> {
  const posts = await fetchPostSlugs();

  const entries: UrlEntry[] = [
    ...staticPages.flatMap((page) =>
      localeCopies(page.path, page.changefreq, page.priority),
    ),
    ...products.flatMap((product) =>
      localeCopies(`/teklif/${product.slug}`, "monthly", 0.9),
    ),
    ...comparisons.map((comparison) => ({
      path: `/karsilastirma/${comparison.slug}`,
      changefreq: "monthly",
      priority: comparison.popular ? 0.8 : 0.7,
      page: "comparison" as const,
      slug: comparison.slug,
    })),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastmod: isoDate(post.updated_at) ?? isoDate(post.published_at),
      changefreq: "monthly",
      priority: 0.7,
      page: "blogPost" as const,
      slug: post.slug,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
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
