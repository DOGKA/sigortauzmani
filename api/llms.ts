/**
 * llms.txt / llms-full.txt — yapay zekâ ajanları ve yanıt motorları için
 * sitenin makine-okunur özeti (bkz. llmstxt.org).
 *
 * `/llms.txt`      → bölümlere ayrılmış bağlantı dizini
 * `/llms-full.txt` → tüm rehber içeriğinin Markdown gövdesi
 *
 * Yönlendirme vercel.json üzerinden yapılır. Blog Supabase'de tutulduğu için
 * içerik istek anında derlenir ve CDN'de önbelleklenir.
 */

import { CATEGORY_LABELS as GLOSSARY_CATEGORIES, glossaryTerms } from "../src/data/glossary";
import { comparisons } from "../src/data/comparisons";
import { HOME_FAQ_ITEMS } from "../src/data/faq";
import { products } from "../src/data/products";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "../src/lib/seo/config";
import { staticPages } from "../src/lib/seo/pages";
import { ROUTES } from "../src/lib/seo/routes";
import { fetchPostCards, fetchPostsWithContent } from "./_shared/supabase";
import { htmlToMarkdown, truncate } from "./_shared/text";

export const config = { runtime: "edge" };

const url = (path: string) => `${SITE_URL}${path}`;

function header(): string {
  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME}, Türkiye'de faaliyet gösteren bir sigorta acentesidir. Kullanıcılar dokuz branşta
teklif talebi oluşturur; talep 30'a yakın anlaşmalı sigorta şirketi arasında karşılaştırılır ve
uygun teminat/fiyat seçenekleri geri iletilir.

## Temel bilgiler

- Site: ${SITE_URL}
- Dil: Türkçe (tr-TR)
- Hizmet bölgesi: Türkiye
- Telefon: ${CONTACT_PHONE_DISPLAY}
- E-posta: ${CONTACT_EMAIL}
- Ücretlendirme: Karşılaştırma, danışmanlık ve satış sonrası destek ücretsizdir. Ödenen tutar
  sigorta şirketinin belirlediği poliçe primiyle aynıdır; acente ek ücret almaz.
- Poliçe fiyatları sigorta şirketleri tarafından yasal düzenlemeler çerçevesinde belirlenir;
  acente indirim uygulayamaz, yalnızca şirketler arası karşılaştırma sunar.
- Kişisel veriler 6698 sayılı KVKK kapsamında işlenir.
`;
}

function productSection(): string {
  const lines = products.map(
    (product) =>
      `- [${product.title}](${url(ROUTES.quote(product.slug))}): ${product.metaDescription}`,
  );
  return `## Sigorta ürünleri ve teklif sayfaları\n\n${lines.join("\n")}\n`;
}

function comparisonSection(): string {
  const lines = comparisons.map(
    (comparison) =>
      `- [${comparison.shortTitle}](${url(ROUTES.comparison(comparison.slug))}): ${comparison.seoDescription}`,
  );
  return `## Ürün karşılaştırmaları\n\n${lines.join("\n")}\n`;
}

function guideSection(): string {
  const lines = staticPages
    .filter((page) => page.path !== ROUTES.home)
    .map((page) => `- [${page.h1}](${url(page.path)}): ${page.summary}`);
  return `## Rehber ve araç sayfaları\n\n- [Ana sayfa](${url(ROUTES.home)}): Dokuz branşta teklif başlangıcı.\n${lines.join("\n")}\n`;
}

function glossarySection(): string {
  const lines = glossaryTerms.map(
    (term) =>
      `- ${term.term} (${GLOSSARY_CATEGORIES[term.category]}): ${term.shortDefinition}`,
  );
  return `## Sigorta sözlüğü (${glossaryTerms.length} terim)\n\nTam açıklamalar: ${url(ROUTES.glossary)}\n\n${lines.join("\n")}\n`;
}

function faqSection(): string {
  const lines = HOME_FAQ_ITEMS.map(
    (item) => `### ${item.question}\n\n${item.answer}`,
  );
  return `## Sıkça sorulan sorular\n\n${lines.join("\n\n")}\n`;
}

async function blogIndexSection(): Promise<string> {
  const posts = await fetchPostCards();
  if (!posts.length) return `## Blog\n\nDizin: ${url(ROUTES.blog)}\n`;

  const byCategory = new Map<string, typeof posts>();
  for (const post of posts) {
    const key = post.category ?? "Genel";
    const list = byCategory.get(key) ?? [];
    list.push(post);
    byCategory.set(key, list);
  }

  const blocks = Array.from(byCategory.entries()).map(([category, list]) => {
    const lines = list.map((post) => {
      const summary = post.excerpt ? `: ${truncate(post.excerpt, 160)}` : "";
      return `- [${post.title}](${url(ROUTES.blogPost(post.slug))})${summary}`;
    });
    return `### ${category}\n\n${lines.join("\n")}`;
  });

  return `## Blog yazıları (${posts.length})\n\nDizin: ${url(ROUTES.blog)}\n\n${blocks.join("\n\n")}\n`;
}

