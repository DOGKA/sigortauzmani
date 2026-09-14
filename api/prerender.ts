/**
 * JavaScript çalıştırmayan tarayıcı/botlar için sunucu tarafı HTML.
 *
 * Site bir React SPA olduğundan başlık, açıklama, canonical, yapılandırılmış
 * veri ve gövde metni ancak tarayıcıda JavaScript çalıştıktan sonra oluşur.
 * GPTBot, ClaudeBot, PerplexityBot gibi yapay zekâ tarayıcıları ve sosyal
 * önizleme botları JavaScript çalıştırmaz; bu uç nokta onlara aynı içeriği
 * sunucuda üretip verir (dinamik render).
 *
 * İçerik eşitliği kritik: metinler React sayfalarının okuduğu aynı
 * modüllerden (src/data/*, src/lib/seo/*, Supabase) gelir. Blog gövdesi
 * istemcideki `prepareBlogContent` ile birebir aynı işlemden geçer.
 *
 * Yönlendirme middleware.ts üzerinden yapılır; ziyaretçi adres çubuğunda
 * gerçek adresi görmeye devam eder.
 */

import { GLOSSARY, localizedCategoryLabels, localizedGlossaryTerms } from "../src/lib/i18n/glossary";
import {
  CATEGORY_LABELS as COMPARISON_CATEGORIES,
  comparisons,
  getComparison,
} from "../src/data/comparisons";
import { HOME_FAQ_ITEMS } from "../src/data/faq";
import { getProduct, products } from "../src/data/products";
import { LOCALES, LOCALE_META } from "../src/lib/i18n/locales";
import {
  isTrOnlyPage,
  localizedPath,
  parsePath,
  type PageKey,
} from "../src/lib/i18n/paths";
import { MESSAGES } from "../src/lib/i18n/messages";
import { localizedProduct } from "../src/lib/i18n/products";
import { calculateReadingTime, createExcerpt, prepareBlogContent } from "../src/lib/blog/content";
import {
  DEFAULT_OG_IMAGE_PATH,
  ROBOTS_INDEX,
  ROBOTS_NOINDEX,
  SITE_NAME,
  absoluteUrl,
  ogImageUrl,
  pageOgImageUrl,
  withBrand,
} from "../src/lib/seo/config";
import { blogListNode } from "../src/lib/seo/nodes/blog";
import { comparisonListNode, comparisonNodes } from "../src/lib/seo/nodes/comparison";
import { glossaryTermSetNode } from "../src/lib/seo/nodes/glossary";
import { productServiceNode } from "../src/lib/seo/nodes/product";
import { getStaticPage, type StaticPageSeo } from "../src/lib/seo/pages";
import { ROUTES } from "../src/lib/seo/routes";
import {
  articleSchema,
  faqSchema,
  itemListSchema,
  pageGraph,
  type BreadcrumbItem,
  type JsonLd,
} from "../src/lib/seo/schema";
import { fetchPostCards, fetchPostResult } from "./_shared/supabase";
import { escapeHtml, truncate } from "./_shared/text";

export const config = { runtime: "edge" };

const HOME_CRUMB: BreadcrumbItem = { name: "Ana Sayfa", path: ROUTES.home };

interface RenderedPage {
  path: string;
  title: string;
  description: string;
  h1: string;
  bodyHtml: string;
  jsonLd: JsonLd;
  breadcrumb: BreadcrumbItem[];
  image: string;
  type?: "website" | "article";
  robots?: string;
  status?: number;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  section?: string | null;
  tags?: string[];
}

/* ── Gövde parçaları ──────────────────────────────────────────────── */

function paragraphs(values: string[]): string {
  return values.map((value) => `<p>${escapeHtml(value)}</p>`).join("\n");
}

function bulletList(values: string[]): string {
  if (!values.length) return "";
  return `<ul>\n${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("\n")}\n</ul>`;
}

function linkList(entries: { name: string; path: string; description?: string }[]): string {
  const items = entries.map((entry) => {
    const summary = entry.description ? ` — ${escapeHtml(entry.description)}` : "";
    return `<li><a href="${escapeHtml(entry.path)}">${escapeHtml(entry.name)}</a>${summary}</li>`;
  });
  return `<ul>\n${items.join("\n")}\n</ul>`;
}

