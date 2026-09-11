import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { type Comparison, comparisons, getComparison } from "../data/comparisons";
import ComparisonDuelCard from "../components/ComparisonDuelCard";
import { localizedComparison } from "../lib/i18n/comparison-copy";
import { useLocale, useT } from "../lib/i18n/context";
import { interpolate, localeTag } from "../lib/i18n/format";
import { pageOgImageUrl } from "../lib/seo/config";
import { comparisonNodes } from "../lib/seo/nodes/comparison";
import { pageGraph } from "../lib/seo/schema";
import { useJsonLd } from "../lib/seo/useJsonLd";
import { useSeo } from "../lib/seo/useSeo";
import "./ComparisonPage.css";

function usePageMeta(comparison: Comparison | undefined, path: string, ogType: string) {
  useSeo(
    comparison
      ? {
          title: comparison.seoTitle,
          description: comparison.seoDescription,
          path,
          type: "article",
          image: pageOgImageUrl(comparison.shortTitle, ogType),
        }
      : null,
  );

  useJsonLd(
    comparison
      ? pageGraph({
          path,
          name: comparison.seoTitle,
          description: comparison.seoDescription,
          breadcrumb: [
            { name: comparison.shortTitle },
          ],
          extra: comparisonNodes(comparison),
        })
      : null,
  );
}

/** Salt görsel katman: hücre metnini değiştirmeden ton (✓ / ✕ / ~) belirler. */
type CellTone = "yes" | "no" | "partial" | "neutral";

function classifyCell(text: string): CellTone {
  const t = text.toLocaleLowerCase("tr-TR").trim();
  if (
    /^(hayır|yok|kapsam dışı|no\b|not covered|لا|خارج التغطية|خیر|ندارد|خارج از پوشش)/.test(t)
  ) {
    return "no";
  }
  if (/^(evet|var|zorunlu|yes|compulsory|نعم|إلزامي|بله|اجباری)/.test(t)) return "yes";
  if (
    /(pakete göre|ek teminat|ek hizmet|ek paket|eklenebilir|sunulabilir|genelde dahil|sınırlı|isteğe bağlı|alınabilir|deprem kaynaklı|depending on pack|usually included|extra cover|may be offered|اختياري|باقة|معمولاً|بسته به)/.test(
      t,
    )
  ) {
    return "partial";
  }
  return "neutral";
}

function CellBadge({ tone }: { tone: CellTone }) {
  if (tone === "neutral") return null;
  const symbol = tone === "yes" ? "✓" : tone === "no" ? "✕" : "~";
  return (
    <span className={`cmp__cell-badge cmp__cell-badge--${tone}`} aria-hidden="true">
      {symbol}
    </span>
  );
}

function ComparisonCell({ text }: { text: string }) {
  const tone = classifyCell(text);
  return (
    <span className={`cmp__cell cmp__cell--${tone}`}>
      <CellBadge tone={tone} />
      <span>{text}</span>
    </span>
  );
}

