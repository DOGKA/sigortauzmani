import { useEffect, useId, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = LOCALE_META[locale];

  const selectLocale = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    rememberLocale(next, Boolean(consent?.preferences));
    navigate(`${switchLocalePath(pathname, next)}${search}${hash}`);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lang-switch" ref={rootRef}>
      <span className="lang-switch__label" id={`${listId}-label`}>
        {t.lang.label}
      </span>
      <button
        type="button"
        id="lang-desktop"
        className="lang-switch__select"
        aria-label={`${current.code}, ${t.lang.choose}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="lang-switch__flag" aria-hidden="true">
          {current.flag}
        </span>
        {current.code}
      </button>
      {open ? (
        <div
          id={listId}
          className="lang-switch__menu"
          role="listbox"
          aria-labelledby={`${listId}-label`}
        >
          {LOCALES.map((item) => (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={item === locale}
              className={`lang-switch__option${item === locale ? " is-active" : ""}`}
              onClick={() => selectLocale(item)}
            >
              <span className="lang-switch__flag" aria-hidden="true">
                {LOCALE_META[item].flag}
              </span>
              {LOCALE_META[item].code}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
