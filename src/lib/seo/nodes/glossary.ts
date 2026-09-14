import { LOCALE_META, type Locale } from "../../i18n/locales";
import {
  GLOSSARY,
  localizedCategoryLabels,
  localizedGlossaryTerms,
} from "../../i18n/glossary";
import { localizedPath } from "../../i18n/paths";
import { definedTermSetSchema, type JsonLd } from "../schema";

export function glossaryTermSetNode(
  locale: Locale = "tr",
  path = localizedPath(locale, "glossary"),
): JsonLd {
  const copy = GLOSSARY[locale];
  const labels = localizedCategoryLabels(locale);
  return definedTermSetSchema(
    localizedGlossaryTerms(locale).map((term) => ({
      slug: term.slug,
      term: term.term,
      definition: term.definition,
      category: labels[term.category],
    })),
    path,
    copy.seoTitle,
    copy.seoDescription,
    LOCALE_META[locale].htmlLang,
  );
}