function breadcrumbHtml(items: BreadcrumbItem[]): string {
  const parts = items.map((item, index) => {
    const isLast = index === items.length - 1;
    if (isLast || !item.path) return `<span>${escapeHtml(item.name)}</span>`;
    return `<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>`;
  });
  return `<nav aria-label="Sayfa konumu">${parts.join(" / ")}</nav>`;
}

/** Her sayfada tam iç bağlantı grafiği; botlar tek istekte tüm siteyi görür. */
function siteNavHtml(): string {
  const productLinks = products
    .map(
      (product) =>
        `<li><a href="${ROUTES.quote(product.slug)}">${escapeHtml(product.title)}</a></li>`,
    )
    .join("");
  const guideLinks = [
    { name: "Blog", path: ROUTES.blog },
    { name: "Sigorta Sözlüğü", path: ROUTES.glossary },
    { name: "Karşılaştırma Merkezi", path: ROUTES.comparisonHub },
    { name: "Risk Haritası", path: ROUTES.riskMap },
    { name: "Poliçe İptal", path: ROUTES.policyCancel },
    { name: "Hakkımızda", path: ROUTES.about },
    { name: "İletişim", path: ROUTES.contact },
  ]
    .map((item) => `<li><a href="${item.path}">${escapeHtml(item.name)}</a></li>`)
    .join("");

  return `<nav aria-label="Site bağlantıları">
  <h2>Sigorta ürünleri</h2>
  <ul>${productLinks}</ul>
  <h2>Bilgi merkezi</h2>
  <ul>${guideLinks}</ul>
</nav>`;
}

function faqHtml(entries: { question: string; answer: string }[]): string {
  const items = entries
    .map(
      (entry) =>
        `<section><h3>${escapeHtml(entry.question)}</h3><p>${escapeHtml(entry.answer)}</p></section>`,
    )
    .join("\n");
  return `<section><h2>Sıkça sorulan sorular</h2>\n${items}\n</section>`;
}

function staticSectionsHtml(page: StaticPageSeo): string {
  return (page.sections ?? [])
    .map((section) => {
      const body = [
        section.paragraphs ? paragraphs(section.paragraphs) : "",
        section.items ? bulletList(section.items) : "",
        section.closing ? paragraphs(section.closing) : "",
      ]
        .filter(Boolean)
        .join("\n");
      return `<section><h2>${escapeHtml(section.heading)}</h2>\n${body}\n</section>`;
    })
    .join("\n");
}

/* ── Rota çözümleyicileri ─────────────────────────────────────────── */

function renderStaticPage(page: StaticPageSeo, extra: JsonLd[] = [], extraHtml = ""): RenderedPage {
  return {
    path: page.path,
    title: page.title,
    description: page.description,
    h1: page.h1,
    breadcrumb: page.breadcrumb,
    image: pageOgImageUrl(page.h1),
    bodyHtml: [paragraphs(page.intro), staticSectionsHtml(page), extraHtml]
      .filter(Boolean)
      .join("\n"),
    jsonLd: pageGraph({
      path: page.path,
      name: page.title,
      description: page.description,
      type: page.schemaType,
      breadcrumb: page.breadcrumb,
      extra,
    }),
  };
}

function renderHome(): RenderedPage {
  const page = getStaticPage(ROUTES.home)!;
  const faqEntries = HOME_FAQ_ITEMS.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));

  return renderStaticPage(
    page,
    [
      faqSchema(faqEntries, ROUTES.home),
      itemListSchema(
        products.map((product) => ({
          name: product.title,
          path: ROUTES.quote(product.slug),
          description: product.metaDescription,
        })),
        ROUTES.home,
        "Sigorta Uzmanı ürünleri",
      ),
    ],
    [
      `<section><h2>Teklif sayfaları</h2>${linkList(
        products.map((product) => ({
          name: product.seoTitle,
          path: ROUTES.quote(product.slug),
          description: product.metaDescription,
        })),
      )}</section>`,
      faqHtml(faqEntries),
    ].join("\n"),
  );
}

