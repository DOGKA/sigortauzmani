/** Rota yolları tek yerde; canonical, breadcrumb ve sitemap üretimi buradan okur. */

export const ROUTES = {
  home: "/",
  quote: (slug: string) => `/teklif/${slug}`,
  riskMap: "/risk-haritasi",
  glossary: "/sigorta-sozlugu",
  comparisonHub: "/karsilastirma",
  comparison: (slug: string) => `/karsilastirma/${slug}`,
  policyCancel: "/police-iptal",
  about: "/hakkimizda",
  contact: "/iletisim",
  kvkk: "/kvkk",
  privacy: "/gizlilik-politikasi",
  cookies: "/cerez-politikasi",
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
} as const;