function TssCalculator({
  examFeeHint,
  visitsBreakEvenHint,
}: {
  examFeeHint: number;
  visitsBreakEvenHint: number;
}) {
  const t = useT();
  const { locale } = useLocale();
  const numberLocale = localeTag(locale);
  const [premiumInput, setPremiumInput] = useState(
    String(examFeeHint * visitsBreakEvenHint),
  );
  const [feeInput, setFeeInput] = useState(String(examFeeHint));
  const annualPremium = Math.max(0, Number(premiumInput) || 0);
  const examFee = Math.max(0, Number(feeInput) || 0);
  const visits = examFee > 0 ? annualPremium / examFee : 0;
  const visitsLabel = (Math.round(visits * 10) / 10).toLocaleString(numberLocale);
  const sampleVisits = [2, 4, 6, 8, 12];
  const money = (n: number) => `${n.toLocaleString(numberLocale)} ₺`;

  return (
    <section className="cmp__calc" aria-labelledby="calc-title">
      <div className="cmp__section-head">
        <h2 id="calc-title">{t.compare.calcTitle}</h2>
        <p>{t.compare.calcLead}</p>
      </div>

      <div className="cmp__calc-grid">
        <label>
          <span>{t.compare.calcPremium}</span>
          <input
            type="number"
            min={0}
            step={100}
            value={premiumInput}
            onChange={(e) => setPremiumInput(e.target.value)}
          />
        </label>
        <label>
          <span>{t.compare.calcFee}</span>
          <input
            type="number"
            min={0}
            step={50}
            value={feeInput}
            onChange={(e) => setFeeInput(e.target.value)}
          />
        </label>
      </div>

      <div className="cmp__calc-result">
        {annualPremium <= 0 || examFee <= 0 ? (
          <p>{t.compare.calcNeedValues}</p>
        ) : visits < 1 ? (
          <p>{t.compare.calcFirstVisit}</p>
        ) : (
          <p>{interpolate(t.compare.calcAmortize, { n: visitsLabel })}</p>
        )}
        <p className="cmp__calc-note">{t.compare.calcNote}</p>
      </div>

      <div className="cmp__calc-table-wrap">
        <table className="cmp__calc-table">
          <thead>
            <tr>
              <th>{t.compare.calcVisits}</th>
              <th>{t.compare.calcOutOfPocket}</th>
              <th>{t.compare.calcWithTss}</th>
              <th>{t.compare.calcDiff}</th>
            </tr>
          </thead>
          <tbody>
            {sampleVisits.map((v) => {
              const outOfPocket = v * examFee;
              const diff = outOfPocket - annualPremium;
              return (
                <tr key={v}>
                  <td>{interpolate(t.compare.calcTimes, { n: v })}</td>
                  <td>{money(outOfPocket)}</td>
                  <td>{money(annualPremium)}</td>
                  <td className={diff > 0 ? "is-gain" : diff < 0 ? "is-loss" : ""}>
                    {diff > 0 ? "+" : ""}
                    {money(diff)}
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
  const { locale, href, quoteHref } = useLocale();
  const t = useT();
  const raw = slug ? getComparison(slug) : undefined;
  const comparison = raw ? localizedComparison(raw, locale) : undefined;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const relatedTrackRef = useRef<HTMLUListElement>(null);
  const path = comparison ? href("comparison", { slug: comparison.slug }) : "";

  usePageMeta(comparison, path, t.compare.ogType);

  useEffect(() => {
    if (!comparison) return;
    setOpenFaq(0);
  }, [comparison]);

  if (!comparison) {
    return <Navigate to={href("comparisonHub")} replace />;
  }

  // Aynı kategorideki diğer karşılaştırmalar carousel'de gösterilir.
  const related = comparisons.filter(
    (c) => c.category === comparison.category && c.slug !== comparison.slug,
  );

  const scrollRelated = (dir: 1 | -1) => {
    const track = relatedTrackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" });
  };

  // Teklif Al her zaman karşılaştırmanın 1. ürününe gider; slug yoksa zincir sağa düşer.
  const ctaSide = comparison.left.productSlug
    ? comparison.left
    : comparison.right.productSlug
      ? comparison.right
      : undefined;
  const ctaSlug =
    ctaSide?.productSlug || comparison.ctaSlug || "kasko";

  return (
    <main className="cmp">
      <div className="cmp__bg" aria-hidden="true">
        <div className="cmp__blob cmp__blob--1" />
        <div className="cmp__blob cmp__blob--2" />
      </div>

      <div className="cmp__inner">
        <nav className="cmp__breadcrumb" aria-label={t.quote.breadcrumb}>
          <Link to={href("home")}>{t.quote.home}</Link>
          <span aria-hidden="true">/</span>
          <Link to={href("comparisonHub")}>{t.footer.comparison}</Link>
          <span aria-hidden="true">/</span>
          <span className="cmp__breadcrumb-current">{comparison.shortTitle}</span>
        </nav>

        <header className="cmp__hero">
          <span className="cmp__eyebrow">
            {t.compare.categories[comparison.category]}
          </span>

          <h1 className="cmp__hero-title">{comparison.heroTitle}</h1>

          <div className="cmp__hero-intro">
            {comparison.heroIntro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        {comparison.sameThingNote && (
          <aside className="cmp__same" role="note">
            <strong>{t.compare.important}:</strong> {comparison.sameThingNote}
          </aside>
        )}

        <section className="cmp__table-section" aria-labelledby="table-title">
          <div className="cmp__section-head">
            <h2 id="table-title">{t.compare.covers}</h2>
            <p>{t.compare.coversLead}</p>
            <span className="cmp__table-mobile-hint" aria-hidden="true">
              {t.compare.swipeHint}
            </span>
          </div>
          <div className="cmp__table-wrap">
            <table className="cmp__table">
              <thead>
                <tr>
                  <th scope="col">{t.compare.feature}</th>
                  <th scope="col">{comparison.left.name}</th>
                  <th scope="col">{comparison.right.name}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>
                      <ComparisonCell text={row.left} />
                    </td>
                    <td>
                      <ComparisonCell text={row.right} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="cmp__proscons" aria-labelledby="pros-title">
          <div className="cmp__section-head">
            <h2 id="pros-title">{t.compare.proscons}</h2>
          </div>
          <div className="cmp__proscons-grid">
            {(
              [
                {
                  key: "left",
                  name: comparison.left.name,
                  pros: comparison.advantages.left,
                  cons: comparison.disadvantages.left,
                },
                {
                  key: "right",
                  name: comparison.right.name,
                  pros: comparison.advantages.right,
                  cons: comparison.disadvantages.right,
                },
              ] as const
            ).map((side) => (
              <div className="cmp__col" key={side.key}>
                <h3>{side.name}</h3>
                <ul className="cmp__pros-list">
                  {side.pros.map((item) => (
                    <li key={item}>
                      <span className="cmp__li-icon cmp__li-icon--pro" aria-hidden="true">
                        +
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <ul className="cmp__cons-list">
                  {side.cons.map((item) => (
                    <li key={item}>
                      <span className="cmp__li-icon cmp__li-icon--con" aria-hidden="true">
                        −
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="cmp__who" aria-labelledby="who-title">
          <div className="cmp__section-head">
            <h2 id="who-title">{t.compare.who}</h2>
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
            <h2 id="verdict-title">{t.compare.verdict}</h2>
            <p className="cmp__verdict-text">{comparison.verdict}</p>
            <p className="cmp__verdict-rec">{comparison.recommendationText}</p>
            <Link to={quoteHref(ctaSlug)} className="cmp__cta">
              {t.compare.getQuote}
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
            <h2 id="faq-title">{t.compare.faqs}</h2>
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
            <div className="cmp__section-head cmp__section-head--row">
              <div>
                <h2 id="related-title">{t.compare.related}</h2>
                <p>
                  {interpolate(t.compare.relatedLead, {
                    category: t.compare.categories[comparison.category],
                  })}
                </p>
              </div>
              {related.length > 3 && (
                <div className="cmp__related-nav">
                  <button
                    type="button"
                    onClick={() => scrollRelated(-1)}
                    aria-label={t.compare.prev}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M15 5l-7 7 7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRelated(1)}
                    aria-label={t.compare.next}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M9 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <ul
              className="cmp__related-carousel"
              ref={relatedTrackRef}
              style={
                {
                  "--cols": Math.min(related.length, 3),
                } as React.CSSProperties
              }
            >
              {related.map((item) => (
                <li key={item.slug}>
                  <ComparisonDuelCard comparison={item} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="cmp__back">
          <Link to={href("comparisonHub")}>← {t.compare.catalog}</Link>
          {" · "}
          <span>
            {comparisons.length} · {t.footer.comparison}
          </span>
        </p>
      </div>
    </main>
  );
}
