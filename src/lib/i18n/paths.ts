import { products } from "../../data/products";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "./locales";

export const PAGE_KEYS = [
  "home",
  "about",
  "contact",
  "policyCancel",
  "quote",
  "kvkk",
  "privacy",
  "cookies",
  "kvkkApplication",
  "blog",
  "blogPost",
  "glossary",
  "comparisonHub",
  "comparison",
  "riskMap",
] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

export const TRANSLATED_PAGES = [
  "home",
  "about",
  "contact",
  "policyCancel",
  "quote",
  "kvkk",
  "privacy",
  "cookies",
  "kvkkApplication",
] as const satisfies readonly PageKey[];

export const TURKISH_CONTENT_PAGES = [
  "blog",
  "blogPost",
  "glossary",
  "comparisonHub",
  "comparison",
  "riskMap",
] as const satisfies readonly PageKey[];

/** Blog yalnızca Türkçe sitede yayınlanır; diğer dillere rota ve bağlantı açılmaz. */
export const TR_ONLY_PAGES = ["blog", "blogPost"] as const satisfies readonly PageKey[];

export function isTrOnlyPage(page: PageKey | "unknown"): boolean {
  return page === "blog" || page === "blogPost";
}

const MATCH_ORDER: PageKey[] = [
  "blogPost",
  "comparison",
  "quote",
  "kvkkApplication",
  "kvkk",
  "privacy",
  "cookies",
  "about",
  "contact",
  "policyCancel",
  "blog",
  "glossary",
  "comparisonHub",
  "riskMap",
  "home",
];

/** Locale öneki olmadan, her dildeki görünen yol şablonu. */
export const PAGE_TEMPLATES: Record<Locale, Record<PageKey, string>> = {
  tr: {
    home: "/",
    about: "/hakkimizda",
    contact: "/iletisim",
    policyCancel: "/police-iptal",
    quote: "/teklif/:slug",
    kvkk: "/kvkk",
    privacy: "/gizlilik-politikasi",
    cookies: "/cerez-politikasi",
    kvkkApplication: "/kvkk-basvuru",
    blog: "/blog",
    blogPost: "/blog/:slug",
    glossary: "/sigorta-sozlugu",
    comparisonHub: "/karsilastirma",
    comparison: "/karsilastirma/:slug",
    riskMap: "/risk-haritasi",
  },
  en: {
    home: "/",
    about: "/about",
    contact: "/contact",
    policyCancel: "/policy-cancel",
    quote: "/quote/:slug",
    kvkk: "/kvkk",
    privacy: "/privacy-policy",
    cookies: "/cookie-policy",
    kvkkApplication: "/kvkk-application",
    blog: "/blog",
    blogPost: "/blog/:slug",
    glossary: "/sigorta-sozlugu",
    comparisonHub: "/karsilastirma",
    comparison: "/karsilastirma/:slug",
    riskMap: "/risk-haritasi",
  },
  ar: {
    home: "/",
    about: "/hawlana",
    contact: "/ittisal",
    policyCancel: "/ilgha-al-wathiqa",
    quote: "/ard/:slug",
    kvkk: "/kvkk",
    privacy: "/siyasat-alkhususiyya",
    cookies: "/siyasat-alkuka",
    kvkkApplication: "/talab-kvkk",
    blog: "/blog",
    blogPost: "/blog/:slug",
    glossary: "/sigorta-sozlugu",
    comparisonHub: "/karsilastirma",
    comparison: "/karsilastirma/:slug",
    riskMap: "/risk-haritasi",
  },
  fa: {
    home: "/",
    about: "/darbare-ma",
    contact: "/tamas",
    policyCancel: "/laghv-bime",
    quote: "/pishnahad/:slug",
    kvkk: "/kvkk",
    privacy: "/siasat-horimati",
    cookies: "/siasat-kuki",
    kvkkApplication: "/darkhast-kvkk",
    blog: "/blog",
    blogPost: "/blog/:slug",
    glossary: "/sigorta-sozlugu",
    comparisonHub: "/karsilastirma",
    comparison: "/karsilastirma/:slug",
    riskMap: "/risk-haritasi",
  },
};

