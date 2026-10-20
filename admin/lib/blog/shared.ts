export const BLOG_CATEGORIES = [
  "Araç Sigortaları",
  "Sağlık Sigortaları",
  "Konut ve DASK",
  "Seyahat Sigortaları",
  "Sigorta Rehberi",
] as const;

export const BLOG_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export const BLOG_STATUS_LABEL: Record<BlogStatus, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşiv",
};

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  status: BlogStatus;
  featured_image: string | null;
  view_count: number;
  published_at: string | null;
  updated_at: string | null;
}

export interface BlogPost extends BlogListItem {
  content: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[];
}

export type BlogPostInput = Pick<
  BlogPost,
  | "slug"
  | "title"
  | "category"
  | "status"
  | "featured_image"
  | "content"
  | "excerpt"
  | "meta_title"
  | "meta_description"
>;

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

export function slugify(text: string): string {
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 90)
    .replace(/-+$/, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Sitenin kökü. Canlıda panel kendi alan adından konuştuğu için
 * `NEXT_PUBLIC_SITE_URL` gerekir; yerelde `/sb` kapısı sitenin adresinde.
 */
export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

/** Kapak yolları siteye göre görelidir; panelde önizleme için tam adrese çevrilir. */
export function siteAsset(src: string | null | undefined): string | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  return `${siteOrigin()}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** Listede küçük sürüm yeter. */
export function coverThumb(src: string | null | undefined): string | null {
  const url = siteAsset(src);
  return url ? url.replace(/-1600\.webp$/, "-800.webp") : null;
}

export function sitePostUrl(slug: string): string {
  return `${siteOrigin()}/blog/${slug}`;
}
