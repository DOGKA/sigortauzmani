import { comparisons, type Comparison } from "../../../data/comparisons";
import { ROUTES } from "../routes";
import { articleSchema, faqSchema, itemListSchema, type JsonLd } from "../schema";

/** Karşılaştırma merkezi: tüm karşılaştırmaların sıralı listesi. */
export function comparisonListNode(): JsonLd {
  return itemListSchema(
    comparisons.map((comparison) => ({
      name: comparison.shortTitle,
      path: ROUTES.comparison(comparison.slug),
      description: comparison.seoDescription,
    })),
    ROUTES.comparisonHub,
    "Sigorta karşılaştırmaları",
  );
}

/**
 * Karşılaştırma detayı: makale + sayfada görünen soru-cevaplardan FAQPage.
 * FAQ'lar sayfada gerçekten render edildiği için şema kurallarına uygundur.
 */
export function comparisonNodes(comparison: Comparison): JsonLd[] {
  const path = ROUTES.comparison(comparison.slug);
  return [
    articleSchema({
      type: "Article",
      path,
      headline: comparison.heroTitle,
      description: comparison.seoDescription,
      section: "Sigorta Karşılaştırma",
      keywords: [comparison.left.name, comparison.right.name],
    }),
    faqSchema(
      comparison.faqs.map((faq) => ({ question: faq.q, answer: faq.a })),
      path,
    ),
  ];
}
