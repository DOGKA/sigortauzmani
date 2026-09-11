import { useLocation, useNavigate } from "react-router-dom";
import { useCookieConsent } from "../lib/cookies/context";
import { rememberLocale, useLocale, useT } from "../lib/i18n/context";
import { LOCALES, LOCALE_META, type Locale } from "../lib/i18n/locales";
import { switchLocalePath } from "../lib/i18n/paths";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { locale } = useLocale();
  const t = useT();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const { consent } = useCookieConsent();

  const onChange = (next: Locale) => {
    if (next === locale) return;
    rememberLocale(next, Boolean(consent?.preferences));
    navigate(`${switchLocalePath(pathname, next)}${search}${hash}`);
  };

  return (
    <div className="lang-switch">
      <label className="lang-switch__label" htmlFor="lang-desktop">
        {t.lang.label}
      </label>
      <select
        id="lang-desktop"
        className="lang-switch__select"
        value={locale}
        aria-label={t.lang.choose}
        onChange={(event) => onChange(event.target.value as Locale)}
      >
        {LOCALES.map((item) => (
          <option key={item} value={item}>
            {LOCALE_META[item].flag} {LOCALE_META[item].code}
          </option>
        ))}
      </select>
    </div>
  );
}
