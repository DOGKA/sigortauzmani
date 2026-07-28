import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ComparisonCategory,
  comparisons,
} from "../data/comparisons";
import ComparisonDuelCard from "../components/ComparisonDuelCard";
import { comparisonListNode } from "../lib/seo/nodes/comparison";
import { ROUTES } from "../lib/seo/routes";
import { useStaticPageSeo } from "../lib/seo/useStaticPageSeo";
import "./ComparisonHubPage.css";

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

  useStaticPageSeo(ROUTES.comparisonHub, { extra: [comparisonListNode()] });

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