function renderQuote(slug: string): RenderedPage | null {
  const product = getProduct(slug);
  if (!product) return null;

  const path = ROUTES.quote(product.slug);
  const breadcrumb = [HOME_CRUMB, { name: product.title }];

  return {
    path,
    title: product.seoTitle,
    description: product.metaDescription,
    h1: product.seoTitle,
    breadcrumb,
    image: pageOgImageUrl(product.seoTitle, product.title),
    bodyHtml: [
      `<p>${escapeHtml(product.metaDescription)}</p>`,
      bulletList(product.seoBullets),
      `<p>Bu sayfadaki form üzerinden plaka, kimlik veya konut bilgilerinizi ileterek ${escapeHtml(
        product.serviceType,
      )} için ücretsiz teklif talebi oluşturabilirsiniz.</p>`,
    ].join("\n"),
    jsonLd: pageGraph({
      path,
      name: product.seoTitle,
      description: product.metaDescription,
      breadcrumb,
      extra: [productServiceNode(product)],
    }),
  };
}

function renderComparisonHub(): RenderedPage {
  const page = getStaticPage(ROUTES.comparisonHub)!;
  return renderStaticPage(
    page,
    [comparisonListNode()],
    `<section><h2>Tüm karşılaştırmalar</h2>${linkList(
      comparisons.map((comparison) => ({
        name: comparison.shortTitle,
        path: ROUTES.comparison(comparison.slug),
        description: comparison.seoDescription,
      })),
    )}</section>`,
  );
}

function renderComparison(slug: string): RenderedPage | null {
  const comparison = getComparison(slug);
  if (!comparison) return null;

  const path = ROUTES.comparison(comparison.slug);
  const breadcrumb = [
    HOME_CRUMB,
    { name: "Karşılaştırma Merkezi", path: ROUTES.comparisonHub },
    { name: comparison.shortTitle },
  ];

  const rows = comparison.rows
    .map(
      (row) =>
        `<tr><th scope="row">${escapeHtml(row.label)}</th><td>${escapeHtml(
          row.left,
        )}</td><td>${escapeHtml(row.right)}</td></tr>`,
    )
    .join("\n");

  const table = `<table>
  <caption>${escapeHtml(comparison.shortTitle)} karşılaştırma tablosu</caption>
  <thead><tr><th scope="col">Kriter</th><th scope="col">${escapeHtml(
    comparison.left.name,
  )}</th><th scope="col">${escapeHtml(comparison.right.name)}</th></tr></thead>
  <tbody>${rows}</tbody>
</table>`;

  const prosCons = `<section><h2>Avantajlar ve dezavantajlar</h2>
  <h3>${escapeHtml(comparison.left.name)}</h3>
  ${bulletList(comparison.advantages.left)}
  ${bulletList(comparison.disadvantages.left)}
  <h3>${escapeHtml(comparison.right.name)}</h3>
  ${bulletList(comparison.advantages.right)}
  ${bulletList(comparison.disadvantages.right)}
</section>`;

  const verdict = `<section><h2>Kimler için uygun?</h2>
  <p><strong>${escapeHtml(comparison.left.name)}:</strong> ${escapeHtml(comparison.whoFor.left)}</p>
  <p><strong>${escapeHtml(comparison.right.name)}:</strong> ${escapeHtml(comparison.whoFor.right)}</p>
  <h2>Sonuç</h2>
  <p>${escapeHtml(comparison.verdict)}</p>
  <p>${escapeHtml(comparison.recommendationText)}</p>
</section>`;

  return {
    path,
    title: comparison.seoTitle,
    description: comparison.seoDescription,
    h1: comparison.heroTitle,
    breadcrumb,
    type: "article",
    image: pageOgImageUrl(comparison.shortTitle, "Karşılaştırma"),
    bodyHtml: [
      `<p>${escapeHtml(COMPARISON_CATEGORIES[comparison.category])}</p>`,
      paragraphs(comparison.heroIntro),
      table,
      prosCons,
      verdict,
      faqHtml(comparison.faqs.map((faq) => ({ question: faq.q, answer: faq.a }))),
    ].join("\n"),
    jsonLd: pageGraph({
      path,
      name: comparison.seoTitle,
      description: comparison.seoDescription,
      breadcrumb,
      extra: comparisonNodes(comparison),
    }),
  };
}

