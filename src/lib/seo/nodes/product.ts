import type { Product } from "../../../data/products";
import { ROUTES } from "../routes";
import { serviceSchema, type JsonLd } from "../schema";

/** Teklif sayfası: sigorta branşını Service + Offer olarak tanımlar. */
export function productServiceNode(product: Product, path = ROUTES.quote(product.slug)): JsonLd {
  return serviceSchema({
    path,
    name: product.title,
    description: product.metaDescription,
    serviceType: product.serviceType,
  });
}
