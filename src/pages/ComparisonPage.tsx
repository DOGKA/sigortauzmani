import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  CATEGORY_LABELS,
  type Comparison,
  comparisons,
  findComparisonBySides,
  getAllComparisonSides,
  getComparison,
  getComparisonPartners,
} from "../data/comparisons";
import "./ComparisonPage.css";

function usePageMeta(comparison: Comparison | undefined) {
  useEffect(() => {
    if (!comparison) return;
    const prevTitle = document.title;
    document.title = `${comparison.seoTitle} | Sigorta Uzmanı`;

    let meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta?.getAttribute("content") ?? "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", comparison.seoDescription);

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "comparison-jsonld";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: comparison.shortTitle,
      description: comparison.seoDescription,
      url: `https://sigortauzmani.com/karsilastirma/${comparison.slug}`,
      inLanguage: "tr",
      about: [comparison.left.name, comparison.right.name],
      mainEntity: {
        "@type": "FAQPage",
        mainEntity: comparison.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    });
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      meta?.setAttribute("content", prevDescription);
      document.getElementById("comparison-jsonld")?.remove();
    };
  }, [comparison]);
}

function TssCalculator({
  examFeeHint,
  visitsBreakEvenHint,
}: {
  examFeeHint: number;
  visitsBreakEvenHint: number;
}) {
  const [annualPremium, setAnnualPremium] = useState(examFeeHint * visitsBreakEvenHint);
  const [examFee, setExamFee] = useState(examFeeHint);
  const visits = examFee > 0 ? annualPremium / examFee : 0;
  const sampleVisits = [2, 4, 6, 8, 12];

  return (
    <section className="cmp__calc" aria-labelledby="calc-title">
      <div className="cmp__section-head">
        <h2 id="calc-title">Ne zaman kâra geçersiniz?</h2>
        <p>
          Yıllık TSS primi ile özel muayene fark ücretinizi girin; yaklaşık
          kaç ziyarette dengeye geldiğinizi görün.
        </p>
      </div>

      <div className="cmp__calc-grid">
        <label>
          <span>Yıllık TSS primi (₺)</span>
          <input
            type="number"
            min={0}
            step={100}
            value={annualPremium}
            onChange={(e) => setAnnualPremium(Number(e.target.value) || 0)}
          />
        </label>
        <label>
          <span>Ortalama özel muayene farkı (₺)</span>
          <input
            type="number"
            min={0}
            step={50}
            value={examFee}
            onChange={(e) => setExamFee(Number(e.target.value) || 0)}
          />
        </label>
      </div>

      <div className="cmp__calc-result">
        <p>
          Yaklaşık <strong>{visits.toFixed(1)}</strong> özel muayene / yılda
          priminizi amorti edersiniz.
        </p>
        <p className="cmp__calc-note">
          Bu hesap yalnızca ayakta muayene farkını baz alır. Ameliyat ve yatarak
          tedavi riski TSS’nin asıl değeridir.
        </p>
      </div>

      <div className="cmp__calc-table-wrap">
        <table className="cmp__calc-table">
          <thead>
            <tr>
              <th>Yıllık ziyaret</th>
              <th>Cebinden ödeme</th>
              <th>TSS ile (prim)</th>
              <th>Fark</th>
            </tr>
          </thead>
          <tbody>
            {sampleVisits.map((v) => {
              const outOfPocket = v * examFee;
              const diff = outOfPocket - annualPremium;
              return (
                <tr key={v}>
                  <td>{v} kez</td>
                  <td>{outOfPocket.toLocaleString("tr-TR")} ₺</td>
                  <td>{annualPremium.toLocaleString("tr-TR")} ₺</td>
                  <td className={diff > 0 ? "is-gain" : diff < 0 ? "is-loss" : ""}>
                    {diff > 0 ? "+" : ""}
                    {diff.toLocaleString("tr-TR")} ₺
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function ComparisonPage() {
  const { slug } = useParams<{ slug: string }>();
  const comparison = slug ? getComparison(slug) : undefined;
  const navigate = useNavigate();
  const sides = useMemo(() => getAllComparisonSides(), []);
  const [leftPick, setLeftPick] = useState(comparison?.left.name ?? "");
  const [rightPick, setRightPick] = useState(comparison?.right.name ?? "");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const rightOptions = useMemo(
    () => getComparisonPartners(leftPick),
    [leftPick],
  );

  usePageMeta(comparison);

  useEffect(() => {
    if (!comparison) return;
    setLeftPick(comparison.left.name);
    setRightPick(comparison.right.name);
    setOpenFaq(0);
  }, [comparison]);

  useEffect(() => {
    if (rightOptions.length === 0) return;
    if (!rightOptions.includes(rightPick)) {
      setRightPick(rightOptions[0]);
    }
  }, [leftPick, rightPick, rightOptions]);

  if (!comparison) {
    return <Navigate to="/karsilastirma" replace />;
  }

  const related = (comparison.relatedSlugs ?? [])
    .map((s) => getComparison(s))
    .filter(Boolean) as Comparison[];

  const ctaSlug =
    comparison.ctaSlug ||
    comparison.left.productSlug ||
    comparison.right.productSlug ||
    "kasko";

  const interactiveMatch = findComparisonBySides(leftPick, rightPick);

  const onLeftChange = (value: string) => {
    setLeftPick(value);
    const partners = getComparisonPartners(value);
    if (partners.length && !partners.includes(rightPick)) {
      setRightPick(partners[0]);
    }
  };

  const onInteractiveCompare = () => {
    if (!interactiveMatch) return;
    if (interactiveMatch.slug === comparison.slug) {
      document
        .getElementById("table-title")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate(`/karsilastirma/${interactiveMatch.slug}`);
  };

  return (
    <main className="cmp">
      <div className="cmp__bg" aria-hidden="true">
        <div className="cmp__blob cmp__blob--1" />
        <div className="cmp__blob cmp__blob--2" />
      </div>

      <div className="cmp__inner">
        <nav className="cmp__breadcrumb" aria-label="Sayfa konumu">
          <Link to="/">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <Link to="/karsilastirma">Karşılaştırma Merkezi</Link>
          <span aria-hidden="true">/</span>
          <span className="cmp__breadcrumb-current">{comparison.shortTitle}</span>
        </nav>

        <header className="cmp__hero">
          <span className="cmp__eyebrow">
            {CATEGORY_LABELS[comparison.category]}
          </span>
          <h1>
            {comparison.left.name}{" "}
            <span className="cmp__hero-vs">vs</span> {comparison.right.name}
          </h1>
          <p>{comparison.summary}</p>
        </header>

        <section className="cmp__switcher" aria-label="Karşılaştırmayı değiştir">
          <div className="cmp__switcher-row">
            <label className="cmp__select-wrap">
              <span>Karşılaştır</span>
              <select
                value={leftPick}
                onChange={(e) => onLeftChange(e.target.value)}
              >
                {sides.map((name) => (
                  <option key={`l-${name}`} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <span className="cmp__vs-badge" aria-hidden="true">
              VS
            </span>
            <label className="cmp__select-wrap">
              <span className="cmp__select-spacer" aria-hidden="true">
                &nbsp;
              </span>
              <select
                value={
                  rightOptions.includes(rightPick)
                    ? rightPick
                    : rightOptions[0] ?? ""
                }
                onChange={(e) => setRightPick(e.target.value)}
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
              className="cmp__switcher-btn"
              onClick={onInteractiveCompare}
              disabled={!interactiveMatch}
            >
              Göster
            </button>
          </div>
        </section>

        {comparison.sameThingNote && (
          <aside className="cmp__same" role="note">
            <strong>Önemli:</strong> {comparison.sameThingNote}
          </aside>
        )}

        <section className="cmp__table-section" aria-labelledby="table-title">
          <div className="cmp__section-head">
            <h2 id="table-title">Teminatlar</h2>
            <p>Yan yana temel farklar.</p>
          </div>
          <div className="cmp__table-wrap">
            <table className="cmp__table">
              <thead>
                <tr>
                  <th scope="col">Özellik</th>
                  <th scope="col">{comparison.left.name}</th>
                  <th scope="col">{comparison.right.name}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.left}</td>
                    <td>{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="cmp__proscons" aria-labelledby="pros-title">
          <div className="cmp__section-head">
            <h2 id="pros-title">Avantajlar & dezavantajlar</h2>
          </div>
          <div className="cmp__proscons-grid">
            <div className="cmp__col">
              <h3>{comparison.left.name}</h3>
              <p className="cmp__col-label">Avantajlar</p>
              <ul>
                {comparison.advantages.left.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="cmp__col-label cmp__col-label--con">Dezavantajlar</p>
              <ul className="cmp__cons">
                {comparison.disadvantages.left.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="cmp__col">
              <h3>{comparison.right.name}</h3>
              <p className="cmp__col-label">Avantajlar</p>
              <ul>
                {comparison.advantages.right.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="cmp__col-label cmp__col-label--con">Dezavantajlar</p>
              <ul className="cmp__cons">
                {comparison.disadvantages.right.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="cmp__who" aria-labelledby="who-title">
          <div className="cmp__section-head">
            <h2 id="who-title">Kimler için?</h2>
          </div>
          <div className="cmp__who-grid">
            <div>
              <h3>{comparison.left.name}</h3>
              <p>{comparison.whoFor.left}</p>
            </div>
            <div>
              <h3>{comparison.right.name}</h3>
              <p>{comparison.whoFor.right}</p>
            </div>
          </div>
        </section>

        {comparison.calculator && (
          <TssCalculator
            examFeeHint={comparison.calculator.examFeeHint}
            visitsBreakEvenHint={comparison.calculator.visitsBreakEvenHint}
          />
        )}

        <section className="cmp__verdict" aria-labelledby="verdict-title">
          <div className="cmp__verdict-card">
            <div className="cmp__verdict-stars" aria-hidden="true">
              ★★★★★
            </div>
            <h2 id="verdict-title">Tavsiyemiz</h2>
            <p className="cmp__verdict-text">{comparison.verdict}</p>
            <p className="cmp__verdict-rec">{comparison.recommendationText}</p>
            <Link to={`/teklif/${ctaSlug}`} className="cmp__cta">
              Teklif Al
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </section>

        <section className="cmp__faq" aria-labelledby="faq-title">
          <div className="cmp__section-head">
            <h2 id="faq-title">Sık sorulan sorular</h2>
          </div>
          <div className="cmp__faq-list">
            {comparison.faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className={`cmp__faq-item ${open ? "is-open" : ""}`}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : index)}
                  >
                    {faq.q}
                    <span aria-hidden="true">{open ? "−" : "+"}</span>
                  </button>
                  {open && <p>{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {related.length > 0 && (
          <section className="cmp__related" aria-labelledby="related-title">
            <div className="cmp__section-head">
              <h2 id="related-title">İlgili karşılaştırmalar</h2>
            </div>
            <ul className="cmp__related-list">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link to={`/karsilastirma/${item.slug}`}>
                    {item.left.name} <span>vs</span> {item.right.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="cmp__back">
          <Link to="/karsilastirma">← Tüm karşılaştırmalara dön</Link>
          {" · "}
          <span>
            {comparisons.length} içerik · Karşılaştırma Merkezi
          </span>
        </p>
      </div>
    </main>
  );
}
