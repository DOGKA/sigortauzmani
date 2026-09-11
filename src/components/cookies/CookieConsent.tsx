import { Link } from "react-router-dom";
import { BANNER, PREFERENCE_LABELS } from "../../lib/cookies/config";
import { useCookieConsent } from "../../lib/cookies/context";
import { ROUTES } from "../../lib/seo/routes";
import "./CookieConsent.css";

export default function CookieConsent() {
  const {
    bannerOpen,
    panelOpen,
    draft,
    setDraft,
    rejectOptional,
    acceptAll,
    openPanel,
    closePanel,
    saveDraft,
  } = useCookieConsent();

  if (!bannerOpen && !panelOpen) return null;

  return (
    <>
      {bannerOpen && !panelOpen && (
        <div
          className="cookie-banner"
          role="region"
          aria-label={BANNER.title}
        >
          <div className="cookie-banner__inner">
            <div className="cookie-banner__copy">
              <h2>{BANNER.title}</h2>
              <p>
                {BANNER.bodyBeforeLink}
                <Link to={ROUTES.cookies}>{BANNER.linkLabel}</Link>
                {BANNER.bodyAfterLink}
              </p>
            </div>
            <div className="cookie-banner__actions">
              <button type="button" className="cookie-btn" onClick={rejectOptional}>
                {BANNER.reject}
              </button>
              <button type="button" className="cookie-btn" onClick={openPanel}>
                {BANNER.manage}
              </button>
              <button type="button" className="cookie-btn" onClick={acceptAll}>
                {BANNER.accept}
              </button>
            </div>
          </div>
        </div>
      )}

      {panelOpen && (
        <div className="cookie-panel-backdrop" onClick={closePanel}>
          <div
            className="cookie-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-panel-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="cookie-panel__close"
              onClick={closePanel}
              aria-label="Kapat"
            >
              ×
            </button>
            <h2 id="cookie-panel-title">{BANNER.title}</h2>
            <p className="cookie-panel__lead">
              Zorunlu teknolojiler site güvenliği ve temel işlevler için her zaman
              etkindir. Aşağıdaki kategorileri açıp kapatabilirsiniz.
            </p>

            <ul className="cookie-panel__list">
              <li className="cookie-panel__item cookie-panel__item--locked">
                <div>
                  <strong>{PREFERENCE_LABELS.necessary.title}</strong>
                  <p>{PREFERENCE_LABELS.necessary.description}</p>
                </div>
                <span className="cookie-panel__always" aria-hidden="true">
                  Her zaman açık
                </span>
              </li>

              {(
                [
                  ["analytics", PREFERENCE_LABELS.analytics],
                  ["preferences", PREFERENCE_LABELS.preferences],
                  ["marketing", PREFERENCE_LABELS.marketing],
                ] as const
              ).map(([key, meta]) => (
                <li key={key} className="cookie-panel__item">
                  <div>
                    <strong>{meta.title}</strong>
                    <p>{meta.description}</p>
                  </div>
                  <label className="cookie-panel__toggle">
                    <input
                      type="checkbox"
                      checked={draft[key]}
                      onChange={(event) =>
                        setDraft({ ...draft, [key]: event.target.checked })
                      }
                    />
                    <span className="cookie-panel__switch" aria-hidden="true" />
                    <span className="sr-only">{meta.title}</span>
                  </label>
                </li>
              ))}
            </ul>

            <p className="cookie-panel__policy">
              Ayrıntılar için{" "}
              <Link to={ROUTES.cookies} onClick={closePanel}>
                Çerez Politikası
              </Link>
              &rsquo;nı inceleyebilirsiniz.
            </p>

            <div className="cookie-panel__actions">
              <button type="button" className="cookie-btn" onClick={rejectOptional}>
                {BANNER.reject}
              </button>
              <button type="button" className="cookie-btn" onClick={saveDraft}>
                Seçimi kaydet
              </button>
              <button type="button" className="cookie-btn" onClick={acceptAll}>
                {BANNER.accept}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