const PRODUCT_SLUGS = [
  "trafik-sigortasi",
  "kasko",
  "kisa-sureli-trafik",
  "tamamlayici-saglik",
  "seyahat-saglik",
  "imm",
  "ozel-saglik",
  "dask",
  "yesil-kart",
  "konut",
] as const;

export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

/** Görünen yabancı ürün slug'ı → sabit Türkçe ürün slug'ı. */
export const PRODUCT_VISIBLE_SLUGS: Record<
  Locale,
  Record<ProductSlug, string>
> = {
  tr: {
    "trafik-sigortasi": "trafik-sigortasi",
    kasko: "kasko",
    "kisa-sureli-trafik": "kisa-sureli-trafik",
    "tamamlayici-saglik": "tamamlayici-saglik",
    "seyahat-saglik": "seyahat-saglik",
    imm: "imm",
    "ozel-saglik": "ozel-saglik",
    dask: "dask",
    "yesil-kart": "yesil-kart",
    konut: "konut",
  },
  en: {
    "trafik-sigortasi": "traffic-insurance",
    kasko: "casco",
    "kisa-sureli-trafik": "short-term-traffic",
    "tamamlayici-saglik": "complementary-health",
    "seyahat-saglik": "travel-health",
    imm: "excess-liability",
    "ozel-saglik": "private-health",
    dask: "earthquake-insurance",
    "yesil-kart": "green-card",
    konut: "home-insurance",
  },
  ar: {
    "trafik-sigortasi": "tamin-murur",
    kasko: "kasko",
    "kisa-sureli-trafik": "tamin-murur-qasir",
    "tamamlayici-saglik": "tamin-sihhi-takmili",
    "seyahat-saglik": "tamin-sihhi-safar",
    imm: "tamin-masuliyya",
    "ozel-saglik": "tamin-sihhi-khas",
    dask: "tamin-zalzal",
    "yesil-kart": "al-bitaqa-al-khadra",
    konut: "tamin-manzil",
  },
  fa: {
    "trafik-sigortasi": "bime-trafik",
    kasko: "kasko",
    "kisa-sureli-trafik": "bime-trafik-kutah",
    "tamamlayici-saglik": "bime-salamat-takmili",
    "seyahat-saglik": "bime-mosaferat",
    imm: "bime-masuliyat",
    "ozel-saglik": "bime-salamat-khosusi",
    dask: "bime-zelzele",
    "yesil-kart": "kart-sabz",
    konut: "bime-maskan",
  },
};

const VISIBLE_TO_INTERNAL: Record<Locale, Record<string, ProductSlug>> = {
  tr: invert(PRODUCT_VISIBLE_SLUGS.tr),
  en: invert(PRODUCT_VISIBLE_SLUGS.en),
  ar: invert(PRODUCT_VISIBLE_SLUGS.ar),
  fa: invert(PRODUCT_VISIBLE_SLUGS.fa),
};

function invert(
  map: Record<ProductSlug, string>,
): Record<string, ProductSlug> {
  return Object.fromEntries(
    (Object.entries(map) as [ProductSlug, string][]).map(([internal, visible]) => [
      visible,
      internal,
    ]),
  ) as Record<string, ProductSlug>;
}

export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

export function isProductSlug(value: string): value is ProductSlug {
  return (PRODUCT_SLUGS as readonly string[]).includes(value);
}

export function toVisibleProductSlug(locale: Locale, internal: string): string {
  if (!isProductSlug(internal)) return internal;
  return PRODUCT_VISIBLE_SLUGS[locale][internal];
}

