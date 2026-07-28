import type { Product } from "../../../data/products";
import { ROUTES } from "../routes";
import { serviceSchema, type JsonLd } from "../schema";

/** Teklif sayfası: sigorta branşını Service + Offer olarak tanımlar. */
export function productServiceNode(product: Product): JsonLd {
  return serviceSchema({
    path: ROUTES.quote(product.slug),
    name: product.title,
    description: product.metaDescription,
    serviceType: product.serviceType,
  });
}
