import { Link } from "react-router-dom";
import { CATEGORY_LABELS, type Comparison } from "../data/comparisons";
import "./ComparisonDuelCard.css";

export default function ComparisonDuelCard({
  comparison,
  showCategory = false,
}: {
  comparison: Comparison;
  /** Kategori etiketi yalnızca karışık listelerde ("Tümü") anlamlıdır */
  showCategory?: boolean;
}) {
  return (
    <Link
      to={`/karsilastirma/${comparison.slug}`}
      className="cmp-hub__duel-card"
    >
      <span className="cmp-hub__duel-border" aria-hidden="true" />

      <div className="cmp-hub__duel-content">
        {showCategory && (
          <div className="cmp-hub__duel-top">
            <span className="cmp-hub__duel-category">
              {CATEGORY_LABELS[comparison.category]}
            </span>
          </div>
        )}

        <div className="cmp-hub__duel-arena">
          <strong className="cmp-hub__duel-name">{comparison.left.name}</strong>
          <span className="cmp-hub__duel-sr">ile</span>
          <span className="cmp-hub__duel-divider" aria-hidden="true" />
          <strong className="cmp-hub__duel-name cmp-hub__duel-name--alt">
            {comparison.right.name}
          </strong>
        </div>

        <p className="cmp-hub__duel-summary">{comparison.summary}</p>
      </div>

      {/* Hover'da yandan kapanan "garaj kapısı" paneli */}
      <span className="cmp-hub__duel-door" aria-hidden="true">
        <span className="cmp-hub__duel-door-panel">
          <span className="cmp-hub__duel-door-q">Hangisi size uygun?</span>
          <span className="cmp-hub__duel-door-cta">Farkları gör</span>
        </span>
      </span>
    </Link>
  );
}
