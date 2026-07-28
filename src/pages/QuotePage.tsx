import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getProduct } from "../data/products";
import { productIcons } from "../data/productIcons";
import AdvisorVideo from "../components/AdvisorVideo";
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
  isValidMobilePhone,
  isValidPlate,
  isValidTckn,
  isValidVkn,
} from "../utils/validation";
import {
  createTalep,
  generateTalepNo,
  setContactPreference,
} from "../lib/supabase";
import "./QuotePage.css";

const TOTAL_STEPS = 2;
const STEP_TITLES = ["Kimlik Bilgileri", "Teklif Detayları"] as const;
const VEHICLE_PRODUCT_SLUGS = new Set([
  "kasko",
  "trafik-sigortasi",
  "imm",
  "yesil-kart",
]);
const HEALTH_PRODUCT_SLUGS = new Set([
  "tamamlayici-saglik",
  "ozel-saglik",
  "seyahat-saglik",
]);
const SECOND_STEP_VIDEO = "/advisor-2.mp4";
const SECOND_STEP_TRANSCRIPT =
  "Teşekkür ederim. Son adıma geçiyoruz. Lütfen kalan iki bilgiyi de paylaşın. Ardından sizin için en uygun sigorta tekliflerini hazırlayacağım.";

const WHATSAPP_NUMBER = "908503020032";