export function toInternalProductSlug(
  locale: Locale,
  visible: string,
): ProductSlug | undefined {
  const mapped = VISIBLE_TO_INTERNAL[locale][visible];
  if (mapped) return mapped;
  if (isProductSlug(visible) && products.some((product) => product.slug === visible)) {
    return visible;
  }
  return undefined;
}

export function resolveProductSlug(
  locale: Locale,
  visible: string | undefined,
): string | undefined {
  if (!visible) return undefined;
  return toInternalProductSlug(locale, visible);
}

function joinPath(prefix: string, template: string): string {
  if (!template || template === "/") return prefix || "/";
  return `${prefix}${template}`;
}

export function localizedPath(
  locale: Locale,
  page: PageKey,
  params?: { slug?: string },
): string {
  const template = PAGE_TEMPLATES[locale][page];
  const prefix = localePrefix(locale);
  if (!template.includes(":slug")) return joinPath(prefix, template);

  const rawSlug = params?.slug ?? "";
  const visible =
    page === "quote" && rawSlug && !rawSlug.startsWith(":")
      ? toVisibleProductSlug(locale, rawSlug)
      : rawSlug;
  return joinPath(prefix, template.replace(":slug", visible));
}

function matchTemplate(
  rest: string,
  template: string,
): { slug?: string } | null {
  if (!template.includes(":slug")) {
    return rest === template ? {} : null;
  }
  const [head, tail] = template.split(":slug");
  if (!rest.startsWith(head)) return null;
  const remainder = rest.slice(head.length);
  if (tail) {
    if (!remainder.endsWith(tail)) return null;
    const slug = remainder.slice(0, remainder.length - tail.length);
    if (!slug || slug.includes("/")) return null;
    return { slug };
  }
  if (!remainder || remainder.includes("/")) return null;
  return { slug: remainder };
}

export interface ParsedPath {
  locale: Locale;
  page: PageKey | "unknown";
  slug?: string;
  internalSlug?: string;
  pathname: string;
}

export function parsePath(pathname: string): ParsedPath {
  const clean = pathname.replace(/\/+$/, "") || "/";
  let locale: Locale = DEFAULT_LOCALE;
  let rest = clean;

  const prefixed = /^\/(en|ar|fa)(\/.*)?$/.exec(clean);
  if (prefixed && isLocale(prefixed[1])) {
    locale = prefixed[1];
    rest = prefixed[2] ? prefixed[2].replace(/\/+$/, "") || "/" : "/";
  }

  for (const page of MATCH_ORDER) {
    const matched = matchTemplate(rest, PAGE_TEMPLATES[locale][page]);
    if (!matched) continue;
    const internalSlug =
      page === "quote" && matched.slug
        ? toInternalProductSlug(locale, matched.slug)
        : matched.slug;
    return {
      locale,
      page,
      slug: matched.slug,
      internalSlug,
      pathname: clean,
    };
  }

  return { locale, page: "unknown", pathname: clean };
}

export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const parsed = parsePath(pathname);
  if (parsed.page === "unknown") {
    const prefix = localePrefix(nextLocale);
    return prefix || "/";
  }
  if (isTrOnlyPage(parsed.page) && nextLocale !== "tr") {
    return localizedPath(nextLocale, "home");
  }
  return localizedPath(nextLocale, parsed.page, {
    slug: parsed.page === "quote" ? parsed.internalSlug : parsed.slug,
  });
}

export const MAINTENANCE_ALLOWED_PAGES = new Set<PageKey | "unknown">([
  "contact",
  "kvkk",
  "privacy",
  "cookies",
  "kvkkApplication",
]);

export const LEGAL_PAGE_KEYS = [
  "kvkk",
  "privacy",
  "cookies",
  "kvkkApplication",
] as const satisfies readonly PageKey[];

export type LegalPageKey = (typeof LEGAL_PAGE_KEYS)[number];

export function isLegalPage(page: PageKey | "unknown"): page is LegalPageKey {
  return (LEGAL_PAGE_KEYS as readonly string[]).includes(page);
}

export { LOCALES };
