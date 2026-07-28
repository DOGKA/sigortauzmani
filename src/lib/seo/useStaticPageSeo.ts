import { pageOgImageUrl } from "./config";
import { getStaticPage } from "./pages";
import { pageGraph, type JsonLd } from "./schema";
import { useJsonLd } from "./useJsonLd";
import { useSeo } from "./useSeo";

export interface StaticPageSeoOptions {
  /** Sayfaya özel şema düğümleri (FAQPage, ItemList, DefinedTermSet ...). */
  extra?: (JsonLd | null | undefined | false)[];
  /** Paylaşım kartı; verilmezse başlıktan üretilir. */
  image?: string;
}

/**
 * `pages.ts` kaydındaki statik rotalar için meta etiketlerini ve şema
 * grafiğini tek çağrıda uygular.
 */
export function useStaticPageSeo(path: string, options?: StaticPageSeoOptions): void {
  const page = getStaticPage(path);
  const image = options?.image ?? (page ? pageOgImageUrl(page.h1) : undefined);

  useSeo(
    page
      ? {
          title: page.title,
          description: page.description,
          path: page.path,
          image,
        }
      : null,
  );

  useJsonLd(
    page
      ? pageGraph({
          path: page.path,
          name: page.title,
          description: page.description,
          type: page.schemaType,
          breadcrumb: page.breadcrumb,
          extra: options?.extra,
        })
      : null,
  );
}
