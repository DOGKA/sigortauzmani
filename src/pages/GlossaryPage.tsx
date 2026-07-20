import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORY_LABELS,
  type GlossaryCategory,
  type GlossaryTerm,
  getAlphabetLetters,
  getRelatedTerms,
  glossaryTerms,
  popularTerms,
  sortTermsAz,
} from "../data/glossary";
import "./GlossaryPage.css";

const PAGE_TITLE =
  "Sigorta Sözlüğü | Sigorta Terimleri ve Anlamları | Sigorta Uzmanı";
const PAGE_DESCRIPTION =
  "Muafiyet, İMM, pert, sovtaj, rayiç bedel, zeyilname ve daha fazlası. Sigorta terimlerini sade Türkçe açıklamalarla öğrenin. Sigorta Uzmanı sözlüğü.";

type CategoryFilter = "all" | GlossaryCategory;

function normalizeSearch(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildJsonLd(terms: GlossaryTerm[]) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Sigorta Sözlüğü",
    description: PAGE_DESCRIPTION,
    url: "https://sigortauzmani.com/sigorta-sozlugu",
    inLanguage: "tr",
    hasDefinedTerm: terms.map((term) => ({
      "@type": "DefinedTerm",
      name: term.term,
      description: term.definition,
      url: `https://sigortauzmani.com/sigorta-sozlugu#${term.slug}`,
      inDefinedTermSet: "https://sigortauzmani.com/sigorta-sozlugu",
    })),
  };
}

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;

    let meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta?.getAttribute("content") ?? "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", PAGE_DESCRIPTION);

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "glossary-jsonld";
    script.text = JSON.stringify(buildJsonLd(glossaryTerms));
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      meta?.setAttribute("content", prevDescription);
      document.getElementById("glossary-jsonld")?.remove();
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const exists = glossaryTerms.some((t) => t.slug === hash);
    if (!exists) return;
    setOpenSlug(hash);
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const sorted = useMemo(() => sortTermsAz(glossaryTerms), []);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim());
    return sorted.filter((term) => {
      if (category !== "all" && term.category !== category) return false;
      if (!q) return true;
      const haystack = normalizeSearch(
        `${term.term} ${term.shortDefinition} ${term.definition}`,
      );
      return haystack.includes(q);
    });
  }, [sorted, query, category]);

  const letters = useMemo(() => getAlphabetLetters(filtered), [filtered]);

  const categories = useMemo(
    () =>
      (Object.keys(CATEGORY_LABELS) as GlossaryCategory[]).map((key) => ({
        key,
        label: CATEGORY_LABELS[key],
        count: glossaryTerms.filter((t) => t.category === key).length,
      })),
    [],
  );

  return (
    <main className="glossary">
      <div className="glossary__bg" aria-hidden="true">
        <div className="glossary__blob glossary__blob--1" />
        <div className="glossary__blob glossary__blob--2" />
      </div>

      <div className="glossary__inner">
        <nav className="glossary__breadcrumb" aria-label="Sayfa konumu">
          <Link to="/">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <span className="glossary__breadcrumb-current">Sigorta Sözlüğü</span>
        </nav>

        <header className="glossary__hero">
          <span className="glossary__eyebrow">Bilgi merkezi</span>
          <h1>Sigorta Sözlüğü</h1>
          <p>
            Sigorta poliçelerinde geçen terimleri sade ve anlaşılır Türkçe ile
            açıklıyoruz. Teklif alırken veya hasar sürecinde karşınıza çıkan
            kavramları buradan hızlıca öğrenin.
          </p>
        </header>

        <section className="glossary__popular" aria-labelledby="popular-title">
          <div className="glossary__section-head">
            <h2 id="popular-title">Çok aranan kelimeler</h2>
            <p>Kullanıcıların en sık araştırdığı sigorta terimleri.</p>
          </div>
          <ul className="glossary__popular-grid">
            {popularTerms.map((term) => (
              <li key={term.slug}>
                <a
                  href={`#${term.slug}`}
                  className="glossary__popular-card"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenSlug(term.slug);
                    setQuery("");
                    setCategory("all");
                    window.history.replaceState(null, "", `#${term.slug}`);
                    document
                      .getElementById(term.slug)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <strong>{term.term}</strong>
                  <span>{term.shortDefinition}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="glossary__tools" aria-label="Sözlük filtreleri">
          <label className="glossary__search">
            <span className="visually-hidden">Terim ara</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Terim veya açıklama ara…"
              autoComplete="off"
            />
          </label>

          <div className="glossary__filters" role="tablist" aria-label="Kategori">
            <button
              type="button"
              role="tab"
              aria-selected={category === "all"}
              className={category === "all" ? "is-active" : ""}
              onClick={() => setCategory("all")}
            >
              Tümü
              <em>{glossaryTerms.length}</em>
            </button>
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
          </div>

          {letters.length > 0 && (
            <div className="glossary__alpha" aria-label="Harfe göre atla">
              {letters.map((letter) => (
                <a key={letter} href={`#letter-${letter}`}>
                  {letter}
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="glossary__list-wrap" aria-labelledby="list-title">
          <div className="glossary__section-head glossary__section-head--row">
            <h2 id="list-title">Tüm terimler</h2>
            <p>
              {filtered.length} sonuç
              {query.trim() ? ` · “${query.trim()}”` : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="glossary__empty">
              <p>Aramanızla eşleşen terim bulunamadı. Farklı bir kelime deneyin.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                Filtreleri temizle
              </button>
            </div>
          ) : (
            <div className="glossary__list">
              {letters.map((letter) => {
                const group = filtered.filter(
                  (t) => t.term.charAt(0).toLocaleUpperCase("tr-TR") === letter,
                );
                if (!group.length) return null;
                return (
                  <div key={letter} className="glossary__letter-group" id={`letter-${letter}`}>
                    <h3 className="glossary__letter">{letter}</h3>
                    <div className="glossary__items">
                      {group.map((term) => {
                        const isOpen = openSlug === term.slug;
                        const related = getRelatedTerms(term);
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
                                  {CATEGORY_LABELS[term.category]}
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
                                  <span>İlgili terimler:</span>
                                  {related.map((rel) => (
                                    <a
                                      key={rel.slug}
                                      href={`#${rel.slug}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setOpenSlug(rel.slug);
                                        setQuery("");
                                        setCategory("all");
                                        window.history.replaceState(null, "", `#${rel.slug}`);
                                        document
                                          .getElementById(rel.slug)
                                          ?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                          });
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
            <h2>Doğru teminatı seçmek ister misiniz?</h2>
            <p>
              Terimleri öğrendiniz. Şimdi ihtiyacınıza uygun poliçeyi şirketler
              arasında karşılaştırın.
            </p>
          </div>
          <Link to="/teklif/kasko" className="glossary__cta-btn">
            Teklif al
          </Link>
        </aside>
      </div>
    </main>
  );
}
