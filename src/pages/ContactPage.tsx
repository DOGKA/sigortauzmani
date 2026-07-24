import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  createIletisimTalep,
  generateIletisimNo,
  uploadIletisimBelge,
  type IletisimOncelik,
} from "../lib/supabase";
import "./ContactPage.css";

const PAGE_TITLE = "İletişim | Sigorta Uzmanı";
const PAGE_DESCRIPTION =
  "Sigorta hakkındaki sorularınızı Sigorta Uzmanı ekibine iletin.";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

type FormErrors = Partial<
  Record<"name" | "email" | "subject" | "message" | "file" | "consent", string>
>;

export default function ContactPage() {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<IletisimOncelik>("normal");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceNo, setReferenceNo] = useState<string | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;
    let meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", PAGE_DESCRIPTION);

    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
    };
  }, []);

  const clearError = (key: keyof FormErrors) => {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const next: FormErrors = {};
    if (name.trim().length < 2) next.name = "Adınızı ve soyadınızı yazın.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Geçerli bir e-posta adresi yazın.";
    }
    if (subject.trim().length < 3) next.subject = "Konuyu kısaca belirtin.";
    if (message.trim().length < 10) {
      next.message = "Mesajınız en az 10 karakter olmalıdır.";
    }
    if (!consent) next.consent = "Devam etmek için onay vermelisiniz.";
    if (file && !ALLOWED_FILE_TYPES.includes(file.type)) {
      next.file = "Yalnızca PDF, JPG, PNG veya WebP yükleyebilirsiniz.";
    } else if (file && file.size > MAX_FILE_BYTES) {
      next.file = "Belge boyutu en fazla 5 MB olabilir.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setReferenceNo(null);
    if (!validate()) return;

    // Botların doldurduğu görünmez alan.
    if (website) {
      setReferenceNo(generateIletisimNo());
      return;
    }

    setSubmitting(true);
    const iletisimNo = generateIletisimNo();
    let belgePath: string | null = null;

    if (file) {
      const upload = await uploadIletisimBelge(iletisimNo, file);
      if ("error" in upload) {
        setSubmitError(upload.error);
        setSubmitting(false);
        return;
      }
      belgePath = upload.path;
    }

    const result = await createIletisimTalep(
      {
        iletisim_no: iletisimNo,
        ad_soyad: name.trim(),
        email: email.trim().toLowerCase(),
        konu: subject.trim(),
        oncelik: priority,
        mesaj: message.trim(),
        belge_path: belgePath,
      },
      file,
    );
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setReferenceNo(iletisimNo);
    setName("");
    setEmail("");
    setSubject("");
    setPriority("normal");
    setMessage("");
    setFile(null);
    setConsent(false);
    setWebsite("");
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="contact">
      <section className="contact__hero">
        <div className="contact__glow" aria-hidden="true" />
        <div className="contact__container">
          <nav className="contact__breadcrumb" aria-label="Sayfa yolu">
            <Link to="/">Ana Sayfa</Link>
            <span aria-hidden="true">/</span>
            <span>İletişim</span>
          </nav>
          <span className="contact__eyebrow">Size nasıl yardımcı olabiliriz?</span>
          <h1>
            Sorunuzu iletin,
            <span> uzmanlarımız yanıtlasın.</span>
          </h1>
          <p>
            Sigorta işlemlerinizle ilgili sorunuzu ve varsa belgenizi gönderin.
            Ekibimiz mesajınızı öncelik sırasına göre inceleyecektir.
          </p>
        </div>
      </section>

      <section className="contact__content">
        <div className="contact__container contact__grid">
          <aside className="contact__intro">
            <span className="contact__section-label">Bize yazın</span>
            <h2>Tek bir form, doğrudan uzman desteği</h2>
            <p>
              Fiziksel adres bilgisi paylaşmadan, tüm sorularınızı güvenli
              biçimde çevrim içi olarak iletebilirsiniz.
            </p>
            <a className="contact__mail" href="mailto:sigorta@sigortauzmani.net">
              <span aria-hidden="true">@</span>
              <span>
                <small>E-posta</small>
                sigorta@sigortauzmani.net
              </span>
            </a>
          </aside>

          <form className="contact__form" onSubmit={handleSubmit} noValidate>
            {referenceNo && (
              <div className="contact__success" role="status">
                <strong>Mesajınız bize ulaştı.</strong>
                <span>Referans numaranız: {referenceNo}</span>
              </div>
            )}
            {submitError && (
              <div className="contact__submit-error" role="alert">
                {submitError}
              </div>
            )}

            <div className="contact__honeypot" aria-hidden="true">
              <label htmlFor="contact-website">Web sitesi</label>
              <input
                id="contact-website"
                name="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="contact__row">
              <label className="contact__field">
                <span>Ad soyad</span>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearError("name");
                  }}
                  maxLength={100}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  placeholder="Adınız Soyadınız"
                />
                {errors.name && <em>{errors.name}</em>}
              </label>
              <label className="contact__field">
                <span>E-posta</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                  }}
                  maxLength={160}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  placeholder="ornek@email.com"
                />
                {errors.email && <em>{errors.email}</em>}
              </label>
            </div>

            <label className="contact__field">
              <span>Konu</span>
              <input
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value);
                  clearError("subject");
                }}
                maxLength={160}
                aria-invalid={Boolean(errors.subject)}
                placeholder="Sorunuzun konusu"
              />
              {errors.subject && <em>{errors.subject}</em>}
            </label>

            <fieldset className="contact__priority">
              <legend>Aciliyet</legend>
              <div>
                {(
                  [
                    ["normal", "Normal"],
                    ["oncelikli", "Öncelikli"],
                    ["acil", "Acil"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="priority"
                      value={value}
                      checked={priority === value}
                      onChange={() => setPriority(value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="contact__field">
              <span>Mesajınız</span>
              <textarea
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  clearError("message");
                }}
                maxLength={3000}
                rows={6}
                aria-invalid={Boolean(errors.message)}
                placeholder="Size nasıl yardımcı olabiliriz?"
              />
              <span className="contact__counter">{message.length}/3000</span>
              {errors.message && <em>{errors.message}</em>}
            </label>

            <div className="contact__upload">
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  clearError("file");
                }}
              />
              <label htmlFor={fileInputId}>
                <span className="contact__upload-icon" aria-hidden="true">+</span>
                <span>
                  <strong>{file ? file.name : "Belge ekle (isteğe bağlı)"}</strong>
                  <small>
                    {file
                      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB — değiştirmek için tıklayın`
                      : "PDF, JPG, PNG veya WebP · En fazla 5 MB"}
                  </small>
                </span>
              </label>
              {errors.file && <em>{errors.file}</em>}
            </div>

            <label className="contact__consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  clearError("consent");
                }}
              />
              <span>
                Bilgilerimin talebime yanıt verilmesi amacıyla işlenmesini
                kabul ediyorum.
              </span>
            </label>
            {errors.consent && (
              <em className="contact__consent-error">{errors.consent}</em>
            )}

            <button className="contact__submit" disabled={submitting}>
              {submitting ? "Gönderiliyor…" : "Mesajı Gönder"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