function renderGlossary(locale: ReturnType<typeof parsePath>["locale"]): RenderedPage {
  const copy = GLOSSARY[locale];
  const labels = localizedCategoryLabels(locale);
  const path = localizedPath(locale, "glossary");
  const termsHtml = localizedGlossaryTerms(locale)
    .map(
      (term) =>
        `<section id="${escapeHtml(term.slug)}"><h2>${escapeHtml(term.term)}</h2>` +
        `<p><em>${escapeHtml(labels[term.category])}</em></p>` +
        `<p>${escapeHtml(term.definition)}</p></section>`,
    )
    .join("\n");

  const page = getStaticPage(ROUTES.glossary)!;
  const localizedPage = {
    ...page,
    path,
    title: copy.seoTitle,
    description: copy.seoDescription,
    h1: MESSAGES[locale].footer.glossary,
    intro: [copy.lead],
    breadcrumb: [
      { name: MESSAGES[locale].quote.home, path: localizedPath(locale, "home") },
      { name: MESSAGES[locale].footer.glossary },
    ],
  };

  return renderStaticPage(localizedPage, [glossaryTermSetNode(locale, path)], termsHtml);
}

async function renderBlogIndex(): Promise<RenderedPage> {
  const page = getStaticPage(ROUTES.blog)!;
  const posts = await fetchPostCards();

  const list = posts.length
    ? linkList(
        posts.map((post) => ({
          name: post.title,
          path: ROUTES.blogPost(post.slug),
          description: post.excerpt ? truncate(post.excerpt, 180) : undefined,
        })),
      )
    : "";

  return renderStaticPage(
    page,
    posts.length ? [blogListNode(posts)] : [],
    list ? `<section><h2>Tüm yazılar (${posts.length})</h2>${list}</section>` : "",
  );
}

function renderNotFound(path: string): RenderedPage {
  return {
    path,
    title: "Sayfa bulunamadı",
    description: "Aradığınız sayfa taşınmış veya kaldırılmış olabilir.",
    h1: "Bu sayfayı bulamadık",
    breadcrumb: [HOME_CRUMB],
    image: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    robots: ROBOTS_NOINDEX,
    status: 404,
    bodyHtml:
      "<p>Aradığınız adres taşınmış, adı değişmiş veya hiç var olmamış olabilir.</p>",
    jsonLd: pageGraph({
      path,
      name: "Sayfa bulunamadı",
      description: "Aradığınız sayfa taşınmış veya kaldırılmış olabilir.",
    }),
  };
}

async function renderBlogPost(slug: string): Promise<RenderedPage | "error" | null> {
  const result = await fetchPostResult(slug);
  if (result.status === "error") return "error";
  if (result.status === "missing") return null;

  const post = result.post;
  const path = ROUTES.blogPost(post.slug);
  const description =
    post.meta_description ?? post.excerpt ?? createExcerpt(post.content, 155);
  const image = ogImageUrl(post.slug);
  const readingMinutes = calculateReadingTime(post.content);
  const tags = post.tags ?? [];
  const breadcrumb = [
    HOME_CRUMB,
    { name: "Blog", path: ROUTES.blog },
    { name: post.title },
  ];

  const meta = [
    post.category ? `<span>${escapeHtml(post.category)}</span>` : "",
    post.published_at
      ? `<time datetime="${escapeHtml(post.published_at)}">${escapeHtml(
          post.published_at.slice(0, 10),
        )}</time>`
      : "",
    post.author_name ? `<span>${escapeHtml(post.author_name)}</span>` : "",
    `<span>${readingMinutes} dk okuma</span>`,
  ]
    .filter(Boolean)
    .join(" · ");

  // İstemcideki içerik hattının aynısı: başlık tekrarını atar, tabloları
  // sarar, başlıklara id verir. Botun gördüğü gövde okuyucununkiyle eşleşir.
  const prepared = prepareBlogContent(post.content, post.title);

  return {
    path,
    title: post.meta_title ?? post.title,
    description,
    h1: post.title,
    breadcrumb,
    image,
    type: "article",
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
    section: post.category,
    tags,
    bodyHtml: [
      `<p class="meta">${meta}</p>`,
      post.excerpt ? `<p><strong>${escapeHtml(post.excerpt)}</strong></p>` : "",
      prepared.html,
    ]
      .filter(Boolean)
      .join("\n"),
    jsonLd: pageGraph({
      path,
      name: post.meta_title ?? post.title,
      description,
      datePublished: post.published_at,
      dateModified: post.updated_at,
      primaryImage: image,
      breadcrumb,
      extra: [
        articleSchema({
          path,
          headline: post.title,
          description,
          image,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          authorName: post.author_name,
          section: post.category,
          keywords: tags,
          readingMinutes,
        }),
      ],
    }),
  };
}

