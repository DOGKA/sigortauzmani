import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  IPTAL_BRANS_LABELS,
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
import FormKvkkNotu from "../components/FormKvkkNotu";
import { localizeIptalError } from "../lib/i18n/cancel";
import { interpolate, localeTag } from "../lib/i18n/format";
import { useLocale, useT } from "../lib/i18n/context";
import { CONTACT_PHONE_DISPLAY } from "../lib/seo/config";
import { useStaticPageSeo } from "../lib/seo/useStaticPageSeo";
import "./PolicyCancelPage.css";

type Tab = "basvuru" | "takip";
type Step = 1 | 2 | "success";

const BRANS_KEYS = Object.keys(IPTAL_BRANS_LABELS) as IptalBrans[];

export default function PolicyCancelPage() {
  const { locale, href } = useLocale();
  const t = useT();
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
  const [iptalNoCopied, setIptalNoCopied] = useState(false);
  const [takipCode, setTakipCode] = useState("");
  const [takipLoading, setTakipLoading] = useState(false);
  const [takipError, setTakipError] = useState<string | null>(null);
  const [takipResult, setTakipResult] = useState<IptalTakipResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  useStaticPageSeo(href("policyCancel"));

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
    if (!brans) next.brans = t.cancel.errPolicy;
    if (adSoyad.trim().length < 3) next.adSoyad = t.cancel.errName;
    if (!isValidMobilePhone(phone)) next.phone = t.cancel.errPhone;

    const idDigits = kimlik.replace(/\D/g, "");
    if (idDigits.length === 11) {
      if (!isValidTckn(idDigits)) next.kimlik = t.cancel.errTckn;
    } else if (idDigits.length === 10) {
      if (!isValidVkn(idDigits)) next.kimlik = t.cancel.errVkn;
    } else {
      next.kimlik = t.cancel.errId;
    }

    if (!isValidPlate(plate)) {
      next.plate = t.cancel.errPlate;
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
      setErrors({ file: t.cancel.errFile });
      return;
    }
    if (!brans) return;

    setSubmitting(true);
    setSubmitError(null);
    clearError("file");

    const no = generateIptalNo();
    const upload = await uploadIptalBelge(no, file);
    if ("error" in upload) {
      setSubmitError(localizeIptalError(upload.error, t.cancel));
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

    if (result.ok === false) {
      setSubmitError(localizeIptalError(result.error, t.cancel));
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
    if (result.ok === false) {
      setTakipError(localizeIptalError(result.error, t.cancel));
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

  const copyIptalNo = async () => {
    if (!iptalNo) return;
    try {
      await navigator.clipboard.writeText(iptalNo);
    } catch {
      const input = document.createElement("textarea");
      input.value = iptalNo;
      input.setAttribute("readonly", "");
      input.style.position = "absolute";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setIptalNoCopied(true);
    window.setTimeout(() => setIptalNoCopied(false), 2000);
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
    setIptalNoCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="iptal">
      <div className="iptal__bg" aria-hidden="true">
        <div className="iptal__blob iptal__blob--1" />
        <div className="iptal__blob iptal__blob--2" />
      </div>

      <div className="iptal__shell">
        <nav className="iptal__breadcrumb" aria-label={t.cancel.breadcrumb}>
          <Link to={href("home")}>{t.legal.home}</Link>
          <span aria-hidden="true">/</span>
          <span>{t.cancel.h1}</span>
        </nav>

        <div className="iptal__card">
          <aside className="iptal__sidebar">
            <h1>{t.cancel.h1}</h1>
            <nav className="iptal__side-nav" aria-label={t.cancel.sideNav}>
              <button
                type="button"
                className={tab === "basvuru" ? "is-active" : ""}
                onClick={() => setTab("basvuru")}
              >
                {t.cancel.applyTitle}
                {tab === "basvuru" && <span aria-hidden="true">›</span>}
              </button>
              <button
                type="button"
                className={tab === "takip" ? "is-active" : ""}
                onClick={() => setTab("takip")}
              >
                {t.cancel.trackTitle}
                {tab === "takip" && <span aria-hidden="true">›</span>}
              </button>
            </nav>
            <p className="iptal__info">
              {(() => {
                const text = interpolate(t.cancel.intro, {
                  phone: CONTACT_PHONE_DISPLAY,
                  track: t.cancel.trackTitle,
                });
                const [before, after] = text.split(CONTACT_PHONE_DISPLAY);
                return (
                  <>
                    {before}
                    <a href="tel:+908503020032">{CONTACT_PHONE_DISPLAY}</a>
                    {after}
                  </>
                );
              })()}
            </p>
          </aside>

          <div className="iptal__content">
            {tab === "takip" ? (
              <section className="iptal__takip" aria-labelledby="takip-title">
                <h2 id="takip-title">{t.cancel.trackTitle}</h2>
                <p>{t.cancel.trackLead}</p>
                <form
                  className="iptal__takip-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void runTakipQuery();
                  }}
                >
                  <label className="iptal__field">
                    <span>{t.cancel.trackNo}</span>
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
                    {takipLoading ? t.cancel.querying : t.cancel.query}
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
                      <span>{t.cancel.status}</span>
                      <strong
                        className={`iptal__takip-badge iptal__takip-badge--${takipResult.status}`}
                      >
                        {t.cancel.statuses[takipResult.status]}
                      </strong>
                    </div>
                    <dl className="iptal__takip-dl">
                      <div>
                        <dt>{t.cancel.trackNoShort}</dt>
                        <dd>{takipResult.iptal_no}</dd>
                      </div>
                      <div>
                        <dt>{t.cancel.subject}</dt>
                        <dd>{t.cancel.brans[takipResult.brans]}</dd>
                      </div>
                      <div>
                        <dt>{t.cancel.fullName}</dt>
                        <dd>{takipResult.ad_soyad_masked}</dd>
                      </div>
                      <div>
                        <dt>{t.cancel.phone}</dt>
                        <dd>{takipResult.phone_masked}</dd>
                      </div>
                      <div>
                        <dt>{t.cancel.plate}</dt>
                        <dd>{takipResult.plate_masked}</dd>
                      </div>
                      <div>
                        <dt>{t.cancel.appliedAt}</dt>
                        <dd>
                          {new Date(takipResult.created_at).toLocaleString(
                            localeTag(locale),
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </dd>
                      </div>
                    </dl>
                    {takipResult.aciklama && (
                      <aside className="iptal__takip-note-box" role="note">
                        <strong>{t.cancel.notice}</strong>
                        <p>{takipResult.aciklama}</p>
                      </aside>
                    )}
                    <p className="iptal__takip-privacy">{t.cancel.idHidden}</p>
                  </div>
                )}
              </section>
            ) : step === "success" ? (
              <section className="iptal__success" aria-labelledby="success-title">
                <div className="iptal__success-icon" aria-hidden="true">
                  ✓
                </div>
                <h2 id="success-title">{t.cancel.received}</h2>
                <p>{t.cancel.receivedLead}</p>
                <div className="iptal__success-code">
                  <div>
                    <span>{t.cancel.yourTrackNo}</span>
                    <strong>{iptalNo}</strong>
                  </div>
                  <button
                    type="button"
                    className={`iptal__copy-btn ${iptalNoCopied ? "is-copied" : ""}`}
                    onClick={() => void copyIptalNo()}
                    aria-label={
                      iptalNoCopied ? t.cancel.copiedAria : t.cancel.copyAria
                    }
                  >
                    {iptalNoCopied ? t.cancel.copied : t.cancel.copy}
                  </button>
                </div>
                <div className="iptal__actions">
                  <button
                    type="button"
                    className="iptal__btn"
                    onClick={() => goToTakip(iptalNo ?? undefined)}
                  >
                    {t.cancel.follow}
                  </button>
                  <button type="button" className="iptal__btn iptal__btn--ghost" onClick={resetForm}>
                    {t.cancel.newApply}
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
                    {t.cancel.basics}
                  </button>
                  <button
                    type="button"
                    role="listitem"
                    className={`iptal__step ${step === 2 ? "is-active" : ""}`}
                    disabled={step !== 2}
                  >
                    <span className="iptal__step-num">2</span>
                    {t.cancel.deed}
                  </button>
                </div>

                <div className="iptal__progress">
                  <p className="iptal__progress-line">
                    <span className="iptal__progress-count">
                      {interpolate(t.cancel.stepOf, { step: String(step) })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <strong>{step === 1 ? t.cancel.basics : t.cancel.deed}</strong>
                  </p>
                  <span className="iptal__progress-bar" aria-hidden="true">
                    <i className="is-done" />
                    <i className={step === 2 ? "is-done" : ""} />
                  </span>
                </div>

                {step === 1 && (
                  <section className="iptal__panel" aria-label={t.cancel.basics}>
                    <div className="iptal__fields">
                      <label className="iptal__field">
                        <span>{t.cancel.policyType}</span>
                        <select
                          value={brans}
                          onChange={(e) => {
                            setBrans(e.target.value as IptalBrans | "");
                            clearError("brans");
                          }}
                        >
                          <option value="">{t.cancel.policyPlaceholder}</option>
                          {BRANS_KEYS.map((value) => (
                            <option key={value} value={value}>
                              {t.cancel.brans[value]}
                            </option>
                          ))}
                        </select>
                        {errors.brans && (
                          <em className="iptal__error">{errors.brans}</em>
                        )}
                      </label>

                      <label className="iptal__field">
                        <span>{t.cancel.fullName}</span>
                        <input
                          type="text"
                          value={adSoyad}
                          onChange={(e) => {
                            setAdSoyad(e.target.value);
                            clearError("adSoyad");
                          }}
                          placeholder={t.cancel.namePlaceholder}
                          autoComplete="name"
                        />
                        {errors.adSoyad && (
                          <em className="iptal__error">{errors.adSoyad}</em>
                        )}
                      </label>

                      <label className="iptal__field">
                        <span>{t.cancel.phone}</span>
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
                        <span>{t.cancel.ownerId}</span>
                        <input
                          type="text"
                          value={kimlik}
                          onChange={(e) => {
                            setKimlik(e.target.value.replace(/\D/g, "").slice(0, 11));
                            clearError("kimlik");
                          }}
                          placeholder={t.cancel.ownerIdPlaceholder}
                          inputMode="numeric"
                        />
                        {errors.kimlik && (
                          <em className="iptal__error">{errors.kimlik}</em>
                        )}
                      </label>

                      <div className="iptal__field">
                        <span>{t.cancel.plateNo}</span>
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
                            aria-label={t.cancel.cityCode}
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
                            aria-label={t.cancel.letters}
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
                            aria-label={t.cancel.digits}
                          />
                        </div>
                        {errors.plate && (
                          <em className="iptal__error">{errors.plate}</em>
                        )}
                      </div>
                    </div>

                    <FormKvkkNotu variant="iptal" />

                    <div className="iptal__actions iptal__actions--end">
                      <button
                        type="button"
                        className="iptal__btn"
                        onClick={onContinueStep1}
                      >
                        {t.cancel.continue}
                      </button>
                    </div>
                  </section>
                )}

                {step === 2 && (
                  <section className="iptal__panel" aria-label={t.cancel.deed}>
                    <p className="iptal__panel-lead">{t.cancel.deedLead}</p>

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
                              {interpolate(t.cancel.replaceFile, {
                                size: (file.size / (1024 * 1024)).toFixed(2),
                              })}
                            </span>
                          </>
                        ) : (
                          <>
                            <strong>{t.cancel.upload}</strong>
                            <span>{t.cancel.uploadHint}</span>
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
                        {t.cancel.back}
                      </button>
                      <button
                        type="button"
                        className="iptal__btn"
                        onClick={() => void onSubmit()}
                        disabled={submitting || !file}
                      >
                        {submitting ? t.cancel.submitting : t.cancel.submit}
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
