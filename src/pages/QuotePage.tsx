import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getProduct } from "../data/products";
import AdvisorVideo from "../components/AdvisorVideo";
import {
  formatPhoneInput,
  getMaxBirthDate,
  isAdult,
  isValidDocumentSerial,
  isValidMobilePhone,
  isValidPlate,
  isValidTckn,
} from "../utils/validation";
import "./QuotePage.css";

const TOTAL_STEPS = 2;
const VEHICLE_PRODUCT_SLUGS = new Set([
  "kasko",
  "trafik-sigortasi",
  "imm",
  "yesil-kart",
]);
const SECOND_STEP_VIDEO = "/advisor-2.mp4";
const SECOND_STEP_TRANSCRIPT =
  "Teşekkür ederim. Son adıma geçiyoruz. Lütfen kalan iki bilgiyi de paylaşın. Ardından sizin için en uygun sigorta tekliflerini hazırlayacağım.";

const WHATSAPP_NUMBER = "908503020032";

const INSURED_FOR_LABELS: Record<string, string> = {
  self: "Kendim",
  spouse: "Eşim",
  children: "Çocuğum/Çocuklarım",
};

function formatDate(isoDate: string) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

export default function QuotePage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProduct(slug) : undefined;
  const [insuredFor, setInsuredFor] = useState("self");
  const [step, setStep] = useState(1);
  const [tckn, setTckn] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [plate, setPlate] = useState("");
  const [documentSerial, setDocumentSerial] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  if (!product) {
    return (
      <div className="quote quote--not-found">
        <h1>Ürün bulunamadı</h1>
        <Link to="/" className="quote__back">
          Anasayfaya dön
        </Link>
      </div>
    );
  }

  const isVehicleProduct = VEHICLE_PRODUCT_SLUGS.has(product.slug);
  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!isValidTckn(tckn)) {
      next.tckn = "Geçerli bir T.C. Kimlik Numarası girin.";
    }
    if (isVehicleProduct && !isValidMobilePhone(phone)) {
      next.phone = "Geçerli bir cep telefonu girin (05XX XXX XX XX).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    if (!birthDate) {
      next.birthDate = "Doğum tarihinizi girin.";
    } else if (!isAdult(birthDate)) {
      next.birthDate = "Teklif alabilmek için 18 yaşından büyük olmalısınız.";
    }
    if (isVehicleProduct) {
      if (!isValidPlate(plate)) {
        next.plate = "Geçerli bir plaka girin (örn. 06 TC 001).";
      }
      if (!isValidDocumentSerial(documentSerial)) {
        next.documentSerial = "Belge seri no 2 harf ve 6 rakam olmalı (örn. AA999999).";
      }
    } else if (!isValidMobilePhone(phone)) {
      next.phone = "Geçerli bir cep telefonu girin (05XX XXX XX XX).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const summaryItems: { label: string; value: string }[] = [
    !isVehicleProduct && {
      label: "Sigortalanacak Kişi",
      value: INSURED_FOR_LABELS[insuredFor] ?? insuredFor,
    },
    { label: "T.C. Kimlik No", value: tckn },
    { label: "Cep Telefonu", value: phone },
    { label: "Doğum Tarihi", value: formatDate(birthDate) },
    isVehicleProduct && { label: "Plaka", value: plate },
    isVehicleProduct && { label: "Belge Seri No", value: documentSerial },
  ].filter(
    (item): item is { label: string; value: string } =>
      Boolean(item) && Boolean((item as { value: string }).value),
  );

  const whatsappMessage = [
    `Merhabalar, ${product.title} hakkında bilgi almak ve teklif istiyorum.`,
    "",
    "Bilgilerim:",
    ...summaryItems.map((item) => `${item.label}: ${item.value}`),
  ].join("\n");

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  return (
    <section className="quote">
      <div className="quote__bg" aria-hidden="true">
        <div className="quote__blob quote__blob--1" />
        <div className="quote__blob quote__blob--2" />
      </div>

      <div className="quote__inner">
        <nav className="quote__breadcrumb">
          <Link to="/">Anasayfa</Link>
          <span>/</span>
          <span className="quote__breadcrumb-current">{product.title}</span>
        </nav>

        <div className="quote__layout">
          <div className="quote__form-card">
            {completed ? (
              <div className="quote__success">
                <div className="quote__success-confetti" aria-hidden="true">
                  <DotLottieReact src="/confetti.lottie" autoplay />
                </div>
                <div className="quote__success-cat" aria-hidden="true">
                  <DotLottieReact src="/cat.lottie" autoplay loop />
                </div>
                <div className="quote__success-icon" aria-hidden="true">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="quote__success-title">Tebrikler, talebiniz alındı!</h2>
                <p className="quote__success-text">
                  {product.title} teklifi için bilgileriniz hazır. Sigorta
                  Uzmanınıza bağlanarak size özel teklifleri hemen alabilirsiniz.
                </p>

                <dl className="quote__summary">
                  <div className="quote__summary-row">
                    <dt>Sigorta Türü</dt>
                    <dd>{product.title}</dd>
                  </div>
                  {summaryItems.map((item) => (
                    <div className="quote__summary-row" key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quote__whatsapp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2.05 22l5.3-1.39a9.87 9.87 0 0 0 4.69 1.19h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.24-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3Z" />
                  </svg>
                  Sigorta Uzmanına Bağlan
                </a>
                <p className="quote__success-note">
                  WhatsApp üzerinden +90 850 302 00 32 numaralı hattımıza
                  yönlendirileceksiniz. Mesajınız hazır olacak, yalnızca
                  göndermeniz yeterli.
                </p>
              </div>
            ) : (
              <>
                <AdvisorVideo
                  replayKey={step}
                  videoSrc={step === 2 ? SECOND_STEP_VIDEO : undefined}
                  transcript={step === 2 ? SECOND_STEP_TRANSCRIPT : undefined}
                />

                <div className="quote__steps">
                  {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                    <span
                      key={i}
                      className={`quote__step-dot ${i + 1 <= step ? "quote__step-dot--active" : ""}`}
                    />
                  ))}
                  <span className="quote__step-label">
                    Adım {step}/{TOTAL_STEPS}
                  </span>
                </div>

                {step === 1 && (
                  <form
                    className="quote__form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (validateStep1()) nextStep();
                    }}
                    noValidate
                  >
                    {isVehicleProduct ? (
                      <>
                        <div className="quote__field">
                          <input
                            type="text"
                            className={`quote__input ${errors.tckn ? "quote__input--error" : ""}`}
                            inputMode="numeric"
                            placeholder="T.C. Kimlik Numarası"
                            value={tckn}
                            onChange={(event) => {
                              setTckn(event.target.value.replace(/\D/g, "").slice(0, 11));
                              clearError("tckn");
                            }}
                          />
                          {errors.tckn && (
                            <span className="quote__error">{errors.tckn}</span>
                          )}
                        </div>
                        <div className="quote__field">
                          <input
                            type="tel"
                            className={`quote__input ${errors.phone ? "quote__input--error" : ""}`}
                            placeholder="Cep Telefonu"
                            value={phone}
                            onChange={(event) => {
                              setPhone(formatPhoneInput(event.target.value));
                              clearError("phone");
                            }}
                          />
                          {errors.phone && (
                            <span className="quote__error">{errors.phone}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="quote__field">
                          <span>Sigortalanacak Kişi/Kişiler</span>
                          <select
                            className="quote__input quote__select"
                            value={insuredFor}
                            onChange={(event) => setInsuredFor(event.target.value)}
                          >
                            <option value="self">Kendim</option>
                            <option value="spouse">Eşim</option>
                            <option value="children">Çocuğum/Çocuklarım</option>
                          </select>
                        </label>
                        <label className="quote__field">
                          <span>T.C. Kimlik Numarası</span>
                          <input
                            type="text"
                            className={`quote__input ${errors.tckn ? "quote__input--error" : ""}`}
                            inputMode="numeric"
                            placeholder="11 haneli T.C. Kimlik Numarası"
                            value={tckn}
                            onChange={(event) => {
                              setTckn(event.target.value.replace(/\D/g, "").slice(0, 11));
                              clearError("tckn");
                            }}
                          />
                          {errors.tckn && (
                            <span className="quote__error">{errors.tckn}</span>
                          )}
                        </label>
                      </>
                    )}

                    <button type="button" className="quote__why">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Neden bu bilgilere ihtiyacımız var?
                    </button>

                    <button type="submit" className="quote__submit">
                      {product.title} Teklifi Al
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form
                    className="quote__form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!kvkkAccepted || !privacyAccepted) return;
                      if (validateStep2()) setCompleted(true);
                    }}
                  >
                    <label className="quote__field">
                      <span>Doğum Tarihi</span>
                      <input
                        type="date"
                        className={`quote__input ${errors.birthDate ? "quote__input--error" : ""}`}
                        value={birthDate}
                        max={getMaxBirthDate()}
                        onChange={(event) => {
                          setBirthDate(event.target.value);
                          clearError("birthDate");
                        }}
                      />
                      {errors.birthDate && (
                        <span className="quote__error">{errors.birthDate}</span>
                      )}
                    </label>

                    {isVehicleProduct ? (
                      <label className="quote__field">
                        <span>Araç Bilgileri</span>
                        <div
                          className={`quote__vehicle-input ${
                            errors.plate || errors.documentSerial
                              ? "quote__vehicle-input--error"
                              : ""
                          }`}
                        >
                          <span className="quote__plate-country" aria-hidden="true">
                            TR
                          </span>
                          <input
                            type="text"
                            className="quote__vehicle-field quote__plate-field"
                            value={plate}
                            onChange={(event) => {
                              setPlate(
                                event.target.value
                                  .replace(/ı/g, "I")
                                  .toUpperCase()
                                  .replace(/[^0-9A-Z ]/g, ""),
                              );
                              clearError("plate");
                            }}
                            maxLength={10}
                            autoComplete="off"
                            aria-label="Plaka"
                            placeholder="06 TC 001"
                          />
                          <span className="quote__vehicle-divider" aria-hidden="true" />
                          <input
                            type="text"
                            className="quote__vehicle-field quote__serial-field"
                            value={documentSerial}
                            onChange={(event) => {
                              setDocumentSerial(
                                event.target.value
                                  .replace(/ı/g, "I")
                                  .toUpperCase()
                                  .replace(/[^0-9A-Z]/g, ""),
                              );
                              clearError("documentSerial");
                            }}
                            maxLength={8}
                            autoComplete="off"
                            aria-label="Belge seri numarası"
                            placeholder="AA999999"
                          />
                        </div>
                        {errors.plate && (
                          <span className="quote__error">{errors.plate}</span>
                        )}
                        {errors.documentSerial && (
                          <span className="quote__error">{errors.documentSerial}</span>
                        )}
                      </label>
                    ) : (
                      <label className="quote__field">
                        <span>Telefon Numarası</span>
                        <input
                          type="tel"
                          className={`quote__input ${errors.phone ? "quote__input--error" : ""}`}
                          placeholder="05XX XXX XX XX"
                          value={phone}
                          onChange={(event) => {
                            setPhone(formatPhoneInput(event.target.value));
                            clearError("phone");
                          }}
                        />
                        {errors.phone && (
                          <span className="quote__error">{errors.phone}</span>
                        )}
                      </label>
                    )}

                    <div className="quote__consents">
                      <label className="quote__consent">
                        <input
                          type="checkbox"
                          checked={kvkkAccepted}
                          onChange={(event) => setKvkkAccepted(event.target.checked)}
                          required
                        />
                        <span>
                          <button type="button" className="quote__consent-link">
                            KVKK Aydınlatma Metni
                          </button>
                          &rsquo;ni okudum, kişisel verilerimin işlenmesini kabul
                          ediyorum.
                        </span>
                      </label>
                      <label className="quote__consent">
                        <input
                          type="checkbox"
                          checked={privacyAccepted}
                          onChange={(event) => setPrivacyAccepted(event.target.checked)}
                          required
                        />
                        <span>
                          <button type="button" className="quote__consent-link">
                            Gizlilik Politikası
                          </button>
                          &rsquo;nı okudum, kabul ediyorum.
                        </span>
                      </label>
                    </div>

                    <button type="submit" className="quote__submit">
                      Teklifleri Gör
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        <div className="quote__info">
          <img src={product.icon} alt="" className="quote__icon" />
          <div>
            <h1 className="quote__title">
              {product.title} Fiyatları 2026 için Teklif Al
            </h1>
            <ul className="quote__bullets">
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.</li>
              <li>Tempor incididunt ut labore et dolore magna aliqua enim ad minim.</li>
              <li>Veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.</li>
              <li>
                Ex ea commodo consequat duis aute irure dolor in reprehenderit in
                voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