const INSURED_FOR_LABELS: Record<string, string> = {
  self: "Kendim",
  spouse: "Eşim",
  children: "Çocuğum",
};

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
  const [entityType, setEntityType] = useState<"sahis" | "sirket">("sahis");
  const [tckn, setTckn] = useState("");
  const [vkn, setVkn] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [hasPlate, setHasPlate] = useState(true);
  const [plate, setPlate] = useState("");
  const [documentSerial, setDocumentSerial] = useState("");
  const [engineNo, setEngineNo] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [serialHelpOpen, setSerialHelpOpen] = useState(false);
  const [vehicleNoHelpOpen, setVehicleNoHelpOpen] = useState(false);
  const [whyInfoOpen, setWhyInfoOpen] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [talepNo, setTalepNo] = useState("");
  const [contactChoice, setContactChoice] = useState<"hemen" | "tarihli" | null>(
    null,
  );
  const [contactDate, setContactDate] = useState("");
  const [contactTime, setContactTime] = useState("");
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);
  const [talepCopied, setTalepCopied] = useState(false);

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
          Anasayfaya dön
        </Link>
      </div>
    );
  }

  const isVehicleProduct = VEHICLE_PRODUCT_SLUGS.has(product.slug);
  const isHealthProduct = HEALTH_PRODUCT_SLUGS.has(product.slug);
  /** Kasko tarzı adım 1: TCKN/VKN + telefon (DASK vb. dahil; sağlık hariç) */
  const usesIdentityPhoneStep = isVehicleProduct || !isHealthProduct;
  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  const switchEntityType = (type: "sahis" | "sirket") => {
    if (type === entityType) return;
    setEntityType(type);
    setTckn("");
    setVkn("");
    clearError("tckn");
    clearError("vkn");
  };

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
    if (entityType === "sahis") {
      if (!isValidTckn(tckn)) {
        next.tckn = "Geçerli bir T.C. Kimlik Numarası girin (11 hane).";
      }
    } else if (!isValidVkn(vkn)) {
      next.vkn = "Geçerli bir Vergi Numarası girin (10 hane).";
    }
    if (usesIdentityPhoneStep && !isValidMobilePhone(phone)) {
      next.phone = "Geçerli bir cep telefonu girin (05XX XXX XX XX).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    if (!birthDate) {
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

  const whatsappMessage = [
    `Merhaba, sigortauzmani.net üzerinden ${product.title} teklif talebi oluşturdum.`,
    talepNo ? `Talep numaram: ${talepNo}` : null,
    "Süreci WhatsApp üzerinden devam ettirmek istiyorum. Fiyat ve teminat seçenekleri hakkında yardımcı olabilir misiniz?",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

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
      tckn: entityType === "sahis" ? tckn || null : null,
      vergi_no: entityType === "sirket" ? vkn || null : null,
      phone: phone || null,
      birth_date: birthDate || null,
      plate: isVehicleProduct && hasPlate ? plate || null : null,
      document_serial:
        isVehicleProduct && hasPlate ? documentSerial || null : null,
      motor_no: isVehicleProduct && !hasPlate ? engineNo || null : null,
      sasi_no: isVehicleProduct && !hasPlate ? chassisNo || null : null,
    });
    setCompleted(true);
  };

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

  const startNewQuote = () => {
    setInsuredFor("self");
    setStep(1);
    setEntityType("sahis");
    setTckn("");
    setVkn("");
    setPhone("");
    setBirthDate("");
    setHasPlate(true);
    setPlate("");
    setDocumentSerial("");
    setEngineNo("");
    setChassisNo("");
    setSerialHelpOpen(false);
    setVehicleNoHelpOpen(false);
    setWhyInfoOpen(false);
    setKvkkAccepted(false);
    setPrivacyAccepted(false);
    setCompleted(false);
    setErrors({});
    setTalepNo("");
    setContactChoice(null);
    setContactDate("");
    setContactTime("");
    setPrefSaving(false);
    setPrefSaved(false);
    setTalepCopied(false);
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

                <div className="quote__success-hero">
                  <div className="quote__success-cat" aria-hidden="true">
                    <DotLottieReact src="/cat.lottie" autoplay loop />
                  </div>
                  <span className="quote__success-badge">
                    <span className="quote__success-badge-check" aria-hidden="true">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    Talebiniz başarıyla oluşturuldu
                  </span>
                  <h2 className="quote__success-title">
                    {product.title} teklif talebiniz alındı
                  </h2>
                  <p className="quote__success-sub">
                    Uzmanımız en kısa sürede sizinle iletişime geçecek.
                    Dilerseniz aşağıdan iletişim tercihinizi belirleyin.
                  </p>
                </div>

                <div className="quote__ticket">
                  <div className="quote__ticket-info">
                    <span className="quote__ticket-label">Talep Numaranız</span>
                    <span className="quote__ticket-value">{talepNo}</span>
                  </div>
                  <button
                    type="button"
                    className={`quote__ticket-copy ${talepCopied ? "quote__ticket-copy--done" : ""}`}
                    onClick={copyTalepNo}
                    aria-label={talepCopied ? "Talep numarası kopyalandı" : "Talep numarasını kopyala"}
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
                        Kopyalandı
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
                        Kopyala
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
                        <h3 className="quote__panel-title">Sizi Arayalım</h3>
                        <p className="quote__panel-sub">Ne zaman aranmak istersiniz?</p>
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
                      ? "Tercihiniz kaydedildi. Uzmanımız en kısa sürede sizi arayacak."
                      : `Tercihiniz kaydedildi. ${formatDate(contactDate)} tarihinde ${contactTime} saatleri arasında aranacaksınız.`}
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
                        Hemen
                      </button>
                      <button
                        type="button"
                        className={`quote__pref-option ${contactChoice === "tarihli" ? "quote__pref-option--active" : ""}`}
                        onClick={() => setContactChoice("tarihli")}
                        disabled={prefSaving}
                      >
                        Tarih Seç
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
                          aria-label="Aranmak istediğiniz tarih"
                        />
                        <select
                          className="quote__input quote__select"
                          value={contactTime}
                          onChange={(event) => setContactTime(event.target.value)}
                          aria-label="Aranmak istediğiniz saat aralığı"
                        >
                          <option value="">Saat aralığı seçin</option>
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
                          {prefSaving ? "Kaydediliyor..." : "Tercihi Kaydet"}
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
                        <h3 className="quote__panel-title">Beklemeden Bağlanın</h3>
                        <p className="quote__panel-sub">
                          Süreci WhatsApp üzerinden hemen sürdürün.
                        </p>
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
                      Sigorta Uzmanına Bağlan
                    </a>
                    <p className="quote__panel-note">
                      +90 850 302 00 32 numaralı hattımıza yönlendirileceksiniz.
                      Mesajınız hazır olacak, yalnızca göndermeniz yeterli.
                    </p>
                  </section>
                </div>

                <div className="quote__success-footer">
                  <span className="quote__success-footer-text">
                    Başka bir ihtiyacınız mı var?
                  </span>
                  <div className="quote__success-footer-actions">
                    <button
                      type="button"
                      className="quote__again"
                      onClick={startNewQuote}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Yeni teklif oluştur
                    </button>
                    <Link to="/" className="quote__browse">
                      Tüm ürünleri incele
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
                    <div
                      className="quote__toggle"
                      role="group"
                      aria-label="Sigortalı türü"
                    >
                      <button
                        type="button"
                        className={`quote__toggle-option ${entityType === "sahis" ? "quote__toggle-option--active" : ""}`}
                        onClick={() => switchEntityType("sahis")}
                      >
                        Şahıs
                      </button>
                      <button
                        type="button"
                        className={`quote__toggle-option ${entityType === "sirket" ? "quote__toggle-option--active" : ""}`}
                        onClick={() => switchEntityType("sirket")}
                      >
                        Şirket
                      </button>
                    </div>

                    {usesIdentityPhoneStep ? (
                      <>
                        {entityType === "sahis" ? (
                          <div className="quote__field">
                            <input
                              type="text"
                              className={`quote__input ${errors.tckn ? "quote__input--error" : ""}`}
                              inputMode="numeric"
                              placeholder="T.C. Kimlik Numarası (XXXXXXXXXXX)"
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
                        ) : (
                          <div className="quote__field">
                            <input
                              type="text"
                              className={`quote__input ${errors.vkn ? "quote__input--error" : ""}`}
                              inputMode="numeric"
                              placeholder="Vergi Numarası (XXXXXXXXXX)"
                              value={vkn}
                              onChange={(event) => {
                                setVkn(event.target.value.replace(/\D/g, "").slice(0, 10));
                                clearError("vkn");
                              }}
                            />
                            {errors.vkn && (
                              <span className="quote__error">{errors.vkn}</span>
                            )}
                          </div>
                        )}
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
                            <option value="children">Çocuğum</option>
                          </select>
                        </label>
                        {entityType === "sahis" ? (
                          <label className="quote__field">
                            <span>T.C. Kimlik Numarası</span>
                            <input
                              type="text"
                              className={`quote__input ${errors.tckn ? "quote__input--error" : ""}`}
                              inputMode="numeric"
                              placeholder="T.C. Kimlik Numarası (XXXXXXXXXXX)"
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
                        ) : (
                          <label className="quote__field">
                            <span>Vergi Numarası</span>
                            <input
                              type="text"
                              className={`quote__input ${errors.vkn ? "quote__input--error" : ""}`}
                              inputMode="numeric"
                              placeholder="Vergi Numarası (XXXXXXXXXX)"
                              value={vkn}
                              onChange={(event) => {
                                setVkn(event.target.value.replace(/\D/g, "").slice(0, 10));
                                clearError("vkn");
                              }}
                            />
                            {errors.vkn && (
                              <span className="quote__error">{errors.vkn}</span>
                            )}
                          </label>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      className="quote__why"
                      onClick={() => setWhyInfoOpen((open) => !open)}
                      aria-expanded={whyInfoOpen}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Neden bu bilgilere ihtiyacımız var?
                    </button>
                    {whyInfoOpen && (
                      <p className="quote__why-info">
                        Bu bilgiler yalnızca sigorta şirketlerinin sistemlerinde
                        size özel teklif sorgulaması yapmak için kullanılır.
                        Sistemlerimize kaydedilmez, işlem süresince geçici
                        olarak tutulur; üçüncü kişilerle paylaşılmaz ve KVKK
                        kapsamında güvenle işlenir.
                      </p>
                    )}

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
                      </>
                    ) : isHealthProduct ? (
                      <>
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
                    ) : (
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

                    <div className="quote__form-footer">
                      <div className="quote__consents">
                        <label className="quote__consent">
                          <input
                            type="checkbox"
                            checked={kvkkAccepted && privacyAccepted}
                            onChange={(event) => {
                              setKvkkAccepted(event.target.checked);
                              setPrivacyAccepted(event.target.checked);
                            }}
                            required
                          />
                          <span>
                            <button type="button" className="quote__consent-link">
                              KVKK
                            </button>
                            {" ve "}
                            <button type="button" className="quote__consent-link">
                              Gizlilik Politikası
                            </button>
                            &rsquo;nı okudum; kişisel verilerimin işlenmesini
                            kabul ediyorum.
                          </span>
                        </label>
                      </div>

                      <button type="submit" className="quote__submit">
                        Teklifleri Gör
                      </button>
                    </div>
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
