import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ComparisonCategory,
  comparisons,
} from "../data/comparisons";
import ComparisonDuelCard from "../components/ComparisonDuelCard";
import "./ComparisonHubPage.css";

const PAGE_TITLE =
  "Sigorta Karşılaştırma Merkezi 2026 | Sigorta Uzmanı";
const PAGE_DESCRIPTION =
  "Trafik vs Kasko, TSS vs Özel Sağlık, DASK vs Konut ve daha fazlası. Sigorta ürünlerini teminat, fiyat ve kimler için uygunluk açısından karşılaştırın.";

type CategoryFilter = ComparisonCategory | "all";

export default function ComparisonHubPage() {
  const [category, setCategory] = useState<CategoryFilter>("arac");

  const visible = useMemo(() => {
    const list =
      category === "all"
        ? comparisons
        : comparisons.filter((c) => c.category === category);
    // Popüler içerikler önce, kalanlar veri sırasında
    return [...list].sort(
      (a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)),
    );
  }, [category]);

  const counts = useMemo(() => {
    const map = new Map<ComparisonCategory, number>();
    for (const c of comparisons) {
      map.set(c.category, (map.get(c.category) ?? 0) + 1);
    }
    return map;
  }, []);

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
    script.id = "comparison-hub-jsonld";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Sigorta Karşılaştırma Merkezi",
      description: PAGE_DESCRIPTION,
      url: "https://sigortauzmani.com/karsilastirma",
      inLanguage: "tr",
      hasPart: comparisons.map((c) => ({
        "@type": "WebPage",
        name: c.shortTitle,
        url: `https://sigortauzmani.com/karsilastirma/${c.slug}`,
        description: c.seoDescription,
      })),
    });
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      meta?.setAttribute("content", prevDescription);
      document.getElementById("comparison-hub-jsonld")?.remove();
    };
  }, []);

  return (
    <main className="cmp-hub">
      <div className="cmp-hub__bg" aria-hidden="true">
        <div className="cmp-hub__blob cmp-hub__blob--1" />
        <div className="cmp-hub__blob cmp-hub__blob--2" />
      </div>

      <div className="cmp-hub__inner">
        <nav className="cmp-hub__breadcrumb" aria-label="Sayfa konumu">
          <Link to="/">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <span className="cmp-hub__breadcrumb-current">Karşılaştırma Merkezi</span>
        </nav>

        <header className="cmp-hub__hero">
          <span className="cmp-hub__eyebrow">Bilgi merkezi</span>
          <h1>Sigorta Karşılaştırma Merkezi</h1>
          <p>
            Hangi sigorta sizin için doğru? Kategori seçin, merak ettiğiniz
            karşılaştırmayı açın; teminatları yan yana görüp teklif alın.
          </p>
        </header>

        <section className="cmp-hub__catalog" aria-labelledby="catalog-title">
          <h2 id="catalog-title" className="cmp-hub__sr-only">
            Karşılaştırmalar
          </h2>

          <div
            className="cmp-hub__chips"
            role="tablist"
            aria-label="Kategori filtresi"
          >
            <span className="cmp-hub__chips-pin">
              <button
                type="button"
                role="tab"
                aria-selected={category === "all"}
                className={`cmp-hub__chip ${category === "all" ? "is-active" : ""}`}
                onClick={() => setCategory("all")}
              >
                Tümü
                <span className="cmp-hub__chip-count">{comparisons.length}</span>
              </button>
            </span>
            <span className="cmp-hub__chips-scroll">
              {CATEGORY_ORDER.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={category === cat}
                  className={`cmp-hub__chip ${category === cat ? "is-active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                  <span className="cmp-hub__chip-count">
                    {counts.get(cat) ?? 0}
                  </span>
                </button>
              ))}
            </span>
          </div>

          <ul className="cmp-hub__duel-grid">
            {visible.map((c) => (
              <li key={c.slug}>
                <ComparisonDuelCard comparison={c} showCategory={category === "all"} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
