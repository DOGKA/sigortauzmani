import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  CATEGORY_LABELS,
  type Comparison,
  comparisons,
  getComparison,
} from "../data/comparisons";
import ComparisonDuelCard from "../components/ComparisonDuelCard";
import { pageOgImageUrl } from "../lib/seo/config";
import { comparisonNodes } from "../lib/seo/nodes/comparison";
import { ROUTES } from "../lib/seo/routes";
import { pageGraph } from "../lib/seo/schema";
import { useJsonLd } from "../lib/seo/useJsonLd";
import { useSeo } from "../lib/seo/useSeo";
import "./ComparisonPage.css";

function usePageMeta(comparison: Comparison | undefined) {
  const path = comparison ? ROUTES.comparison(comparison.slug) : "";

  useSeo(
    comparison
      ? {
          title: comparison.seoTitle,
          description: comparison.seoDescription,
          path,
          type: "article",
          image: pageOgImageUrl(comparison.shortTitle, "Karşılaştırma"),
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
            { name: "Ana Sayfa", path: ROUTES.home },
            { name: "Karşılaştırma Merkezi", path: ROUTES.comparisonHub },
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
  if (/^(hayır|yok|kapsam dışı)/.test(t)) return "no";
  if (/^(evet|var|zorunlu)/.test(t)) return "yes";
  if (
    /(pakete göre|ek teminat|ek hizmet|ek paket|eklenebilir|sunulabilir|genelde dahil|sınırlı|isteğe bağlı|alınabilir|deprem kaynaklı)/.test(
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
  // Girdi ham string tutulur; sayıya çevirip state'e yazmak "01000" gibi kalıntılar bırakıyordu.
  const [premiumInput, setPremiumInput] = useState(
    String(examFeeHint * visitsBreakEvenHint),
  );
  const [feeInput, setFeeInput] = useState(String(examFeeHint));
  const annualPremium = Math.max(0, Number(premiumInput) || 0);
  const examFee = Math.max(0, Number(feeInput) || 0);
  const visits = examFee > 0 ? annualPremium / examFee : 0;
  const visitsLabel = (Math.round(visits * 10) / 10).toLocaleString("tr-TR");
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
            value={premiumInput}
            onChange={(e) => setPremiumInput(e.target.value)}
          />
        </label>
        <label>
          <span>Ortalama özel muayene farkı (₺)</span>
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
          <p>Hesaplamak için yıllık prim ve muayene farkı girin.</p>
        ) : visits < 1 ? (
          <p>
            Yıllık priminiz tek bir muayene farkından bile düşük;{" "}
            <strong>daha ilk muayenede</strong> kâra geçersiniz.
          </p>
        ) : (
          <p>
            Yılda yaklaşık <strong>{visitsLabel} kez</strong> özel muayeneye
            giderseniz priminizi amorti edersiniz.
          </p>
        )}
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const relatedTrackRef = useRef<HTMLUListElement>(null);

  usePageMeta(comparison);

  useEffect(() => {
    if (!comparison) return;
    setOpenFaq(0);
  }, [comparison]);

  if (!comparison) {
    return <Navigate to="/karsilastirma" replace />;
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

          <h1 className="cmp__hero-title">{comparison.heroTitle}</h1>

          <div className="cmp__hero-intro">
            {comparison.heroIntro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        {comparison.sameThingNote && (
          <aside className="cmp__same" role="note">
            <strong>Önemli:</strong> {comparison.sameThingNote}
          </aside>
        )}

        <section className="cmp__table-section" aria-labelledby="table-title">
          <div className="cmp__section-head">
            <h2 id="table-title">Teminatlar</h2>
            <p>Yan yana temel farklar.</p>
            <span className="cmp__table-mobile-hint" aria-hidden="true">
              Tabloyu yana kaydırarak tüm farkları inceleyin
            </span>
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
            <h2 id="pros-title">Avantajlar & dezavantajlar</h2>
          </div>
          <div className="cmp__proscons-grid">
            {(
              [
                {
                  name: comparison.left.name,
                  pros: comparison.advantages.left,
                  cons: comparison.disadvantages.left,
                },
                {
                  name: comparison.right.name,
                  pros: comparison.advantages.right,
                  cons: comparison.disadvantages.right,
                },
              ] as const
            ).map((side) => (
              <div className="cmp__col" key={side.name}>
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
            <div className="cmp__section-head cmp__section-head--row">
              <div>
                <h2 id="related-title">İlgili karşılaştırmalar</h2>
                <p>
                  {CATEGORY_LABELS[comparison.category]} kategorisindeki diğer
                  içerikler.
                </p>
              </div>
              {related.length > 3 && (
                <div className="cmp__related-nav">
                  <button
                    type="button"
                    onClick={() => scrollRelated(-1)}
                    aria-label="Önceki karşılaştırmalar"
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
                    aria-label="Sonraki karşılaştırmalar"
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
