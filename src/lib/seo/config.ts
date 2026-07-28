/**
 * Site kimliğinin tek kaynağı. Hem tarayıcı tarafı (React sayfaları) hem de
 * Edge tarafı (api/prerender, api/share, scripts/*) buradan okur; bu yüzden
 * `import.meta.env` gibi ortama bağlı API'ler kullanılmaz.
 */

/** Canonical origin. Preview dağıtımları da bu adresi canonical gösterir. */
export const SITE_URL = "https://sigortauzmani.net";

export const SITE_NAME = "Sigorta Uzmanı";
export const SITE_LEGAL_NAME = "Sigorta Uzmanı Sigorta Aracılık Hizmetleri";
export const SITE_LOCALE = "tr_TR";
export const SITE_LANG = "tr";

export const SITE_TAGLINE = "Doğru sigorta. Uygun fiyat. Hızlı destek.";

export const SITE_DESCRIPTION =
  "30'a yakın sigorta şirketinin trafik, kasko, İMM, DASK, konut ve sağlık sigortası tekliflerini karşılaştırın. Ücretsiz danışmanlık, hızlı teklif, poliçe sonrası destek.";

export const CONTACT_PHONE = "+908503020032";
export const CONTACT_PHONE_DISPLAY = "0850 302 00 32";
export const CONTACT_EMAIL = "sigorta@sigortauzmani.net";
export const CONTACT_COUNTRY = "TR";

export const LOGO_PATH = "/sigortauzmani-logo.svg";
export const DEFAULT_OG_IMAGE_PATH = "/og-default.png";

/** Başlık soneki; ana sayfa dışındaki tüm sayfalarda kullanılır. */
export const TITLE_SUFFIX = ` | ${SITE_NAME}`;

/** Başlığın kendisi markayı zaten içeriyorsa soneki tekrar eklemeyiz. */
export function withBrand(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title}${TITLE_SUFFIX}`;
}

/** Göreli yolu canonical origin ile mutlak URL'e çevirir. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Blog paylaşım kartı (1200×630 PNG) adresi. */
export function ogImageUrl(slug?: string): string {
  if (!slug) return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  return absoluteUrl(`/api/og?slug=${encodeURIComponent(slug)}`);
}

/**
 * Google'ın snippet/görsel kısıtlarını gevşeten yönerge. Varsayılan
 * `max-snippet` kısıtı AI Overviews ve zengin sonuçlarda içeriği kırpıyor.
 */
export const ROBOTS_INDEX =
  "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
export const ROBOTS_NOINDEX = "noindex, follow";
