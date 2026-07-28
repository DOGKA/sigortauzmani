import { CATEGORY_LABELS, glossaryTerms } from "../../../data/glossary";
import { getStaticPage } from "../pages";
import { ROUTES } from "../routes";
import { definedTermSetSchema, type JsonLd } from "../schema";

/** Sözlük sayfası: tüm terimler DefinedTermSet olarak. */
export function glossaryTermSetNode(): JsonLd {
  return definedTermSetSchema(
    glossaryTerms.map((term) => ({
      slug: term.slug,
      term: term.term,
      definition: term.definition,
      category: CATEGORY_LABELS[term.category],
    })),
    ROUTES.glossary,
    "Sigorta Sözlüğü",
    getStaticPage(ROUTES.glossary)?.description ?? "",
  );
}