/** llms.txt — bağlantı dizini. */
async function buildIndex(): Promise<string> {
  return [
    header(),
    productSection(),
    comparisonSection(),
    guideSection(),
    glossarySection(),
    await blogIndexSection(),
    faqSection(),
    `## Tam metin\n\nTüm rehber içeriğinin Markdown gövdesi: ${url("/llms-full.txt")}\n`,
  ].join("\n");
}

function staticPageBodies(): string {
  const blocks = staticPages.map((page) => {
    const parts = [`## ${page.h1}\n\nURL: ${url(page.path)}\n`, ...page.intro];
    for (const section of page.sections ?? []) {
      parts.push(`### ${section.heading}`);
      if (section.paragraphs?.length) parts.push(...section.paragraphs);
      if (section.items?.length) {
        parts.push(section.items.map((item) => `- ${item}`).join("\n"));
      }
    }
    return parts.join("\n\n");
  });
  return `# Sayfalar\n\n${blocks.join("\n\n---\n\n")}`;
}

function productBodies(): string {
  const blocks = products.map((product) =>
    [
      `## ${product.seoTitle}`,
      `URL: ${url(ROUTES.quote(product.slug))}`,
      `Branş: ${product.serviceType}`,
      product.metaDescription,
      product.seoBullets.map((bullet) => `- ${bullet}`).join("\n"),
    ].join("\n\n"),
  );
  return `# Sigorta ürünleri\n\n${blocks.join("\n\n---\n\n")}`;
}

function comparisonBodies(): string {
  const blocks = comparisons.map((comparison) => {
    const rows = comparison.rows
      .map((row) => `| ${row.label} | ${row.left} | ${row.right} |`)
      .join("\n");
    const faqs = comparison.faqs
      .map((faq) => `**${faq.q}**\n\n${faq.a}`)
      .join("\n\n");

    return [
      `## ${comparison.heroTitle}`,
      `URL: ${url(ROUTES.comparison(comparison.slug))}`,
      comparison.heroIntro.join("\n\n"),
      `| Kriter | ${comparison.left.name} | ${comparison.right.name} |\n| --- | --- | --- |\n${rows}`,
      `**Kimler için uygun?**\n\n- ${comparison.left.name}: ${comparison.whoFor.left}\n- ${comparison.right.name}: ${comparison.whoFor.right}`,
      `**Sonuç:** ${comparison.verdict}`,
      `**Öneri:** ${comparison.recommendationText}`,
      faqs,
    ]
      .filter(Boolean)
      .join("\n\n");
  });
  return `# Karşılaştırmalar\n\n${blocks.join("\n\n---\n\n")}`;
}

function glossaryBodies(): string {
  const blocks = glossaryTerms.map((term) =>
    [
      `## ${term.term}`,
      `URL: ${url(ROUTES.glossary)}#${term.slug}`,
      `Kategori: ${GLOSSARY_CATEGORIES[term.category]}`,
      term.definition,
    ].join("\n\n"),
  );
  return `# Sigorta sözlüğü\n\n${blocks.join("\n\n---\n\n")}`;
}

async function blogBodies(): Promise<string> {
  const posts = await fetchPostsWithContent();
  if (!posts.length) return "";

  const blocks = posts.map((post) => {
    const meta = [
      `URL: ${url(ROUTES.blogPost(post.slug))}`,
      post.category ? `Kategori: ${post.category}` : "",
      post.published_at ? `Yayın: ${post.published_at.slice(0, 10)}` : "",
      post.author_name ? `Yazar: ${post.author_name}` : "",
      post.tags?.length ? `Etiketler: ${post.tags.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return [
      `## ${post.title}`,
      meta,
      post.excerpt ?? "",
      htmlToMarkdown(post.content),
    ]
      .filter(Boolean)
      .join("\n\n");
  });

  return `# Blog yazıları\n\n${blocks.join("\n\n---\n\n")}`;
}

/** llms-full.txt — tüm içeriğin Markdown gövdesi. */
async function buildFull(): Promise<string> {
  return [
    header(),
    staticPageBodies(),
    productBodies(),
    comparisonBodies(),
    glossaryBodies(),
    faqSection(),
    await blogBodies(),
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export default async function handler(request: Request): Promise<Response> {
  const full = new URL(request.url).searchParams.get("full") === "1";
  const body = full ? await buildFull() : await buildIndex();

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control":
        "public, max-age=1800, s-maxage=86400, stale-while-revalidate=604800",
      "x-robots-tag": "noindex",
    },
  });
}
