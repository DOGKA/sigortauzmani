/**
 * Satın alma onayı ve ödeme.
 *
 * Önce seçilen teklif özeti ve sigorta şirketi ödeme ekranına yönlendirme
 * bilgisi gösterilir. IO yanıtında harici ödeme bağlantısı varsa yeni sekmede
 * açılır; aksi hâlde kart bilgileri yalnızca bu adımda toplanıp doğrudan
 * sigorta şirketinin sanal POS altyapısına iletilir (sistemde saklanmaz).
 */

import { useEffect, useRef, useState } from "react";
import { useT } from "../../lib/i18n/context";
import { interpolate, localizeInstallment } from "../../lib/i18n/format";
import IlerlemePaneli from "./IlerlemePaneli";
import { odemeUrlEtiketi, odemeUrlOku } from "./odemeUrl";
import { formatPrim } from "./paraBirimi";
import { IoError, satinAl, ucDDurum } from "../../lib/io/client";
import type { SatinAlmaSonuc, SirketTeklifi } from "../../lib/io/types";

type UcDYonlendirme = NonNullable<SatinAlmaSonuc["ucDSecure"]>;

const UCD_SORGU_ARALIGI_MS = 5_000;
const UCD_AZAMI_BEKLEME_MS = 10 * 60 * 1000;

/** Kart numarasını 4'erli gruplar hâlinde gösterir; sunucuya rakamlar gider. */
function formatKartNo(value: string): string {
  const rakamlar = value.replace(/\D/g, "").slice(0, 19);
  return rakamlar.replace(/(.{4})/g, "$1 ").trim();
}

function yilSecenekleri(): string[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 16 }, (_, index) => String(current + index));
}

const AYLAR = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

type Asama = "onay" | "pos" | "ucd";

interface Props {
  oturumId: string;
  bransNo: number;
  teklifId: number;
  teklif: SirketTeklifi;
  kimlikNo: string;
  onKapat: () => void;
  onBasarili: (sonuc: SatinAlmaSonuc) => void;
  /** Ön kontrolde şirketin verdiği güncel prim; ziyaretçi onaylayacak. */
  baslangicPrim?: number | null;
  /**
   * Şirket ödemede satın almayı reddetti (kart sorunu değil). Kart ekranı
   * kapanır, ayrı uyarı "Teklif iste" yolunu gösterir.
   */
  onSirketReddi: (mesaj: string) => void;
}

