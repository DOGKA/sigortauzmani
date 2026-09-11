import { Link } from "react-router-dom";
import type { Comparison } from "../data/comparisons";
import { localizedComparison } from "../lib/i18n/comparison-copy";
import { useLocale, useT } from "../lib/i18n/context";
import "./ComparisonDuelCard.css";

export default function ComparisonDuelCard({
  comparison,
  showCategory = false,
}: {
  comparison: Comparison;
  /** Kategori etiketi yalnızca karışık listelerde ("Tümü") anlamlıdır */
  showCategory?: boolean;
}) {
  const { locale, href } = useLocale();
  const t = useT();
  const copy = localizedComparison(comparison, locale);

  return (
    <Link
      to={href("comparison", { slug: comparison.slug })}
      className="cmp-hub__duel-card"
    >
      <span className="cmp-hub__duel-border" aria-hidden="true" />

      <div className="cmp-hub__duel-content">
        {showCategory && (
          <div className="cmp-hub__duel-top">
            <span className="cmp-hub__duel-category">
              {t.compare.categories[comparison.category]}
            </span>
          </div>
        )}

        <div className="cmp-hub__duel-arena">
          <strong className="cmp-hub__duel-name">{copy.left.name}</strong>
          <span className="cmp-hub__duel-sr">{t.compare.vs}</span>
          <span className="cmp-hub__duel-divider" aria-hidden="true" />
          <strong className="cmp-hub__duel-name cmp-hub__duel-name--alt">
            {copy.right.name}
          </strong>
        </div>

        <p className="cmp-hub__duel-summary">{copy.summary}</p>
      </div>

      <span className="cmp-hub__duel-door" aria-hidden="true">
        <span className="cmp-hub__duel-door-panel">
          <span className="cmp-hub__duel-door-q">{t.compare.whichFits}</span>
          <span className="cmp-hub__duel-door-cta">{t.compare.seeDiffs}</span>
        </span>
      </span>
    </Link>
  );
}