async function resolve(path: string): Promise<RenderedPage | "error"> {
  const parsed = parsePath(path);
  const locale = parsed.locale;
  const messages = MESSAGES[locale];

  if (parsed.page === "home") {
    const home = renderHome();
    return localizeRendered(home, locale, "home");
  }
  if (parsed.page === "comparisonHub") {
    return localizeRendered(renderComparisonHub(), locale, "comparisonHub");
  }
  if (parsed.page === "glossary") return renderGlossary(locale);
  if (parsed.page === "blog") {
    if (locale !== "tr") return renderNotFound(parsed.pathname);
    return localizeRendered(await renderBlogIndex(), locale, "blog");
  }

  if (parsed.page === "quote" && parsed.internalSlug) {
    const page = renderQuote(parsed.internalSlug);
    if (!page) return renderNotFound(parsed.pathname);
    const copy = localizedProduct(getProduct(parsed.internalSlug)!, locale);
    const localized = {
      ...page,
      path: localizedPath(locale, "quote", { slug: parsed.internalSlug }),
      title: copy.seoTitle,
      description: copy.metaDescription,
      h1: copy.seoTitle,
    };
    return localized;
  }

  if (parsed.page === "comparison" && parsed.slug) {
    const page = renderComparison(parsed.slug);
    return page
      ? { ...page, path: localizedPath(locale, "comparison", { slug: parsed.slug }) }
      : renderNotFound(parsed.pathname);
  }

  if (parsed.page === "blogPost" && parsed.slug) {
    if (locale !== "tr") return renderNotFound(parsed.pathname);
    const post = await renderBlogPost(parsed.slug);
    if (post === "error") return "error";
    return post
      ? { ...post, path: localizedPath(locale, "blogPost", { slug: parsed.slug }) }
      : renderNotFound(parsed.pathname);
  }

  const trPath =
    parsed.page !== "unknown"
      ? localizedPath("tr", parsed.page, { slug: parsed.slug })
      : parsed.pathname;
  const staticPage = getStaticPage(trPath);
  if (staticPage) {
    const rendered = renderStaticPage(staticPage);
    if (parsed.page === "about") {
      rendered.h1 = `${messages.about.h1Before}${messages.about.h1Words.join(" ")}${messages.about.h1After}`;
    }
    if (parsed.page === "contact") {
      rendered.h1 = messages.contact.h1;
    }
    if (parsed.page === "policyCancel") {
      rendered.h1 = messages.cancel.h1;
    }
    rendered.path = parsed.pathname;
    if (locale !== "tr" && ["kvkk", "privacy", "cookies", "kvkkApplication"].includes(parsed.page)) {
      rendered.bodyHtml = `<p><em>${escapeHtml(messages.legal.disclaimer)}</em></p>\n${rendered.bodyHtml}`;
    }
    return rendered;
  }

  return renderNotFound(parsed.pathname);
}

function localizeRendered(
  page: RenderedPage,
  locale: ReturnType<typeof parsePath>["locale"],
  key: PageKey,
): RenderedPage {
  const messages = MESSAGES[locale];
  const path = localizedPath(locale, key);
  if (key === "home") {
    return {
      ...page,
      path,
      h1: `${messages.hero.titleBefore} · ${messages.hero.compare} · ${messages.hero.staySafe}`,
      description: messages.hero.subtitle,
    };
  }
  return { ...page, path };
}

/* ── Belge ────────────────────────────────────────────────────────── */

/**
 * Satır içi kritik stil. Arama motorları bu sürümü mobil uyumluluk açısından
 * da değerlendirdiği için çıktı stilsiz bırakılmaz: okunur punto, taşmayan
 * tablo ve görseller, tek kolon düzen.
 */
