import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  type GlossaryCategory,
  getAlphabetLetters,
  getRelatedTerms,
  glossaryTerms,
  sortTermsAz,
} from "../data/glossary";
import { useLocale, useT } from "../lib/i18n/context";
import { interpolate, localeTag } from "../lib/i18n/format";
import {
  localizedCategoryLabels,
  localizedGlossaryTerms,
  localizedPopularTerms,
} from "../lib/i18n/glossary";
import { pageOgImageUrl } from "../lib/seo/config";
import { glossaryTermSetNode } from "../lib/seo/nodes/glossary";
import { pageGraph } from "../lib/seo/schema";
import { useJsonLd } from "../lib/seo/useJsonLd";
import { useSeo } from "../lib/seo/useSeo";
import "./GlossaryPage.css";

type CategoryFilter = "all" | GlossaryCategory;

function normalizeSearch(value: string, tag: string): string {
  return value
    .toLocaleLowerCase(tag)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function GlossaryPage() {
  const { locale, href, quoteHref } = useLocale();
  const t = useT();
  const g = t.glossaryPage;
  const tag = localeTag(locale);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("genel");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const terms = useMemo(() => localizedGlossaryTerms(locale), [locale]);
  const popular = useMemo(() => localizedPopularTerms(locale), [locale]);
  const categoryLabels = useMemo(() => localizedCategoryLabels(locale), [locale]);
  const path = href("glossary");

  useSeo({
    title: g.seoTitle,
    description: g.seoDescription,
    path,
    image: pageOgImageUrl(g.seoTitle, t.footer.glossary),
  });

  useJsonLd(
    pageGraph({
      path,
      name: g.seoTitle,
      description: g.seoDescription,
      type: "CollectionPage",
      breadcrumb: [{ name: t.quote.home, path: href("home") }, { name: t.footer.glossary }],
      extra: [glossaryTermSetNode(locale, path)],
    }),
  );

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const exists = terms.some((term) => term.slug === hash);
    if (!exists) return;
    setOpenSlug(hash);
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [terms]);

  const sorted = useMemo(() => sortTermsAz(terms, tag), [terms, tag]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim(), tag);
    return sorted.filter((term) => {
      if (category !== "all" && term.category !== category) return false;
      if (!q) return true;
      const original = glossaryTerms.find((item) => item.slug === term.slug);
      const haystack = normalizeSearch(
        `${term.term} ${term.shortDefinition} ${term.definition} ${original?.term ?? ""} ${term.slug}`,
        tag,
      );
      return haystack.includes(q);
    });
  }, [sorted, query, category, tag]);

  const letters = useMemo(() => getAlphabetLetters(sorted, tag), [sorted, tag]);
  const availableLetters = useMemo(
    () => getAlphabetLetters(filtered, tag),
    [filtered, tag],
  );

  const categories = useMemo(
    () =>
      (Object.keys(categoryLabels) as GlossaryCategory[]).map((key) => ({
        key,
        label: categoryLabels[key],
        count: terms.filter((term) => term.category === key).length,
      })),
    [categoryLabels, terms],
  );

  const openTerm = (slug: string) => {
    setOpenSlug(slug);
    setQuery("");
    setCategory("all");
    window.history.replaceState(null, "", `#${slug}`);
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="glossary">
      <div className="glossary__bg" aria-hidden="true">
        <div className="glossary__blob glossary__blob--1" />
        <div className="glossary__blob glossary__blob--2" />
      </div>

      <div className="glossary__inner">
        <nav className="glossary__breadcrumb" aria-label={g.breadcrumbAria}>
          <Link to={href("home")}>{t.quote.home}</Link>
          <span aria-hidden="true">/</span>
          <span className="glossary__breadcrumb-current">{t.footer.glossary}</span>
        </nav>

        <header className="glossary__hero">
          <span className="glossary__eyebrow">{g.eyebrow}</span>
          <h1>{t.footer.glossary}</h1>
          <p>{g.lead}</p>
        </header>

        <section className="glossary__popular" aria-labelledby="popular-title">
          <div className="glossary__section-head">
            <h2 id="popular-title">{g.popularTitle}</h2>
            <p>{g.popularLead}</p>
          </div>
          <ul className="glossary__popular-grid">
            {popular.map((term) => (
              <li key={term.slug}>
                <a
                  href={`#${term.slug}`}
                  className="glossary__popular-card"
                  onClick={(e) => {
                    e.preventDefault();
                    openTerm(term.slug);
                  }}
                >
                  <strong>{term.term}</strong>
                  <span>{term.shortDefinition}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="glossary__tools" aria-label={g.toolsAria}>
          <label className="glossary__search">
            <span className="visually-hidden">{g.searchAria}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={g.searchPlaceholder}
              autoComplete="off"
            />
          </label>

          <div className="glossary__filters" role="tablist" aria-label={g.categoryAria}>
            <span className="glossary__filters-pin">
              <button
                type="button"
                role="tab"
                aria-selected={category === "all"}
                className={category === "all" ? "is-active" : ""}
                onClick={() => setCategory("all")}
              >
                {g.all}
                <em>{terms.length}</em>
              </button>
            </span>
            <span className="glossary__filters-scroll">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={category === cat.key}
                  className={category === cat.key ? "is-active" : ""}
                  onClick={() => setCategory(cat.key)}
                >
                  {cat.label}
                  <em>{cat.count}</em>
                </button>
              ))}
            </span>
          </div>

          {letters.length > 0 && (
            <div className="glossary__alpha" aria-label={g.skipByLetter}>
              {letters.map((letter) =>
                availableLetters.includes(letter) ? (
                  <a key={letter} href={`#letter-${letter}`}>
                    {letter}
                  </a>
                ) : (
                  <span key={letter} className="is-disabled" aria-disabled="true">
                    {letter}
                  </span>
                ),
              )}
            </div>
          )}
        </section>

        <section className="glossary__list-wrap" aria-labelledby="list-title">
          <div className="glossary__section-head glossary__section-head--row">
            <h2 id="list-title">{g.allTerms}</h2>
            <p>
              {interpolate(g.results, { n: filtered.length })}
              {query.trim() ? ` · “${query.trim()}”` : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="glossary__empty">
              <p>{g.empty}</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                {g.clearFilters}
              </button>
            </div>
          ) : (
            <div className="glossary__list">
              {availableLetters.map((letter) => {
                const group = filtered.filter(
                  (term) => term.term.charAt(0).toLocaleUpperCase(tag) === letter,
                );
                if (!group.length) return null;
                return (
                  <div key={letter} className="glossary__letter-group" id={`letter-${letter}`}>
                    <h3 className="glossary__letter">{letter}</h3>
                    <div className="glossary__items">
                      {group.map((term) => {
                        const isOpen = openSlug === term.slug;
                        const related = getRelatedTerms(term, terms);
                        return (
                          <article
                            key={term.slug}
                            id={term.slug}
                            className={`glossary__item ${isOpen ? "glossary__item--open" : ""}`}
                          >
                            <button
                              type="button"
                              className="glossary__item-toggle"
                              aria-expanded={isOpen}
                              onClick={() => {
                                const next = isOpen ? null : term.slug;
                                setOpenSlug(next);
                                window.history.replaceState(
                                  null,
                                  "",
                                  next ? `#${term.slug}` : window.location.pathname,
                                );
                              }}
                            >
                              <span className="glossary__item-main">
                                <span className="glossary__item-term">{term.term}</span>
                                <span className="glossary__item-cat">
                                  {categoryLabels[term.category]}
                                </span>
                                <span className="glossary__item-short">
                                  {term.shortDefinition}
                                </span>
                              </span>
                              <span className="glossary__item-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M6 9l6 6 6-6"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </button>
                            <div className="glossary__item-body">
                              <p>{term.definition}</p>
                              {related.length > 0 && (
                                <div className="glossary__related">
                                  <span>{g.related}</span>
                                  {related.map((rel) => (
                                    <a
                                      key={rel.slug}
                                      href={`#${rel.slug}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        openTerm(rel.slug);
                                      }}
                                    >
                                      {rel.term}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="glossary__cta">
          <div>
            <h2>{g.ctaTitle}</h2>
            <p>{g.ctaLead}</p>
          </div>
          <Link to={quoteHref("kasko")} className="glossary__cta-btn">
            {g.cta}
          </Link>
        </aside>
      </div>
    </main>
  );
}
