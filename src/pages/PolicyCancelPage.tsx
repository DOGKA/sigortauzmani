import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  IPTAL_BRANS_LABELS,
  IPTAL_STATUS_LABELS,
  type IptalBrans,
  type IptalTakipResult,
  createIptalTalep,
  generateIptalNo,
  lookupIptalTakip,
  uploadIptalBelge,
} from "../lib/supabase";
import {
  formatPhoneInput,
  isValidMobilePhone,
  isValidPlate,
  isValidTckn,
  isValidVkn,
} from "../utils/validation";
import "./PolicyCancelPage.css";

type Tab = "basvuru" | "takip";
type Step = 1 | 2 | "success";

const BRANS_OPTIONS = (
  Object.keys(IPTAL_BRANS_LABELS) as IptalBrans[]
).map((value) => ({ value, label: IPTAL_BRANS_LABELS[value] }));

const PAGE_TITLE = "Poliçe İptal İşlemleri | Sigorta Uzmanı";
const PAGE_DESCRIPTION =
  "Araç satışı nedeniyle poliçe iptal başvurusu yapın veya iptal talebinizi takip edin.";

function formatTakipDate(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PolicyCancelPage() {
  const [tab, setTab] = useState<Tab>("basvuru");
  const [step, setStep] = useState<Step>(1);
  const [brans, setBrans] = useState<IptalBrans | "">("");
  const [adSoyad, setAdSoyad] = useState("");
  const [phone, setPhone] = useState("");
  const [kimlik, setKimlik] = useState("");
  const [plateCity, setPlateCity] = useState("");
  const [plateLetters, setPlateLetters] = useState("");
  const [plateNumbers, setPlateNumbers] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [iptalNo, setIptalNo] = useState<string | null>(null);
  const [takipCode, setTakipCode] = useState("");
  const [takipLoading, setTakipLoading] = useState(false);
  const [takipError, setTakipError] = useState<string | null>(null);
  const [takipResult, setTakipResult] = useState<IptalTakipResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;
    let meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta?.getAttribute("content") ?? "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", PAGE_DESCRIPTION);
    return () => {
      document.title = prevTitle;
      meta?.setAttribute("content", prevDescription);
    };
  }, []);

  const plate = `${plateCity}${plateLetters}${plateNumbers}`.toUpperCase();

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!brans) next.brans = "Branş seçin.";
    if (adSoyad.trim().length < 3) next.adSoyad = "Ad soyad girin.";
    if (!isValidMobilePhone(phone)) next.phone = "Geçerli bir cep telefonu girin.";

    const idDigits = kimlik.replace(/\D/g, "");
    if (idDigits.length === 11) {
      if (!isValidTckn(idDigits)) next.kimlik = "Geçerli bir T.C. kimlik no girin.";
    } else if (idDigits.length === 10) {
      if (!isValidVkn(idDigits)) next.kimlik = "Geçerli bir vergi kimlik no girin.";
    } else {
      next.kimlik = "TCKN (11 hane) veya Vergi No (10 hane) girin.";
    }

    if (!isValidPlate(plate)) {
      next.plate = "Geçerli bir plaka girin.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onContinueStep1 = () => {
    if (!validateStep1()) return;
    setStep(2);
    setSubmitError(null);
  };

  const onSubmit = async () => {
    if (!file) {
      setErrors({ file: "Noter satış sözleşmesini yükleyin." });
      return;
    }
    if (!brans) return;

    setSubmitting(true);
    setSubmitError(null);
    clearError("file");

    const no = generateIptalNo();
    const upload = await uploadIptalBelge(no, file);
    if ("error" in upload) {
      setSubmitError(upload.error);
      setSubmitting(false);
      return;
    }

    const idDigits = kimlik.replace(/\D/g, "");
    const result = await createIptalTalep({
      iptal_no: no,
      brans,
      ad_soyad: adSoyad.trim(),
      phone: phone.replace(/\D/g, ""),
      tckn: idDigits.length === 11 ? idDigits : null,
      vergi_no: idDigits.length === 10 ? idDigits : null,
      plate,
      belge_path: upload.path,
    });

    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setIptalNo(no);
    setStep("success");
  };

  const runTakipQuery = async (code = takipCode) => {
    setTakipLoading(true);
    setTakipError(null);
    setTakipResult(null);
    const result = await lookupIptalTakip(code);
    setTakipLoading(false);
    if (!result.ok) {
      setTakipError(result.error);
      return;
    }
    setTakipResult(result.data);
  };

  const goToTakip = (code?: string) => {
    const value = (code ?? iptalNo ?? "").toUpperCase();
    setTakipCode(value);
    setTakipResult(null);
    setTakipError(null);
    setTab("takip");
    if (value.length >= 8) {
      void runTakipQuery(value);
    }
  };

  const resetForm = () => {
    setStep(1);
    setBrans("");
    setAdSoyad("");
    setPhone("");
    setKimlik("");
    setPlateCity("");
    setPlateLetters("");
    setPlateNumbers("");
    setFile(null);
    setErrors({});
    setSubmitError(null);
    setIptalNo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="iptal">
      <div className="iptal__bg" aria-hidden="true">
        <div className="iptal__blob iptal__blob--1" />
        <div className="iptal__blob iptal__blob--2" />
      </div>

      <div className="iptal__shell">
        <nav className="iptal__breadcrumb" aria-label="Sayfa konumu">
          <Link to="/">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <span>Poliçe İptal İşlemleri</span>
        </nav>

        <div className="iptal__card">
          <aside className="iptal__sidebar">
            <h1>Poliçe İptal İşlemleri</h1>
            <nav className="iptal__side-nav" aria-label="İptal işlemleri">
              <button
                type="button"
                className={tab === "basvuru" ? "is-active" : ""}
                onClick={() => setTab("basvuru")}
              >
                Poliçe İptal Başvuru
                {tab === "basvuru" && <span aria-hidden="true">›</span>}
              </button>
              <button
                type="button"
                className={tab === "takip" ? "is-active" : ""}
                onClick={() => setTab("takip")}
              >
                Poliçe İptal Takip
                {tab === "takip" && <span aria-hidden="true">›</span>}
              </button>
            </nav>
            <p className="iptal__info">
              Web sitemizden sadece araç satış nedeniyle poliçe iptal talepleri
              alınmaktadır. Diğer iptaller için{" "}
              <a href="tel:+908503020032">0850 302 00 32</a> numarasını
              arayabilirsiniz. İptal sürecini poliçe iptal takip bölümünden
              bilgilerinizi doldurarak görüntüleyebilirsiniz.
            </p>
          </aside>

          <div className="iptal__content">
            {tab === "takip" ? (
              <section className="iptal__takip" aria-labelledby="takip-title">
                <h2 id="takip-title">Poliçe İptal Takip</h2>
                <p>
                  Başvuru sonunda aldığınız iptal takip numarasını girerek
                  talebinizin güncel durumunu görüntüleyin.
                </p>
                <form
                  className="iptal__takip-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void runTakipQuery();
                  }}
                >
                  <label className="iptal__field">
                    <span>İptal Takip Numarası</span>
                    <input
                      type="text"
                      value={takipCode}
                      onChange={(e) => {
                        setTakipCode(e.target.value.toUpperCase());
                        setTakipError(null);
                      }}
                      placeholder="IP-XXXXXX-XXXX"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </label>
                  <button
                    type="submit"
                    className="iptal__btn"
                    disabled={takipLoading || takipCode.trim().length < 8}
                  >
                    {takipLoading ? "Sorgulanıyor…" : "Sorgula"}
                  </button>
                </form>

                {takipError && (
                  <p className="iptal__submit-error" role="alert">
                    {takipError}
                  </p>
                )}

                {takipResult && (
                  <div className="iptal__takip-result">
                    <div className="iptal__takip-status">
                      <span>Durum</span>
                      <strong
                        className={`iptal__takip-badge iptal__takip-badge--${takipResult.status}`}
                      >
                        {IPTAL_STATUS_LABELS[takipResult.status]}
                      </strong>
                    </div>
                    <dl className="iptal__takip-dl">
                      <div>
                        <dt>Takip No</dt>
                        <dd>{takipResult.iptal_no}</dd>
                      </div>
                      <div>
                        <dt>İptal Konusu</dt>
                        <dd>{IPTAL_BRANS_LABELS[takipResult.brans]}</dd>
                      </div>
                      <div>
                        <dt>Ad Soyad</dt>
                        <dd>{takipResult.ad_soyad_masked}</dd>
                      </div>
                      <div>
                        <dt>Telefon</dt>
                        <dd>{takipResult.phone_masked}</dd>
                      </div>
                      <div>
                        <dt>Plaka</dt>
                        <dd>{takipResult.plate_masked}</dd>
                      </div>
                      <div>
                        <dt>Başvuru Tarihi</dt>
                        <dd>{formatTakipDate(takipResult.created_at)}</dd>
                      </div>
                    </dl>
                    {takipResult.aciklama && (
                      <aside className="iptal__takip-note-box" role="note">
                        <strong>Bilgilendirme</strong>
                        <p>{takipResult.aciklama}</p>
                      </aside>
                    )}
                    <p className="iptal__takip-privacy">
                      Kimlik numarası güvenlik nedeniyle gösterilmez.
                    </p>
                  </div>
                )}
              </section>
            ) : step === "success" ? (
              <section className="iptal__success" aria-labelledby="success-title">
                <div className="iptal__success-icon" aria-hidden="true">
                  ✓
                </div>
                <h2 id="success-title">Başvurunuz alındı</h2>
                <p>
                  Poliçe iptal talebiniz işleme alındı. Takip numaranızı not
                  edin; süreç tamamlandığında sizinle iletişime geçilecektir.
                </p>
                <div className="iptal__success-code">
                  <span>İptal Takip Numaranız</span>
                  <strong>{iptalNo}</strong>
                </div>
                <div className="iptal__actions">
                  <button
                    type="button"
                    className="iptal__btn"
                    onClick={() => goToTakip(iptalNo ?? undefined)}
                  >
                    Talebi Takip Et
                  </button>
                  <button type="button" className="iptal__btn iptal__btn--ghost" onClick={resetForm}>
                    Yeni Başvuru
                  </button>
                </div>
              </section>
            ) : (
              <>
                <div className="iptal__steps" role="list">
                  <button
                    type="button"
                    role="listitem"
                    className={`iptal__step ${step === 1 ? "is-active" : ""} ${step === 2 ? "is-done" : ""}`}
                    onClick={() => step === 2 && setStep(1)}
                  >
                    <span className="iptal__step-num">1</span>
                    Temel Bilgiler
                  </button>
                  <button
                    type="button"
                    role="listitem"
                    className={`iptal__step ${step === 2 ? "is-active" : ""}`}
                    disabled={step !== 2}
                  >
                    <span className="iptal__step-num">2</span>
                    Noter Satış Sözleşmesi
                  </button>
                </div>

                {step === 1 && (
                  <section className="iptal__panel" aria-label="Temel Bilgiler">
                    <div className="iptal__fields">
                      <label className="iptal__field">
                        <span>İptal Etmek İstediğin Poliçeler</span>
                        <select
                          value={brans}
                          onChange={(e) => {
                            setBrans(e.target.value as IptalBrans | "");
                            clearError("brans");
                          }}
                        >
                          <option value="">Branş</option>
                          {BRANS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {errors.brans && (
                          <em className="iptal__error">{errors.brans}</em>
                        )}
                      </label>

                      <label className="iptal__field">
                        <span>Ad Soyad</span>
                        <input
                          type="text"
                          value={adSoyad}
                          onChange={(e) => {
                            setAdSoyad(e.target.value);
                            clearError("adSoyad");
                          }}
                          placeholder="Ruhsat sahibi ad soyad"
                          autoComplete="name"
                        />
                        {errors.adSoyad && (
                          <em className="iptal__error">{errors.adSoyad}</em>
                        )}
                      </label>

                      <label className="iptal__field">
                        <span>Cep Telefonu</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(formatPhoneInput(e.target.value));
                            clearError("phone");
                          }}
                          placeholder="05XX XXX XX XX"
                          inputMode="tel"
                        />
                        {errors.phone && (
                          <em className="iptal__error">{errors.phone}</em>
                        )}
                      </label>

                      <label className="iptal__field">
                        <span>TCKN veya Vergi Kimlik No</span>
                        <input
                          type="text"
                          value={kimlik}
                          onChange={(e) => {
                            setKimlik(e.target.value.replace(/\D/g, "").slice(0, 11));
                            clearError("kimlik");
                          }}
                          placeholder="Ruhsat Sahibi TC No veya Vergi No"
                          inputMode="numeric"
                        />
                        {errors.kimlik && (
                          <em className="iptal__error">{errors.kimlik}</em>
                        )}
                      </label>

                      <div className="iptal__field">
                        <span>Araç Plaka No</span>
                        <div className="iptal__plate">
                          <input
                            type="text"
                            value={plateCity}
                            onChange={(e) => {
                              setPlateCity(
                                e.target.value.replace(/\D/g, "").slice(0, 2),
                              );
                              clearError("plate");
                            }}
                            placeholder="34"
                            inputMode="numeric"
                            aria-label="İl kodu"
                          />
                          <input
                            type="text"
                            value={plateLetters}
                            onChange={(e) => {
                              setPlateLetters(
                                e.target.value
                                  .replace(/[^a-zA-Z]/g, "")
                                  .toUpperCase()
                                  .slice(0, 3),
                              );
                              clearError("plate");
                            }}
                            placeholder="ABC"
                            aria-label="Harfler"
                          />
                          <input
                            type="text"
                            value={plateNumbers}
                            onChange={(e) => {
                              setPlateNumbers(
                                e.target.value.replace(/\D/g, "").slice(0, 5),
                              );
                              clearError("plate");
                            }}
                            placeholder="123"
                            inputMode="numeric"
                            aria-label="Rakamlar"
                          />
                        </div>
                        {errors.plate && (
                          <em className="iptal__error">{errors.plate}</em>
                        )}
                      </div>
                    </div>

                    <div className="iptal__actions iptal__actions--end">
                      <button
                        type="button"
                        className="iptal__btn"
                        onClick={onContinueStep1}
                      >
                        Devam
                      </button>
                    </div>
                  </section>
                )}

                {step === 2 && (
                  <section className="iptal__panel" aria-label="Noter Satış Sözleşmesi">
                    <p className="iptal__panel-lead">
                      Bu aşamada noter satış belgesini sisteme yüklemeniz
                      gerekiyor. Dosya yükle diyerek bilgisayarınızdan veya
                      telefonunuzdan fotoğraf / PDF seçebilirsiniz.
                    </p>

                    <div className="iptal__upload">
                      <input
                        ref={fileInputRef}
                        id={fileInputId}
                        type="file"
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const selected = e.target.files?.[0] ?? null;
                          setFile(selected);
                          clearError("file");
                          setSubmitError(null);
                        }}
                      />
                      <label htmlFor={fileInputId} className="iptal__upload-box">
                        {file ? (
                          <>
                            <strong>{file.name}</strong>
                            <span>
                              {(file.size / (1024 * 1024)).toFixed(2)} MB — değiştirmek
                              için tıklayın
                            </span>
                          </>
                        ) : (
                          <>
                            <strong>Dosya Yükle</strong>
                            <span>PDF, JPG veya PNG · en fazla 10 MB</span>
                          </>
                        )}
                      </label>
                      {errors.file && (
                        <em className="iptal__error">{errors.file}</em>
                      )}
                    </div>

                    {submitError && (
                      <p className="iptal__submit-error" role="alert">
                        {submitError}
                      </p>
                    )}

                    <div className="iptal__actions">
                      <button
                        type="button"
                        className="iptal__btn iptal__btn--ghost"
                        onClick={() => setStep(1)}
                        disabled={submitting}
                      >
                        Geri
                      </button>
                      <button
                        type="button"
                        className="iptal__btn"
                        onClick={() => void onSubmit()}
                        disabled={submitting}
                      >
                        {submitting ? "Gönderiliyor…" : "Başvuruyu Gönder"}
                      </button>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
