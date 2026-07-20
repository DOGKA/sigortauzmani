import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CATEGORY_LABELS,
  comparisons,
  findComparisonBySides,
  getAllComparisonSides,
  getComparisonPartners,
  getPopularComparisons,
} from "../data/comparisons";
import "./ComparisonHubPage.css";

const PAGE_TITLE =
  "Sigorta Karşılaştırma Merkezi 2026 | Sigorta Uzmanı";
const PAGE_DESCRIPTION =
  "Trafik vs Kasko, TSS vs Özel Sağlık, DASK vs Konut ve daha fazlası. Sigorta ürünlerini teminat, fiyat ve kimler için uygunluk açısından karşılaştırın.";

export default function ComparisonHubPage() {
  const [left, setLeft] = useState("Trafik Sigortası");
  const [right, setRight] = useState("Kasko");
  const navigate = useNavigate();
  const sides = useMemo(() => getAllComparisonSides(), []);
  const rightOptions = useMemo(() => getComparisonPartners(left), [left]);
  const popular = useMemo(() => getPopularComparisons(), []);

  useEffect(() => {
    if (rightOptions.length === 0) return;
    if (!rightOptions.includes(right)) {
      setRight(rightOptions[0]);
    }
  }, [left, right, rightOptions]);

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

  const match = findComparisonBySides(left, right);

  const onCompare = () => {
    if (!match) return;
    navigate(`/karsilastirma/${match.slug}`);
  };

  const onLeftChange = (value: string) => {
    setLeft(value);
    const partners = getComparisonPartners(value);
    if (partners.length && !partners.includes(right)) {
      setRight(partners[0]);
    }
  };

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
            Hangi sigorta sizin için doğru? Teminatlar, fiyat mantığı ve kimler
            için uygun olduğunu yan yana görün; ardından teklif alın.
          </p>
        </header>

        <section className="cmp-hub__interactive" aria-labelledby="interactive-title">
          <div className="cmp-hub__section-head">
            <h2 id="interactive-title">Hızlı karşılaştır</h2>
            <p>İki ürün seçin, farkları anında açın.</p>
          </div>

          <div className="cmp-hub__picker">
            <label className="cmp-hub__select-wrap">
              <span className="cmp-hub__select-label">Ürün</span>
              <select
                value={left}
                onChange={(e) => onLeftChange(e.target.value)}
                aria-label="Sol ürün"
              >
                {sides.map((name) => (
                  <option key={`l-${name}`} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <span className="cmp-hub__vs" aria-hidden="true">
              VS
            </span>

            <label className="cmp-hub__select-wrap">
              <span className="cmp-hub__select-label">Ürün</span>
              <select
                value={rightOptions.includes(right) ? right : rightOptions[0] ?? ""}
                onChange={(e) => setRight(e.target.value)}
                aria-label="Sağ ürün"
              >
                {rightOptions.map((name) => (
                  <option key={`r-${name}`} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="cmp-hub__compare-btn"
              onClick={onCompare}
              disabled={!match}
            >
              Karşılaştır
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {match ? (
            <p className="cmp-hub__picker-hint">
              Hazır içerik: <strong>{match.shortTitle}</strong>
            </p>
          ) : (
            <p className="cmp-hub__picker-hint cmp-hub__picker-hint--muted">
              Bu ürün için henüz karşılaştırma yok.
            </p>
          )}
        </section>

        <section className="cmp-hub__popular" aria-labelledby="popular-title">
          <div className="cmp-hub__section-head">
            <h2 id="popular-title">En çok karşılaştırılanlar</h2>
            <p>Kullanıcıların en sık baktığı sigorta farkları.</p>
          </div>
          <ul className="cmp-hub__popular-grid">
            {popular.map((c) => (
              <li key={c.slug}>
                <Link to={`/karsilastirma/${c.slug}`} className="cmp-hub__popular-card">
                  <span className="cmp-hub__popular-meta">
                    {CATEGORY_LABELS[c.category]}
                    {c.badge && <em>{c.badge}</em>}
                  </span>
                  <strong>
                    {c.left.name} <span>vs</span> {c.right.name}
                  </strong>
                  <span className="cmp-hub__popular-summary">{c.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
