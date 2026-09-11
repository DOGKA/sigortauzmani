import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../data/products";
import { productIcons } from "../data/productIcons";
import AdvisorVideo from "../components/AdvisorVideo";
import QuoteKvkkNotu from "../components/QuoteKvkkNotu";
import SaglikAcikRiza from "../components/SaglikAcikRiza";
import TalepBasariEkrani from "../components/TalepBasariEkrani";
import {
  isSaglikUrunu,
  SAGLIK_RIZA_HATA,
  type SaglikRizaSecimi,
} from "../data/saglikRiza";
import { getQuoteKvkkGovde, QUOTE_KVKK_SURUM } from "../data/quoteKvkk";
import { ROBOTS_NOINDEX, pageOgImageUrl } from "../lib/seo/config";
import { productServiceNode } from "../lib/seo/nodes/product";
import { ROUTES } from "../lib/seo/routes";
import { pageGraph } from "../lib/seo/schema";
import { useJsonLd } from "../lib/seo/useJsonLd";
import { useSeo } from "../lib/seo/useSeo";
import {
  formatPhoneInput,
  isValidChassisNo,
  isValidDocumentSerial,
  isValidKimlikNo,
  isValidMobilePhone,
  isValidPlate,
  kimlikNoHatasi,
  kisiTipiCikar,
} from "../utils/validation";
import { createTalep, generateTalepNo } from "../lib/supabase";
import "./QuotePage.css";

const TOTAL_STEPS = 2;
const STEP_TITLES = ["Kimlik bilgileri", "Teklif detayları"] as const;
const VEHICLE_PRODUCT_SLUGS = new Set([
  "kasko",
  "trafik-sigortasi",
  "kisa-sureli-trafik",
  "imm",
  "yesil-kart",
]);
const SECOND_STEP_VIDEO = "/advisor-2.mp4";
const SECOND_STEP_TRANSCRIPT =
  "Teşekkür ederim. Son adıma geçiyoruz. Lütfen kalan iki bilgiyi de paylaşın. Ardından sizin için en uygun sigorta tekliflerini hazırlayacağım.";

const INSURED_FOR_LABELS: Record<string, string> = {
  self: "Kendim",
  spouse: "Eşim",
  children: "Çocuğum",
};

