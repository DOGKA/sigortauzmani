/**
 * Sayfa başına <head> yönetimi.
 *
 * Tüm SEO etiketleri `data-seo` işaretini taşır ve her uygulamada topluca
 * yenilenir. Böylece bir önceki rotadan artık etiket (örneğin makale
 * tarihleri) kalmaz ve <head> her zaman tek bir rotanın durumunu yansıtır.
 * index.html'deki varsayılanlar da aynı işareti taşıdığı için ilk render'da
 * çoğaltma yerine değiştirme olur.
 */

import { useEffect } from "react";
import {
  DEFAULT_OG_IMAGE_PATH,
  ROBOTS_INDEX,
  SITE_LOCALE,
  SITE_NAME,
  absoluteUrl,
  withBrand,
} from "./config";

export interface SeoInput {
  /** Marka soneki otomatik eklenir; başlık zaten markayı içeriyorsa eklenmez. */
  title: string;
  description: string;
  /** Site köküne göreli canonical yol. Sorgu parametreleri hariç tutulmalıdır. */
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  robots?: string;
  keywords?: string[];
  publishedTime?: string | null;
  modifiedTime?: string | null;
  section?: string | null;
  tags?: string[];
}

type TagSpec =
  | { kind: "meta"; attr: "name" | "property"; key: string; content: string }
  | { kind: "link"; rel: string; href: string };

const MANAGED = "data-seo";

function buildTags(input: SeoInput): TagSpec[] {
  const title = withBrand(input.title);
  const url = absoluteUrl(input.path);
  const image = input.image ?? absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  const type = input.type ?? "website";

  const tags: TagSpec[] = [
    { kind: "meta", attr: "name", key: "description", content: input.description },
    { kind: "meta", attr: "name", key: "robots", content: input.robots ?? ROBOTS_INDEX },
    { kind: "link", rel: "canonical", href: url },
    { kind: "meta", attr: "property", key: "og:type", content: type },
    { kind: "meta", attr: "property", key: "og:site_name", content: SITE_NAME },
    { kind: "meta", attr: "property", key: "og:locale", content: SITE_LOCALE },
    { kind: "meta", attr: "property", key: "og:title", content: title },
    { kind: "meta", attr: "property", key: "og:description", content: input.description },
    { kind: "meta", attr: "property", key: "og:url", content: url },
    { kind: "meta", attr: "property", key: "og:image", content: image },
    { kind: "meta", attr: "property", key: "og:image:width", content: "1200" },
    { kind: "meta", attr: "property", key: "og:image:height", content: "630" },
    {
      kind: "meta",
      attr: "property",
      key: "og:image:alt",
      content: input.imageAlt ?? title,
    },
    { kind: "meta", attr: "name", key: "twitter:card", content: "summary_large_image" },
    { kind: "meta", attr: "name", key: "twitter:title", content: title },
    { kind: "meta", attr: "name", key: "twitter:description", content: input.description },
    { kind: "meta", attr: "name", key: "twitter:image", content: image },
    {
      kind: "meta",
      attr: "name",
      key: "twitter:image:alt",
      content: input.imageAlt ?? title,
    },
  ];

  if (input.keywords?.length) {
    tags.push({
      kind: "meta",
      attr: "name",
      key: "keywords",
      content: input.keywords.join(", "),
    });
  }

  if (input.publishedTime) {
    tags.push({
      kind: "meta",
      attr: "property",
      key: "article:published_time",
      content: input.publishedTime,
    });
  }
  if (input.modifiedTime) {
    tags.push({
      kind: "meta",
      attr: "property",
      key: "article:modified_time",
      content: input.modifiedTime,
    });
  }
  if (input.section) {
    tags.push({
      kind: "meta",
      attr: "property",
      key: "article:section",
      content: input.section,
    });
  }
  input.tags?.forEach((tag) => {
    tags.push({ kind: "meta", attr: "property", key: "article:tag", content: tag });
  });

  return tags;
}

/** Etiketleri DOM'a yazar. React dışından da (test, ölçüm) çağrılabilir. */
export function applySeo(input: SeoInput): void {
  if (typeof document === "undefined") return;

  document.title = withBrand(input.title);

  document.head.querySelectorAll(`[${MANAGED}]`).forEach((node) => node.remove());

  const fragment = document.createDocumentFragment();
  for (const spec of buildTags(input)) {
    if (spec.kind === "meta") {
      const element = document.createElement("meta");
      element.setAttribute(spec.attr, spec.key);
      element.setAttribute("content", spec.content);
      element.setAttribute(MANAGED, "");
      fragment.appendChild(element);
    } else {
      const element = document.createElement("link");
      element.setAttribute("rel", spec.rel);
      element.setAttribute("href", spec.href);
      element.setAttribute(MANAGED, "");
      fragment.appendChild(element);
    }
  }
  document.head.appendChild(fragment);
}

/**
 * Sayfa meta etiketlerini uygular. Veri henüz yüklenmediyse `null` geçilebilir;
 * bu durumda <head> dokunulmadan bırakılır.
 */
export function useSeo(input: SeoInput | null): void {
  const serialized = input ? JSON.stringify(input) : null;

  useEffect(() => {
    if (!serialized) return;
    applySeo(JSON.parse(serialized) as SeoInput);
  }, [serialized]);
}
