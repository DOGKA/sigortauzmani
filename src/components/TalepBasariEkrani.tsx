/**
 * Teklif talebi oluşturulduktan sonraki başarı ekranı.
 *
 * İki yerden kullanılıyor: lead formu (`QuotePage`) ve self servis akışta
 * anında satın alınamayan şirketler için açılan "Teklif iste" (`QuoteFlowPage`).
 * İkisinde de talep numarası, iletişim tercihi ve WhatsApp yönlendirmesi aynı
 * olduğu için ekran tek yerde duruyor.
 *
 * Stiller `QuotePage.css` içinde: sınıflar oradaki `quote__*` ailesinin parçası
 * ve dosyanın geri kalanıyla aynı değişkenleri paylaşıyor. Ekran buraya
 * taşınırken stil bloğu bölünmedi, bileşen dosyayı kendisi import ediyor.
 */

import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Link } from "react-router-dom";
import { formatDisplayDate, interpolate } from "../lib/i18n/format";
import { useLocale, useT } from "../lib/i18n/context";
import { setContactPreference } from "../lib/supabase";
import "../pages/QuotePage.css";

const WHATSAPP_NUMBER = "908503020032";

const TIME_SLOTS = [
  "09:00 - 11:00",
  "11:00 - 13:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
  "17:00 - 19:00",
];

function getTodayIso() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

interface Props {
  talepNo: string;
  /** Geriye dönük uyumluluk; WhatsApp mesajında kullanılmaz. */
  urunAdi?: string;
  onYeniTeklif: () => void;
  yeniTeklifEtiketi?: string;
}

export default function TalepBasariEkrani({
  talepNo,
  onYeniTeklif,
  yeniTeklifEtiketi,
}: Props) {
  const t = useT();
  const { locale, href } = useLocale();
  const [contactChoice, setContactChoice] = useState<"hemen" | "tarihli" | null>(
    null,
  );
  const [contactDate, setContactDate] = useState("");
  const [contactTime, setContactTime] = useState("");
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);
  const [talepCopied, setTalepCopied] = useState(false);

  const whatsappMessage = talepNo
    ? interpolate(t.success.waMessage, { no: talepNo })
    : t.success.waMessagePlain;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  const chooseImmediate = async () => {
    setContactChoice("hemen");
    setPrefSaving(true);
    await setContactPreference(talepNo, "hemen");
    setPrefSaving(false);
    setPrefSaved(true);
  };

  const saveScheduled = async () => {
    if (!contactDate || !contactTime) return;
    setPrefSaving(true);
    await setContactPreference(talepNo, "tarihli", contactDate, contactTime);
    setPrefSaving(false);
    setPrefSaved(true);
  };

  const copyTalepNo = async () => {
    if (!talepNo) return;
    try {
      await navigator.clipboard.writeText(talepNo);
    } catch {
      const input = document.createElement("textarea");
      input.value = talepNo;
      input.setAttribute("readonly", "");
      input.style.position = "absolute";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setTalepCopied(true);
    window.setTimeout(() => setTalepCopied(false), 2000);
  };

  return (
    <div className="quote__success">
      <div className="quote__success-confetti" aria-hidden="true">
        <DotLottieReact src="/confetti.lottie" autoplay />
      </div>

      <div className="quote__success-hero">
        <div className="quote__success-cat" aria-hidden="true">
          <DotLottieReact src="/cat.lottie" autoplay loop />
        </div>
        <h2 className="quote__success-title">{t.success.title}</h2>
        <p className="quote__success-sub">{t.success.sub}</p>
      </div>

      <div className="quote__ticket">
        <div className="quote__ticket-info">
          <span className="quote__ticket-label">{t.success.requestNo}</span>
          <span className="quote__ticket-value">{talepNo}</span>
        </div>
        <button
          type="button"
          className={`quote__ticket-copy ${talepCopied ? "quote__ticket-copy--done" : ""}`}
          onClick={copyTalepNo}
          aria-label={talepCopied ? t.success.copiedAria : t.success.copyAria}
        >
          {talepCopied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t.success.copied}
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="9"
                  y="9"
                  width="13"
                  height="13"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {t.success.copy}
            </>
          )}
        </button>
      </div>

      <div className="quote__success-grid">
        <section className="quote__panel">
          <div className="quote__panel-head">
            <span className="quote__panel-icon quote__panel-icon--call" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h3 className="quote__panel-title">{t.success.callTitle}</h3>
              <p className="quote__panel-sub">{t.success.callSub}</p>
            </div>
          </div>

          {prefSaved ? (
            <div className="quote__pref-saved">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {contactChoice === "hemen"
                ? t.success.savedNow
                : interpolate(t.success.savedLater, {
                    date: formatDisplayDate(contactDate, locale),
                    time: contactTime,
                  })}
            </div>
          ) : (
            <div className="quote__pref">
              <div className="quote__pref-options">
                <button
                  type="button"
                  className={`quote__pref-option ${contactChoice === "hemen" ? "quote__pref-option--active" : ""}`}
                  onClick={chooseImmediate}
                  disabled={prefSaving}
                >
                  {t.success.now}
                </button>
                <button
                  type="button"
                  className={`quote__pref-option ${contactChoice === "tarihli" ? "quote__pref-option--active" : ""}`}
                  onClick={() => setContactChoice("tarihli")}
                  disabled={prefSaving}
                >
                  {t.success.pickDate}
                </button>
              </div>

              {contactChoice === "tarihli" && (
                <div className="quote__pref-schedule">
                  <input
                    type="date"
                    className="quote__input"
                    value={contactDate}
                    min={getTodayIso()}
                    onChange={(event) => setContactDate(event.target.value)}
                    aria-label={t.success.dateAria}
                  />
                  <select
                    className="quote__input quote__select"
                    value={contactTime}
                    onChange={(event) => setContactTime(event.target.value)}
                    aria-label={t.success.timeAria}
                  >
                    <option value="">{t.success.timePlaceholder}</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="quote__submit quote__pref-save"
                    onClick={saveScheduled}
                    disabled={!contactDate || !contactTime || prefSaving}
                  >
                    {prefSaving ? t.success.saving : t.success.savePref}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="quote__panel quote__panel--wa">
          <div className="quote__panel-head">
            <span className="quote__panel-icon quote__panel-icon--wa" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h3 className="quote__panel-title">{t.success.waTitle}</h3>
              <p className="quote__panel-sub">{t.success.waSub}</p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="quote__whatsapp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2.05 22l5.3-1.39a9.87 9.87 0 0 0 4.69 1.19h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.24-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3Z" />
            </svg>
            {t.success.waCta}
          </a>
          <p className="quote__panel-note">{t.success.waNote}</p>
        </section>
      </div>

      <div className="quote__success-footer">
        <span className="quote__success-footer-text">{t.success.more}</span>
        <div className="quote__success-footer-actions">
          <button type="button" className="quote__again" onClick={onYeniTeklif}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            {yeniTeklifEtiketi ?? t.success.newQuote}
          </button>
          <Link to={href("home")} className="quote__browse">
            {t.success.browse}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      </div>
    </div>
  );
}