export default function QuotePage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProduct(slug) : undefined;
  const [insuredFor, setInsuredFor] = useState("self");
  const [step, setStep] = useState(1);
  const [kimlikNo, setKimlikNo] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [hasPlate, setHasPlate] = useState(true);
  const [plate, setPlate] = useState("");
  const [documentSerial, setDocumentSerial] = useState("");
  const [engineNo, setEngineNo] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [serialHelpOpen, setSerialHelpOpen] = useState(false);
  const [vehicleNoHelpOpen, setVehicleNoHelpOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [talepNo, setTalepNo] = useState("");
  const [saglikRiza, setSaglikRiza] = useState<SaglikRizaSecimi>("");
  // Aydınlatma metni formun ilk adımında gösteriliyor; sürümü ve gösterim
  // anı talep kaydına yazılıyor ki sonradan hangi metnin gösterildiği
  // kanıtlanabilsin.
  const [kvkkGosterildiAt] = useState(() => new Date().toISOString());

  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const productPath = product ? ROUTES.quote(product.slug) : "";

  useSeo(
    product
      ? {
          title: product.seoTitle,
          description: product.metaDescription,
          path: productPath,
          image: pageOgImageUrl(product.seoTitle, product.title),
        }
      : { title: "Ürün bulunamadı", description: "", path: "/", robots: ROBOTS_NOINDEX },
  );

  useJsonLd(
    product
      ? pageGraph({
          path: productPath,
          name: product.seoTitle,
          description: product.metaDescription,
          breadcrumb: [
            { name: "Ana Sayfa", path: ROUTES.home },
            { name: product.title },
          ],
          extra: [productServiceNode(product)],
        })
      : null,
  );

  if (!product) {
    return (
      <div className="quote quote--not-found">
        <h1>Ürün bulunamadı</h1>
        <Link to="/" className="quote__back">
          Ana Sayfaya dön
        </Link>
      </div>
    );
  }

  const isVehicleProduct = VEHICLE_PRODUCT_SLUGS.has(product.slug);
  const isHealthProduct = isSaglikUrunu(product.slug);
  /** Kasko tarzı adım 1: TCKN/VKN + telefon (DASK vb. dahil; sağlık hariç) */
  const usesIdentityPhoneStep = isVehicleProduct || !isHealthProduct;
  // Kişi tipi sorulmuyor, numaranın kendisinden okunuyor. Yabancı kimlik
  // numarası gerçek kişiye ait olduğu için kayıtta "şahıs" sayılıyor.
  const kisiTipi = kisiTipiCikar(kimlikNo);
  const entityType = kisiTipi === "sirket" ? "sirket" : "sahis";
  /** Vergi kimlik numarası girildiyse doğum tarihi sorulmuyor. */
  const showBirthDate = entityType !== "sirket";
  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  const switchHasPlate = (value: boolean) => {
    if (value === hasPlate) return;
    setHasPlate(value);
    setPlate("");
    setDocumentSerial("");
    setEngineNo("");
    setChassisNo("");
    clearError("plate");
    clearError("documentSerial");
    clearError("engineNo");
    clearError("chassisNo");
  };

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!isValidKimlikNo(kimlikNo)) {
      next.kimlik = kimlikNoHatasi(kimlikNo);
    }
    if (usesIdentityPhoneStep && !isValidMobilePhone(phone)) {
      next.phone = "Geçerli bir cep telefonu girin (05XX XXX XX XX).";
    }
    // Rıza vermemek akışı durdurmuyor; yalnızca seçimin yapılmış olması
    // isteniyor ki sessiz bir varsayılan rıza sayılmasın.
    if (isHealthProduct && !saglikRiza) {
      next.saglikRiza = SAGLIK_RIZA_HATA;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    // Vergi kimlik numarası girildiyse doğum tarihi alanı zaten gizli.
    if (entityType !== "sirket" && !birthDate) {
      next.birthDate = "Doğum tarihinizi girin.";
    }
    if (isVehicleProduct) {
      if (hasPlate) {
        if (!isValidPlate(plate)) {
          next.plate = "Geçerli bir plaka girin (örn. 06 TC 001).";
        }
        if (!isValidDocumentSerial(documentSerial)) {
          next.documentSerial = "Belge seri no 2 harf ve 6 rakam olmalı (örn. AA999999).";
        }
      } else if (!isValidChassisNo(chassisNo)) {
        next.chassisNo = "Geçerli bir şasi numarası girin (17 karakter).";
      }
    } else if (isHealthProduct && !isValidMobilePhone(phone)) {
      next.phone = "Geçerli bir cep telefonu girin (05XX XXX XX XX).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const completeQuote = () => {
    const no = generateTalepNo();
    setTalepNo(no);
    void createTalep({
      talep_no: no,
      product_slug: product.slug,
      product_title: product.title,
      insured_for: isHealthProduct
        ? (INSURED_FOR_LABELS[insuredFor] ?? insuredFor)
        : null,
      entity_type: entityType,
      tckn: entityType === "sahis" ? kimlikNo || null : null,
      vergi_no: entityType === "sirket" ? kimlikNo || null : null,
      phone: phone || null,
      birth_date: birthDate || null,
      plate: isVehicleProduct && hasPlate ? plate || null : null,
      document_serial:
        isVehicleProduct && hasPlate ? documentSerial || null : null,
      motor_no: isVehicleProduct && !hasPlate ? engineNo || null : null,
      sasi_no: isVehicleProduct && !hasPlate ? chassisNo || null : null,
      saglik_acik_riza: isHealthProduct ? saglikRiza === "veriyorum" : null,
      ...(getQuoteKvkkGovde(product.slug)
        ? {
            kvkk_surum: QUOTE_KVKK_SURUM,
            kvkk_gosterildi_at: kvkkGosterildiAt,
          }
        : {}),
    });
    setCompleted(true);
  };

  const startNewQuote = () => {
    setInsuredFor("self");
    setStep(1);
    setKimlikNo("");
    setPhone("");
    setBirthDate("");
    setHasPlate(true);
    setPlate("");
    setDocumentSerial("");
    setEngineNo("");
    setChassisNo("");
    setSerialHelpOpen(false);
    setVehicleNoHelpOpen(false);
    setCompleted(false);
    setErrors({});
    setTalepNo("");
    setSaglikRiza("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="quote">
      <div className="quote__bg" aria-hidden="true">
        <div className="quote__blob quote__blob--1" />
        <div className="quote__blob quote__blob--2" />
      </div>

      <div className="quote__inner">
        <nav className="quote__breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <span>/</span>
          <span className="quote__breadcrumb-current">{product.title}</span>
        </nav>

        <div className="quote__layout">
          <div className="quote__form-card">
            {completed ? (
              <TalepBasariEkrani
                talepNo={talepNo}
                urunAdi={product.title}
                onYeniTeklif={startNewQuote}
              />
            ) : (
              <>
                <AdvisorVideo
                  replayKey={step}
                  videoSrc={step === 2 ? SECOND_STEP_VIDEO : undefined}
                  transcript={step === 2 ? SECOND_STEP_TRANSCRIPT : undefined}
                />

                <div className="quote__steps">
                  <div className="quote__steps-head">
                    <span className="quote__step-title">{STEP_TITLES[step - 1]}</span>
                    {step > 1 && (
                      <button
                        type="button"
                        className="quote__step-back"
                        onClick={() => setStep((current) => Math.max(1, current - 1))}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="m15 18-6-6 6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Geri
                      </button>
                    )}
                  </div>
                  <div className="quote__steps-dots" aria-hidden="true">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                      <span
                        key={i}
                        className={`quote__step-dot ${i + 1 <= step ? "quote__step-dot--active" : ""}`}
                      />
                    ))}
                  </div>
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
                    {!usesIdentityPhoneStep ? (
                      <label className="quote__field">
                        <span>Sigortalanacak Kişi/Kişiler</span>
                        <select
                          className="quote__input quote__select"
                          value={insuredFor}
                          onChange={(event) => setInsuredFor(event.target.value)}
                        >
                          <option value="self">Kendim</option>
                          <option value="spouse">Eşim</option>
                          <option value="children">Çocuğum</option>
                        </select>
                      </label>
                    ) : null}

                    <label className="quote__field">
                      <span>T.C. kimlik / vergi kimlik numarası</span>
                      <input
                        type="text"
                        className={`quote__input ${errors.kimlik ? "quote__input--error" : ""}`}
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={11}
                        value={kimlikNo}
                        onChange={(event) => {
                          setKimlikNo(
                            event.target.value.replace(/\D/g, "").slice(0, 11),
                          );
                          clearError("kimlik");
                        }}
                      />
                      <span className="quote__hint">
                        Şirket adına teklif alıyorsanız vergi kimlik numarasını
                        girin.
                      </span>
                      {errors.kimlik && (
                        <span className="quote__error">{errors.kimlik}</span>
                      )}
                    </label>

                    {usesIdentityPhoneStep ? (
                      <div className="quote__field">
                        <input
                          type="tel"
                          className={`quote__input ${errors.phone ? "quote__input--error" : ""}`}
                          placeholder="Cep Telefonu (05XX XXX XX XX)"
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
                    ) : null}

                    <QuoteKvkkNotu productSlug={product.slug} variant="quote" />

                    {isHealthProduct ? (
                      <SaglikAcikRiza
                        deger={saglikRiza}
                        onDegis={(deger) => {
                          setSaglikRiza(deger);
                          clearError("saglikRiza");
                        }}
                        hata={Boolean(errors.saglikRiza)}
                      />
                    ) : null}

                    <button type="submit" className="quote__submit">
                      Devam et
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form
                    className="quote__form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (validateStep2()) completeQuote();
                    }}
                  >
                    {isVehicleProduct ? (
                      <>
                        <div
                          className="quote__toggle"
                          role="group"
                          aria-label="Plaka durumu"
                        >
                          <button
                            type="button"
                            className={`quote__toggle-option ${hasPlate ? "quote__toggle-option--active" : ""}`}
                            onClick={() => switchHasPlate(true)}
                          >
                            Plaka Var
                          </button>
                          <button
                            type="button"
                            className={`quote__toggle-option ${!hasPlate ? "quote__toggle-option--active" : ""}`}
                            onClick={() => switchHasPlate(false)}
                          >
                            Plaka Yok
                          </button>
                        </div>

                        <div className="quote__field quote__field--full">
                          <span>Araç Bilgileri</span>
                          {hasPlate ? (
                          <>
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
                            <button
                              type="button"
                              className="quote__serial-help"
                              onClick={() => setSerialHelpOpen(true)}
                            >
                              Ruhsat seri numaramı bulamıyorum?
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="text"
                              className="quote__input"
                              value={engineNo}
                              onChange={(event) => {
                                setEngineNo(
                                  event.target.value
                                    .replace(/ı/g, "I")
                                    .toUpperCase()
                                    .replace(/[^0-9A-Z-]/g, ""),
                                );
                              }}
                              maxLength={20}
                              autoComplete="off"
                              aria-label="Motor numarası"
                              placeholder="Motor No"
                            />
                            <input
                              type="text"
                              className={`quote__input ${errors.chassisNo ? "quote__input--error" : ""}`}
                              value={chassisNo}
                              onChange={(event) => {
                                setChassisNo(
                                  event.target.value
                                    .replace(/ı/g, "I")
                                    .toUpperCase()
                                    .replace(/[^0-9A-Z]/g, ""),
                                );
                                clearError("chassisNo");
                              }}
                              maxLength={17}
                              autoComplete="off"
                              aria-label="Şasi numarası"
                              placeholder="Şasi No (17 karakter)"
                            />
                            {errors.chassisNo && (
                              <span className="quote__error">{errors.chassisNo}</span>
                            )}
                            <button
                              type="button"
                              className="quote__serial-help"
                              onClick={() => setVehicleNoHelpOpen(true)}
                            >
                              Motor ve Şasi numaramı bulamıyorum
                            </button>
                          </>
                        )}
                        </div>

                        {showBirthDate && (
                          <label className="quote__field quote__field--full">
                            <span>Doğum Tarihi</span>
                            <input
                              type="date"
                              className={`quote__input ${errors.birthDate ? "quote__input--error" : ""}`}
                              value={birthDate}
                              onChange={(event) => {
                                setBirthDate(event.target.value);
                                clearError("birthDate");
                              }}
                            />
                            {errors.birthDate && (
                              <span className="quote__error">{errors.birthDate}</span>
                            )}
                          </label>
                        )}
                      </>
                    ) : isHealthProduct ? (
                      <>
                        {showBirthDate && (
                          <label className="quote__field">
                            <span>Doğum Tarihi</span>
                            <input
                              type="date"
                              className={`quote__input ${errors.birthDate ? "quote__input--error" : ""}`}
                              value={birthDate}
                              onChange={(event) => {
                                setBirthDate(event.target.value);
                                clearError("birthDate");
                              }}
                            />
                            {errors.birthDate && (
                              <span className="quote__error">{errors.birthDate}</span>
                            )}
                          </label>
                        )}
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
                      </>
                    ) : showBirthDate ? (
                      <label className="quote__field quote__field--full">
                        <span>Doğum Tarihi</span>
                        <input
                          type="date"
                          className={`quote__input ${errors.birthDate ? "quote__input--error" : ""}`}
                          value={birthDate}
                          onChange={(event) => {
                            setBirthDate(event.target.value);
                            clearError("birthDate");
                          }}
                        />
                        {errors.birthDate && (
                          <span className="quote__error">{errors.birthDate}</span>
                        )}
                      </label>
                    ) : (
                      // Vergi kimlik numarasıyla gelen talepte bu adımda
                      // sorulacak başka bir alan kalmıyor.
                      <p className="quote__field quote__field--full quote__hint">
                        Şirket adına açılan talepte doğum tarihi istenmiyor.
                        Teklifinizi oluşturmak için devam edebilirsiniz.
                      </p>
                    )}

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
          <img src={productIcons[product.slug]} alt="" className="quote__icon" />
          <div>
            <h1 className="quote__title">
              {product.seoTitle}
            </h1>
            <ul className="quote__bullets">
              {product.seoBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {serialHelpOpen && (
        <div
          className="quote__modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Ruhsat seri numarası nerede?"
          onClick={() => setSerialHelpOpen(false)}
        >
          <div
            className="quote__modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="quote__modal-close"
              onClick={() => setSerialHelpOpen(false)}
              aria-label="Kapat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <h3 className="quote__modal-title">
              Ruhsat seri numaranızı nerede bulabilirsiniz?
            </h3>
            <img
              src="/ruhsat-seri.jpg"
              alt="Araç ruhsatında seri numarasının yeri"
              className="quote__modal-image"
            />
          </div>
        </div>
      )}

      {vehicleNoHelpOpen && (
        <div
          className="quote__modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Motor ve şasi numarası nerede?"
          onClick={() => setVehicleNoHelpOpen(false)}
        >
          <div
            className="quote__modal quote__modal--compact"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="quote__modal-close"
              onClick={() => setVehicleNoHelpOpen(false)}
              aria-label="Kapat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <h3 className="quote__modal-title">
              Motor ve Şasi numaranızı nerede bulabilirsiniz?
            </h3>
            <p className="quote__modal-text">
              Bu bilgileri, aracınızı satın alırken bayinin düzenlediği
              proforma faturada bulabilirsiniz.
            </p>
            <p className="quote__modal-text">
              Proforma faturanızı bayinizden talep edebilirsiniz.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
