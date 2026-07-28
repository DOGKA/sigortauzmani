import { ROUTES } from "../routes";
import { itemListSchema, type JsonLd } from "../schema";

export interface BlogListEntry {
  slug: string;
  title: string;
  excerpt?: string | null;
}

/** Blog dizini: yazıların sıralı listesi. */
export function blogListNode(entries: BlogListEntry[]): JsonLd {
  return itemListSchema(
    entries.map((entry) => ({
      name: entry.title,
      path: ROUTES.blogPost(entry.slug),
      description: entry.excerpt ?? undefined,
    })),
    ROUTES.blog,
    "Sigorta Uzmanı blog yazıları",
  );
}
