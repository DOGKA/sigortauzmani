/**
 * schema.org (JSON-LD) üreticileri.
 *
 * Tüm şemalar `@id` üzerinden birbirine bağlanır: her sayfadaki WebPage
 * düğümü siteyi (`#website`) ve kurumu (`#organization`) referans alır. Bu,
 * Google'ın varlık grafiğini (entity graph) doğru kurmasını sağlar ve
 * LLM'lerin sayfayı yayıncıya bağlamasını kolaylaştırır.
 *
 * Tarayıcı ve Edge ortamlarının ikisinden de import edilir; DOM API kullanmaz.
 */

import {
  CONTACT_COUNTRY,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  LOGO_PATH,
  SITE_DESCRIPTION,
  SITE_LANG,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./config";

export type JsonLd = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const KNOWS_ABOUT = [
  "Zorunlu trafik sigortası",
  "Kasko sigortası",
  "İhtiyari Mali Mesuliyet (İMM)",
  "Zorunlu Deprem Sigortası (DASK)",
  "Konut sigortası",
  "Tamamlayıcı sağlık sigortası",
  "Özel sağlık sigortası",
  "Seyahat sağlık sigortası",
  "Yeşil kart sigortası",
  "Poliçe iptal ve zeyilname süreçleri",
];

/**
 * Sigorta acentesi kurum düğümü. `InsuranceAgency`, LocalBusiness alt tipidir;
 * Google bunu hem kurum hem hizmet sağlayıcı olarak yorumlar.
 */
export function organizationSchema(): JsonLd {
  return {
    "@type": ["InsuranceAgency", "Organization"],
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: absoluteUrl(LOGO_PATH),
      contentUrl: absoluteUrl(LOGO_PATH),
      caption: SITE_NAME,
    },
    image: { "@id": `${SITE_URL}/#logo` },
    telephone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    priceRange: "₺₺",
    areaServed: {
      "@type": "Country",
      name: "Türkiye",
      identifier: CONTACT_COUNTRY,
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: CONTACT_COUNTRY,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: CONTACT_PHONE,
        email: CONTACT_EMAIL,
        contactType: "customer service",
        availableLanguage: ["Turkish", "tr"],
        areaServed: CONTACT_COUNTRY,
      },
    ],
    knowsAbout: KNOWS_ABOUT,
    slogan: "Doğru ürün. İyi fiyat. 7/24 hizmet.",
  };
}

/** Site düğümü + site içi arama eylemi (blog aramasına bağlanır). */
export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANG,
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Site köküne göreli yol. Son öğede verilmezse mevcut sayfa kabul edilir. */
  path?: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[], currentPath: string): JsonLd {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(currentPath)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path ?? currentPath),
    })),
  };
}

export interface WebPageInput {
  path: string;
  name: string;
  description: string;
  /** WebPage yerine CollectionPage / ContactPage / AboutPage vb. */
  type?: string;
  datePublished?: string | null;
  dateModified?: string | null;
  primaryImage?: string;
  hasBreadcrumb?: boolean;
  /** Sesli yanıt asistanlarının okuyabileceği bölümler. */
  speakableSelectors?: string[];
}

export function webPageSchema(input: WebPageInput): JsonLd {
  const url = absoluteUrl(input.path);
  const node: JsonLd = {
    "@type": input.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: SITE_LANG,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
  };

  if (input.hasBreadcrumb) node.breadcrumb = { "@id": `${url}#breadcrumb` };
  if (input.datePublished) node.datePublished = input.datePublished;
  if (input.dateModified) node.dateModified = input.dateModified;
  if (input.primaryImage) {
    node.primaryImageOfPage = { "@type": "ImageObject", url: input.primaryImage };
  }
  if (input.speakableSelectors?.length) {
    node.speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: input.speakableSelectors,
    };
  }

  return node;
}

export interface ArticleInput {
  path: string;
  headline: string;
  description: string;
  image?: string;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string | null;
  section?: string | null;
  keywords?: string[];
  wordCount?: number;
  /** Okuma süresi (dakika) — ISO 8601 süresine çevrilir. */
  readingMinutes?: number;
  articleBody?: string;
  type?: "BlogPosting" | "Article" | "NewsArticle";
}

