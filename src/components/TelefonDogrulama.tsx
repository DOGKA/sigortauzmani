/**
 * Telefon SMS doğrulaması: kod modalı ve onu söz (promise) olarak açan hook.
 *
 * Telefonun alındığı adımda "Devam"a basılınca `dogrula(phone)` çağrılıyor:
 * sunucu numarayı bu oturumda zaten doğruladıysa (ya da doğrulama kapalıysa)
 * modal hiç açılmadan `true` döner; değilse kod gönderilip modal açılır ve
 * söz kod doğrulanınca `true`, ziyaretçi vazgeçince `false` ile çözülür.
 *
 * İki akış da (`QuoteFlowPage`, `QuotePage`) kullandığı için stiller kendi
 * dosyasında; `flow__*` ya da `quote__*` sınıflarına bağlı değil.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SMS_KOD_UZUNLUGU } from "../data/smsDogrulama";
import { useT } from "../lib/i18n/context";
import { interpolate } from "../lib/i18n/format";
import { kodDogrula, kodGonder, type KodGonderSonucu } from "../lib/smsDogrulama";
import "./TelefonDogrulama.css";

type IlkGonderim = Exclude<KodGonderSonucu, { durum: "dogrulandi" }>;

interface ModalProps {
  phone: string;
  ilk: IlkGonderim;
  onDogrulandi: () => void;
  onKapat: () => void;
}

function TelefonDogrulamaModali({ phone, ilk, onDogrulandi, onKapat }: ModalProps) {
  const t = useT();
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState(ilk.durum === "hata" ? ilk.mesaj : "");
  const [maske, setMaske] = useState(ilk.durum === "gonderildi" ? ilk.telefon : phone);
  const [bitis, setBitis] = useState(() =>
    ilk.durum === "gonderildi" ? Date.now() + ilk.sureSaniye * 1000 : 0,
  );
  const [tekrar, setTekrar] = useState(() =>
    ilk.durum === "gonderildi"
      ? Date.now() + ilk.tekrarSaniye * 1000
      : Date.now() + (ilk.bekleSaniye ?? 0) * 1000,
  );
  const [simdi, setSimdi] = useState(() => Date.now());
  const [dogruluyor, setDogruluyor] = useState(false);
  const [gonderiyor, setGonderiyor] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const zamanlayici = window.setInterval(() => setSimdi(Date.now()), 1000);
    return () => window.clearInterval(zamanlayici);
  }, []);

  useEffect(() => {
    const kapat = (event: KeyboardEvent) => {
      if (event.key === "Escape") onKapat();
    };
    window.addEventListener("keydown", kapat);
    return () => window.removeEventListener("keydown", kapat);
  }, [onKapat]);

  const kalanSure = Math.max(0, Math.ceil((bitis - simdi) / 1000));
  const kalanTekrar = Math.max(0, Math.ceil((tekrar - simdi) / 1000));
  const kodGecerli = bitis > simdi;

  const yenidenGonder = async () => {
    setGonderiyor(true);
    setHata("");
    const sonuc = await kodGonder(phone, t.sms.failed);
    setGonderiyor(false);
    if (sonuc.durum === "dogrulandi") {
      onDogrulandi();
      return;
    }
    if (sonuc.durum === "gonderildi") {
      setMaske(sonuc.telefon);
      setBitis(Date.now() + sonuc.sureSaniye * 1000);
      setTekrar(Date.now() + sonuc.tekrarSaniye * 1000);
      setKod("");
      input.current?.focus();
      return;
    }
    setHata(sonuc.mesaj);
    if (sonuc.bekleSaniye) setTekrar(Date.now() + sonuc.bekleSaniye * 1000);
  };

  const dogrulaKod = async (deger: string) => {
    if (deger.length !== SMS_KOD_UZUNLUGU) {
      setHata(t.sms.codeLength);
      return;
    }
    setDogruluyor(true);
    setHata("");
    const sonuc = await kodDogrula(phone, deger, t.sms.failed);
    setDogruluyor(false);
    if (sonuc.durum === "dogrulandi") {
      onDogrulandi();
      return;
    }
    setHata(sonuc.mesaj);
    setKod("");
    if (sonuc.yeniKodGerekli) setBitis(Date.now());
    input.current?.focus();
  };

  const kodYaz = (value: string) => {
    const temiz = value.replace(/\D/g, "").slice(0, SMS_KOD_UZUNLUGU);
    setKod(temiz);
    if (temiz.length === SMS_KOD_UZUNLUGU && kodGecerli && !dogruluyor) {
      void dogrulaKod(temiz);
    }
  };

  return (
    <div
      className="tel-dogrulama__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tel-dogrulama-baslik"
    >
      <form
        className="tel-dogrulama__modal"
        onSubmit={(event) => {
          event.preventDefault();
          void dogrulaKod(kod);
        }}
      >
        <button
          type="button"
          className="tel-dogrulama__close"
          aria-label={t.flow.close}
          onClick={onKapat}
        >
          ×
        </button>
        <h2 className="tel-dogrulama__title" id="tel-dogrulama-baslik">
          {t.sms.title}
        </h2>
        <p className="tel-dogrulama__lead">{interpolate(t.sms.lead, { phone: maske })}</p>

        <label className="tel-dogrulama__field">
          <span className="tel-dogrulama__label">{t.sms.codeLabel}</span>
          <input
            ref={input}
            className={`tel-dogrulama__input${hata ? " tel-dogrulama__input--error" : ""}`}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={SMS_KOD_UZUNLUGU}
            value={kod}
            disabled={dogruluyor || !kodGecerli}
            onChange={(event) => kodYaz(event.target.value)}
          />
        </label>

        <p className="tel-dogrulama__hint">
          {gonderiyor
            ? t.sms.sending
            : kodGecerli
              ? interpolate(t.sms.expiresIn, { s: kalanSure })
              : bitis
                ? t.sms.expired
                : ""}
        </p>

        {hata ? <p className="tel-dogrulama__error">{hata}</p> : null}

        <button
          type="submit"
          className="tel-dogrulama__primary"
          disabled={dogruluyor || !kodGecerli || kod.length !== SMS_KOD_UZUNLUGU}
        >
          {dogruluyor ? t.sms.verifying : t.sms.verify}
        </button>

        <div className="tel-dogrulama__links">
          <button
            type="button"
            className="tel-dogrulama__link"
            disabled={gonderiyor || kalanTekrar > 0}
            onClick={() => void yenidenGonder()}
          >
            {kalanTekrar > 0
              ? interpolate(t.sms.resendIn, { s: kalanTekrar })
              : t.sms.resend}
          </button>
          <button type="button" className="tel-dogrulama__link" onClick={onKapat}>
            {t.sms.changeNumber}
          </button>
        </div>
      </form>
    </div>
  );
}

interface AktifDogrulama {
  phone: string;
  ilk: IlkGonderim;
}

export function useTelefonDogrulama(): {
  dogrula: (phone: string) => Promise<boolean>;
  modal: ReactNode;
} {
  const t = useT();
  const [aktif, setAktif] = useState<AktifDogrulama | null>(null);
  const cozucu = useRef<((sonuc: boolean) => void) | null>(null);

  const dogrula = useCallback(
    async (phone: string) => {
      const ilk = await kodGonder(phone, t.sms.failed);
      if (ilk.durum === "dogrulandi") return true;
      return new Promise<boolean>((resolve) => {
        cozucu.current = resolve;
        setAktif({ phone, ilk });
      });
    },
    [t.sms.failed],
  );

  const bitir = useCallback((sonuc: boolean) => {
    cozucu.current?.(sonuc);
    cozucu.current = null;
    setAktif(null);
  }, []);

  const onDogrulandi = useCallback(() => bitir(true), [bitir]);
  const onKapat = useCallback(() => bitir(false), [bitir]);

  // Kartlardaki transform/overflow `position: fixed`i bozmasın diye body'ye.
  const modal = aktif
    ? createPortal(
        <TelefonDogrulamaModali
          phone={aktif.phone}
          ilk={aktif.ilk}
          onDogrulandi={onDogrulandi}
          onKapat={onKapat}
        />,
        document.body,
      )
    : null;

  return { dogrula, modal };
}
