import { Link } from "react-router-dom";
import { useCookieConsent } from "../../lib/cookies/context";
import { useLocale, useT } from "../../lib/i18n/context";
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
  const t = useT();
  const { href } = useLocale();

  if (!bannerOpen && !panelOpen) return null;

  const labels = {
    analytics: { title: t.cookies.analyticsTitle, description: t.cookies.analyticsDesc },
    preferences: { title: t.cookies.preferencesTitle, description: t.cookies.preferencesDesc },
    marketing: { title: t.cookies.marketingTitle, description: t.cookies.marketingDesc },
  } as const;

  return (
    <>
      {bannerOpen && !panelOpen && (
        <div className="cookie-banner" role="region" aria-label={t.cookies.title}>
          <div className="cookie-banner__inner">
            <div className="cookie-banner__copy">
              <h2>{t.cookies.title}</h2>
              <p>
                {t.cookies.bodyBefore}
                <Link to={href("cookies")}>{t.cookies.link}</Link>
                {t.cookies.bodyAfter}
              </p>
            </div>
            <div className="cookie-banner__actions">
              <button type="button" className="cookie-btn" onClick={rejectOptional}>
                {t.cookies.reject}
              </button>
              <button type="button" className="cookie-btn" onClick={openPanel}>
                {t.cookies.manage}
              </button>
              <button type="button" className="cookie-btn" onClick={acceptAll}>
                {t.cookies.accept}
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
              aria-label={t.cookies.close}
            >
              ×
            </button>
            <h2 id="cookie-panel-title">{t.cookies.title}</h2>
            <p className="cookie-panel__lead">{t.cookies.lead}</p>

            <ul className="cookie-panel__list">
              <li className="cookie-panel__item cookie-panel__item--locked">
                <div>
                  <strong>{t.cookies.necessaryTitle}</strong>
                  <p>{t.cookies.necessaryDesc}</p>
                </div>
                <span className="cookie-panel__always" aria-hidden="true">
                  {t.cookies.alwaysOn}
                </span>
              </li>

              {(["analytics", "preferences", "marketing"] as const).map((key) => (
                <li key={key} className="cookie-panel__item">
                  <div>
                    <strong>{labels[key].title}</strong>
                    <p>{labels[key].description}</p>
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
                    <span className="sr-only">{labels[key].title}</span>
                  </label>
                </li>
              ))}
            </ul>

            <p className="cookie-panel__policy">
              {t.cookies.policyLead}
              <Link to={href("cookies")} onClick={closePanel}>
                {t.cookies.link}
              </Link>
              {t.cookies.policyAfter}
            </p>

            <div className="cookie-panel__actions">
              <button type="button" className="cookie-btn" onClick={rejectOptional}>
                {t.cookies.reject}
              </button>
              <button type="button" className="cookie-btn" onClick={saveDraft}>
                {t.cookies.save}
              </button>
              <button type="button" className="cookie-btn" onClick={acceptAll}>
                {t.cookies.accept}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