export function articleSchema(input: ArticleInput): JsonLd {
  const url = absoluteUrl(input.path);
  const node: JsonLd = {
    "@type": input.type ?? "BlogPosting",
    "@id": `${url}#article`,
    isPartOf: { "@id": `${url}#webpage` },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    headline: input.headline.slice(0, 110),
    name: input.headline,
    description: input.description,
    url,
    inLanguage: SITE_LANG,
    author: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: input.authorName || SITE_NAME,
    },
    publisher: { "@id": ORGANIZATION_ID },
  };

  if (input.datePublished) node.datePublished = input.datePublished;
  node.dateModified = input.dateModified ?? input.datePublished ?? undefined;
  if (input.image) {
    node.image = {
      "@type": "ImageObject",
      url: input.image,
      width: 1200,
      height: 630,
    };
  }
  if (input.section) node.articleSection = input.section;
  if (input.keywords?.length) node.keywords = input.keywords.join(", ");
  if (input.wordCount) node.wordCount = input.wordCount;
  if (input.readingMinutes) node.timeRequired = `PT${input.readingMinutes}M`;
  if (input.articleBody) node.articleBody = input.articleBody;

  return node;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqSchema(entries: FaqEntry[], path: string): JsonLd {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    inLanguage: SITE_LANG,
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

export interface ServiceInput {
  path: string;
  name: string;
  description: string;
  /** Sigorta branşı — Google'ın hizmet sınıflandırması için. */
  serviceType: string;
}

export function serviceSchema(input: ServiceInput): JsonLd {
  const url = absoluteUrl(input.path);
  return {
    "@type": ["Service", "InsuranceAgency"],
    "@id": `${url}#service`,
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    url,
    provider: { "@id": ORGANIZATION_ID },
    areaServed: { "@type": "Country", name: "Türkiye" },
    audience: { "@type": "Audience", audienceType: "Türkiye'de ikamet edenler" },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: url,
      servicePhone: CONTACT_PHONE,
      availableLanguage: { "@type": "Language", name: "Turkish", alternateName: SITE_LANG },
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TRY",
      availability: "https://schema.org/InStock",
      description: "Teklif alma ve danışmanlık ücretsizdir.",
    },
  };
}

export interface ItemListEntry {
  name: string;
  path: string;
  description?: string;
}

export function itemListSchema(
  entries: ItemListEntry[],
  path: string,
  name: string,
): JsonLd {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(path)}#itemlist`,
    name,
    numberOfItems: entries.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: absoluteUrl(entry.path),
      ...(entry.description ? { description: entry.description } : {}),
    })),
  };
}

export interface DefinedTermInput {
  slug: string;
  term: string;
  definition: string;
  category?: string;
}

export function definedTermSetSchema(
  terms: DefinedTermInput[],
  path: string,
  name: string,
  description: string,
): JsonLd {
  const url = absoluteUrl(path);
  return {
    "@type": "DefinedTermSet",
    "@id": `${url}#termset`,
    name,
    description,
    url,
    inLanguage: SITE_LANG,
    publisher: { "@id": ORGANIZATION_ID },
    hasDefinedTerm: terms.map((term) => ({
      "@type": "DefinedTerm",
      "@id": `${url}#${term.slug}`,
      name: term.term,
      description: term.definition,
      url: `${url}#${term.slug}`,
      inDefinedTermSet: { "@id": `${url}#termset` },
      ...(term.category ? { termCode: term.category } : {}),
    })),
  };
}

/** Sayfa şemalarını tek bir `@graph` altında birleştirir. */
export function graph(...nodes: (JsonLd | null | undefined | false)[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean) as JsonLd[],
  };
}

export interface PageGraphInput extends WebPageInput {
  breadcrumb?: BreadcrumbItem[];
  /** Article, FAQPage, Service, ItemList gibi sayfaya özel düğümler. */
  extra?: (JsonLd | null | undefined | false)[];
}

/**
 * Her sayfada bulunması gereken düğümleri (kurum, site, sayfa, breadcrumb)
 * sayfaya özel düğümlerle birlikte tek grafikte döndürür.
 */
export function pageGraph(input: PageGraphInput): JsonLd {
  const { breadcrumb, extra, ...webPage } = input;
  const hasBreadcrumb = Boolean(breadcrumb?.length);

  return graph(
    organizationSchema(),
    websiteSchema(),
    webPageSchema({ ...webPage, hasBreadcrumb }),
    hasBreadcrumb && breadcrumbSchema(breadcrumb as BreadcrumbItem[], input.path),
    ...(extra ?? []),
  );
}