const INLINE_CSS = `
:root{color-scheme:light}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;padding:24px 18px 64px;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#16233a;background:#fff}
header,main,footer{max-width:760px;margin:0 auto}
header{padding-bottom:16px;border-bottom:1px solid #e3edfd;margin-bottom:28px;font-size:14px}
header a{color:#1155d6}
nav[aria-label="Sayfa konumu"]{margin-top:8px;color:#6b7893}
h1{font-size:28px;line-height:1.25;letter-spacing:-.5px;margin:0 0 16px}
h2{font-size:21px;line-height:1.3;margin:32px 0 10px}
h3{font-size:17px;margin:24px 0 8px}
p{margin:0 0 14px}
ul{margin:0 0 16px;padding-left:22px}
li{margin-bottom:6px}
a{color:#1155d6}
img{max-width:100%;height:auto}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:14px}
caption{text-align:left;padding-bottom:8px;color:#6b7893}
th,td{border:1px solid #e3edfd;padding:8px 10px;text-align:left;vertical-align:top}
th{background:#f5f8fe}
.blog-table{overflow-x:auto}
.blog-content__anchor{display:none}
.meta{color:#6b7893;font-size:14px}
footer{margin-top:56px;padding-top:24px;border-top:1px solid #e3edfd;font-size:14px}
footer ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px 16px}
@media(min-width:720px){h1{font-size:34px}}
`.trim();

function hreflangLinks(path: string): string {
  const parsed = parsePath(path);
  if (parsed.page === "unknown") return "";
  const page = parsed.page;
  const slug = page === "quote" ? parsed.internalSlug : parsed.slug;
  const locales = isTrOnlyPage(page) ? (["tr"] as const) : LOCALES;
  const links = locales.map(
    (locale) =>
      `<link rel="alternate" hreflang="${locale}" href="${escapeHtml(absoluteUrl(localizedPath(locale, page, { slug })))}" />`,
  );
  links.push(
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl(localizedPath("tr", page, { slug })))}" />`,
  );
  return links.join("\n    ");
}

function renderDocument(page: RenderedPage): string {
  const parsed = parsePath(page.path);
  const meta = LOCALE_META[parsed.locale];
  const title = withBrand(page.title);
  const url = absoluteUrl(page.path);
  const articleMeta = [
    page.publishedTime
      ? `<meta property="article:published_time" content="${escapeHtml(page.publishedTime)}" />`
      : "",
    page.modifiedTime
      ? `<meta property="article:modified_time" content="${escapeHtml(page.modifiedTime)}" />`
      : "",
    page.section
      ? `<meta property="article:section" content="${escapeHtml(page.section)}" />`
      : "",
    ...(page.tags ?? []).map(
      (tag) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`,
    ),
  ]
    .filter(Boolean)
    .join("\n    ");

  return `<!doctype html>
<html lang="${meta.htmlLang}" dir="${meta.dir}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="${escapeHtml(page.robots ?? ROBOTS_INDEX)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    ${hreflangLinks(page.path)}
    <meta property="og:type" content="${page.type ?? "website"}" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:locale" content="${meta.ogLocale}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(page.image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(page.h1)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${escapeHtml(page.image)}" />
    ${articleMeta}
    <script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>
    <style>${INLINE_CSS}</style>
  </head>
  <body>
    <header>
      <a href="/">${escapeHtml(SITE_NAME)}</a>
      ${breadcrumbHtml(page.breadcrumb)}
    </header>
    <main>
      <article>
        <h1>${escapeHtml(page.h1)}</h1>
        ${page.bodyHtml}
      </article>
    </main>
    <footer>
      ${siteNavHtml()}
      <p>© ${new Date().getFullYear()} ${escapeHtml(SITE_NAME)}</p>
    </footer>
  </body>
</html>`;
}

export default async function handler(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const target = requestUrl.searchParams.get("path") ?? requestUrl.pathname;

  const page = await resolve(target);

  // Veri kaynağı geçici olarak erişilemezse 404 yerine 503 döneriz; aksi
  // hâlde bir arıza sırasında yayınlanmış yazılar dizinden düşebilir.
  if (page === "error") {
    return new Response("Service Unavailable", {
      status: 503,
      headers: { "retry-after": "120", "cache-control": "no-store" },
    });
  }

  const status = page.status ?? 200;

  return new Response(renderDocument(page), {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control":
        status === 200
          ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
          : "public, max-age=60, s-maxage=300",
      // Botlara sunulan sürüm ayrı önbelleklenir.
      vary: "User-Agent",
    },
  });
}
