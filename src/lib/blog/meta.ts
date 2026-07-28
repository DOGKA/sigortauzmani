/**
 * Sayfa başlığı, açıklaması ve paylaşım (Open Graph / Twitter) etiketlerini
 * çalışma anında yönetir. Dönen fonksiyon önceki değerleri geri yükler.
 */

export interface DocumentMeta {
  title: string;
  description: string;
  /** Mutlak URL; paylaşımda ve canonical etiketinde kullanılır. */
  url?: string;
  /** Mutlak görsel URL'i — /api/og çıktısı. */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
}

type Restore = () => void;

function upsertMeta(attribute: "name" | "property", key: string, value: string): Restore {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    const previous = existing.getAttribute("content") ?? "";
    existing.setAttribute("content", value);
    return () => existing.setAttribute("content", previous);
  }

  const element = document.createElement("meta");
  element.setAttribute(attribute, key);
  element.setAttribute("content", value);
  document.head.appendChild(element);
  return () => element.remove();
}

function upsertCanonical(url: string): Restore {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (existing) {
    const previous = existing.getAttribute("href") ?? "";
    existing.setAttribute("href", url);
    return () => existing.setAttribute("href", previous);
  }

  const element = document.createElement("link");
  element.rel = "canonical";
  element.href = url;
  document.head.appendChild(element);
  return () => element.remove();
}

export function applyDocumentMeta(meta: DocumentMeta): Restore {
  const previousTitle = document.title;
  document.title = meta.title;

  const restores: Restore[] = [
    upsertMeta("name", "description", meta.description),
    upsertMeta("property", "og:title", meta.title),
    upsertMeta("property", "og:description", meta.description),
    upsertMeta("property", "og:type", meta.type ?? "website"),
    upsertMeta("property", "og:site_name", "Sigorta Uzmanı"),
    upsertMeta("name", "twitter:card", "summary_large_image"),
    upsertMeta("name", "twitter:title", meta.title),
    upsertMeta("name", "twitter:description", meta.description),
  ];

  if (meta.url) {
    restores.push(upsertMeta("property", "og:url", meta.url), upsertCanonical(meta.url));
  }

  if (meta.image) {
    restores.push(
      upsertMeta("property", "og:image", meta.image),
      upsertMeta("property", "og:image:width", "1200"),
      upsertMeta("property", "og:image:height", "630"),
      upsertMeta("name", "twitter:image", meta.image),
    );
  }

  if (meta.publishedTime) {
    restores.push(upsertMeta("property", "article:published_time", meta.publishedTime));
  }
  if (meta.modifiedTime) {
    restores.push(upsertMeta("property", "article:modified_time", meta.modifiedTime));
  }

  return () => {
    document.title = previousTitle;
    restores.forEach((restore) => restore());
  };
}

/** Paylaşım kartı görselinin adresi. */
export function blogOgImageUrl(slug: string): string {
  return `${window.location.origin}/api/og?slug=${encodeURIComponent(slug)}`;
}