export default function OdemeModali({
  oturumId,
  bransNo,
  teklifId,
  teklif,
  kimlikNo,
  onKapat,
  onBasarili,
  baslangicPrim = null,
  onSirketReddi,
}: Props) {
  const t = useT();
  const [asama, setAsama] = useState<Asama>("onay");
  const [kartSahibi, setKartSahibi] = useState("");
  const [kimlik, setKimlik] = useState(kimlikNo);
  const [kartNo, setKartNo] = useState("");
  const [ay, setAy] = useState("");
  const [yil, setYil] = useState("");
  const [cvv, setCvv] = useState("");
  const [hata, setHata] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  // Şirket ödeme öncesi yenilemede primi değiştirdiyse kart çekilmiyor;
  // ziyaretçi yeni tutarı onaylayana kadar burada tutuluyor.
  const [yeniPrim, setYeniPrim] = useState<number | null>(baslangicPrim);
  const [ucd, setUcd] = useState<UcDYonlendirme | null>(null);
  const [ucdKontrol, setUcdKontrol] = useState(false);
  const [ucdMesaj, setUcdMesaj] = useState("");
  const ucdBitti = useRef(false);
  const onBasariliRef = useRef(onBasarili);
  onBasariliRef.current = onBasarili;

  const odemeUrl = odemeUrlOku(teklif);

  const ucdSorgula = async (elle: boolean) => {
    if (ucdBitti.current) return;
    if (elle) {
      setUcdKontrol(true);
      setUcdMesaj("");
    }
    try {
      const durum = await ucDDurum({
        oturumId,
        bransNo,
        teklifId,
        sirketTeklifId: teklif.Id,
        sirketKodu: teklif.SirketKodu,
      });
      if (durum.policeKesildi && !ucdBitti.current) {
        ucdBitti.current = true;
        onBasariliRef.current({
          policeKesildi: true,
          policeNo: durum.policeNo ?? null,
          policePdfUrl: durum.policePdfUrl ?? null,
          makbuzPdfUrl: durum.makbuzPdfUrl ?? null,
          kartSon4: durum.kartSon4 ?? "",
        });
        return;
      }
      if (elle) setUcdMesaj(t.flow.pay.ucdNotYet);
    } catch {
      if (elle) setUcdMesaj(t.flow.pay.ucdNotYet);
    } finally {
      if (elle) setUcdKontrol(false);
    }
  };
  const ucdSorgulaRef = useRef(ucdSorgula);
  ucdSorgulaRef.current = ucdSorgula;

  // Banka ekranı açıkken poliçe arka planda takip ediliyor; müşteri şifreyi
  // girdiğinde ayrıca bir şey yapması gerekmiyor.
  useEffect(() => {
    if (asama !== "ucd") return;
    const baslangic = Date.now();
    const zamanlayici = window.setInterval(() => {
      if (Date.now() - baslangic > UCD_AZAMI_BEKLEME_MS) {
        window.clearInterval(zamanlayici);
        setUcdMesaj(t.flow.pay.ucdTimeout);
        return;
      }
      void ucdSorgulaRef.current(false);
    }, UCD_SORGU_ARALIGI_MS);
    return () => window.clearInterval(zamanlayici);
  }, [asama, t.flow.pay.ucdTimeout]);

  const ucdYeniSekme = () => {
    if (!ucd) return;
    if ("url" in ucd) {
      window.open(ucd.url, "_blank", "noopener,noreferrer");
      return;
    }
    const pencere = window.open("", "_blank");
    if (!pencere) {
      setUcdMesaj(t.flow.pay.popupBlocked);
      return;
    }
    pencere.document.open();
    pencere.document.write(ucd.html);
    pencere.document.close();
  };
  const odenecekPrim = yeniPrim ?? teklif.Prim;

  const ozet = (
    <div className="flow__modal-head">
      <span className="flow__modal-sirket">{teklif.SirketAdi}</span>

      <span className="flow__modal-odenecek">
        <strong className="flow__modal-prim">
          {formatPrim(odenecekPrim, bransNo)}
        </strong>
        {teklif.Taksit ? (
          <span className="flow__modal-taksit">
            {localizeInstallment(teklif.Taksit, t.flow.offers)}
          </span>
        ) : null}
      </span>
    </div>
  );

  const odemeEkraninaGec = () => {
    setHata("");

    if (odemeUrl) {
      const yeniSekme = window.open(odemeUrl, "_blank", "noopener,noreferrer");
      if (!yeniSekme) {
        setHata(t.flow.pay.popupBlocked);
        return;
      }
      onKapat();
      return;
    }

    setAsama("pos");
  };

  const odemeYap = async () => {
    setHata("");

    const rakamlar = kartNo.replace(/\D/g, "");
    if (!kartSahibi.trim()) {
      setHata(t.flow.pay.errName);
      return;
    }
    if (rakamlar.length < 15) {
      setHata(t.flow.pay.errCard);
      return;
    }
    if (!ay || !yil) {
      setHata(t.flow.pay.errExpiry);
      return;
    }
    if (cvv.length < 3) {
      setHata(t.flow.pay.errCvv);
      return;
    }

    setGonderiliyor(true);
    try {
      const sonuc = await satinAl({
        oturumId,
        bransNo,
        teklifId,
        teklif: {
          Id: teklif.Id,
          SirketKodu: teklif.SirketKodu,
          AcenteKodu: teklif.AcenteKodu,
          TeklifNo: teklif.TeklifNo,
          isWebServis: teklif.isWebServis,
          Prim: teklif.Prim,
          Taksit: teklif.Taksit,
          TaksitKodu: teklif.TaksitKodu,
        },
        kart: {
          KartSahibi: kartSahibi.trim(),
          KimlikNo: kimlik,
          KartNo: rakamlar,
          SonKullanimAy: ay,
          SonKullanimYil: yil,
          Cvv2: cvv,
        },
        // Onaylanan tutar gönderilmezse sunucu değişikliği tekrar sorar.
        ...(yeniPrim !== null ? { onaylananPrim: yeniPrim } : {}),
      });
      if (sonuc.ucDSecure) {
        setUcd(sonuc.ucDSecure);
        setAsama("ucd");
        return;
      }
      onBasarili(sonuc);
    } catch (error) {
      if (error instanceof IoError && error.sirketReddi) {
        onSirketReddi(error.message);
        return;
      }
      setHata(
        error instanceof IoError
          ? error.message
          : t.flow.pay.errFail,
      );
      // Yeni tutar geldiğinde özet o tutara dönüyor; ziyaretçi "Ödemeyi
      // tamamla"ya bir daha basarak onaylıyor.
      if (error instanceof IoError && error.yeniPrim !== null) {
        setYeniPrim(error.yeniPrim);
      }
    } finally {
      setGonderiliyor(false);
    }
  };

  if (gonderiliyor) {
    return (
      <div
        className="flow__overlay"
        role="dialog"
        aria-modal="true"
        aria-label={t.flow.pay.title}
      >
        <div className="flow__modal">
          {ozet}
          <IlerlemePaneli
            baslik={t.flow.pay.processing}
            mesajlar={[...t.flow.pay.msgs]}
            tahminiSaniye={25}
            not={t.flow.pay.processingNot}
          />
        </div>
      </div>
    );
  }

  if (asama === "ucd" && ucd) {
    return (
      <div
        className="flow__overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="odeme-ucd-baslik"
      >
        <div className="flow__modal">
          <button
            type="button"
            className="flow__modal-close"
            onClick={onKapat}
            aria-label={t.flow.close}
          >
            ×
          </button>

          {ozet}

          <h2 className="flow__modal-title" id="odeme-ucd-baslik">
            {t.flow.pay.ucdTitle}
          </h2>
          <p className="flow__modal-lead">{t.flow.pay.ucdLead}</p>

          {/* Banka sayfası kendi alan adına geçiyor; çerezlerinin çalışması
              için allow-same-origin gerekli. Üst pencereyi kendiliğinden
              değiştirmesine izin verilmiyor, sonuç takipten okunuyor. */}
          <iframe
            className="flow__ucd-frame"
            title={t.flow.pay.ucdTitle}
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
            {...("html" in ucd ? { srcDoc: ucd.html } : { src: ucd.url })}
          />

          <button type="button" className="flow__ucd-link" onClick={ucdYeniSekme}>
            {t.flow.pay.ucdNewTab}
          </button>

          {ucdMesaj ? <p className="flow__warning">{ucdMesaj}</p> : null}

          <button
            type="button"
            className="flow__primary flow__primary--block"
            disabled={ucdKontrol}
            onClick={() => void ucdSorgula(true)}
          >
            {ucdKontrol ? t.flow.pay.ucdWaiting : t.flow.pay.ucdCheck}
          </button>
        </div>
      </div>
    );
  }

  if (asama === "onay") {
    return (
      <div
        className="flow__overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="odeme-onay-baslik"
      >
        <div className="flow__modal">
          <button
            type="button"
            className="flow__modal-close"
            onClick={onKapat}
            aria-label={t.flow.close}
          >
            ×
          </button>

          {ozet}

          <h2 className="flow__modal-title" id="odeme-onay-baslik">
            {t.flow.pay.goPay}
          </h2>
          <p className="flow__modal-lead">
            {odemeUrl
              ? interpolate(t.flow.pay.leadExternal, { company: teklif.SirketAdi })
              : interpolate(t.flow.pay.leadInternal, { company: teklif.SirketAdi })}
          </p>

          <ul className="flow__modal-noktalar">
            <li>{t.flow.pay.bullet1}</li>
            <li>{t.flow.pay.bullet2}</li>
          </ul>

          {odemeUrl ? (
            <p className="flow__modal-note">
              {t.flow.pay.link}: <strong>{odemeUrlEtiketi(odemeUrl)}</strong>
            </p>
          ) : null}

          {yeniPrim !== null ? (
            <p className="flow__warning">{t.flow.pay.priceChanged}</p>
          ) : null}

          {hata ? <p className="flow__warning">{hata}</p> : null}

          <button
            type="button"
            className="flow__primary flow__primary--block"
            onClick={odemeEkraninaGec}
          >
            {odemeUrl ? t.flow.pay.openPage : t.flow.pay.goToPay}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flow__overlay" role="dialog" aria-modal="true" aria-label={t.flow.pay.title}>
      <div className="flow__modal">
        <button
          type="button"
          className="flow__modal-close"
          onClick={onKapat}
          aria-label={t.flow.close}
        >
          ×
        </button>

        {ozet}

        <p className="flow__modal-lead">{t.flow.pay.cardLead}</p>

        <div className="flow__grid">
          <label className="flow__field flow__field--full">
            <span className="flow__label">{t.flow.pay.cardholder}</span>
            <input
              className="flow__input"
              autoComplete="cc-name"
              value={kartSahibi}
              onChange={(event) => setKartSahibi(event.target.value.toUpperCase())}
            />
          </label>

          <label className="flow__field flow__field--full">
            <span className="flow__label">{t.flow.pay.idNo}</span>
            <input
              className="flow__input"
              inputMode="numeric"
              maxLength={11}
              value={kimlik}
              onChange={(event) => setKimlik(event.target.value.replace(/\D/g, ""))}
            />
          </label>

          <label className="flow__field flow__field--full">
            <span className="flow__label">{t.flow.pay.cardNo}</span>
            <input
              className="flow__input"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              value={kartNo}
              onChange={(event) => setKartNo(formatKartNo(event.target.value))}
            />
          </label>

          <label className="flow__field">
            <span className="flow__label">{t.flow.pay.month}</span>
            <select
              className="flow__input"
              autoComplete="cc-exp-month"
              value={ay}
              onChange={(event) => setAy(event.target.value)}
            >
              <option value="">{t.flow.pay.month}</option>
              {AYLAR.map((deger) => (
                <option key={deger} value={deger}>
                  {deger}
                </option>
              ))}
            </select>
          </label>

          <label className="flow__field">
            <span className="flow__label">{t.flow.pay.year}</span>
            <select
              className="flow__input"
              autoComplete="cc-exp-year"
              value={yil}
              onChange={(event) => setYil(event.target.value)}
            >
              <option value="">{t.flow.pay.year}</option>
              {yilSecenekleri().map((deger) => (
                <option key={deger} value={deger}>
                  {deger}
                </option>
              ))}
            </select>
          </label>

          <label className="flow__field">
            <span className="flow__label">{t.flow.pay.cvv}</span>
            <input
              className="flow__input"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              value={cvv}
              onChange={(event) => setCvv(event.target.value.replace(/\D/g, ""))}
            />
          </label>
        </div>

        {hata ? <p className="flow__warning">{hata}</p> : null}

        <button
          type="button"
          className="flow__primary flow__primary--block"
          onClick={() => void odemeYap()}
        >
          {yeniPrim !== null ? t.flow.pay.approveNew : t.flow.pay.complete}
        </button>
      </div>
    </div>
  );
}
