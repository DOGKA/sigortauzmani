/**
 * Satın alma onayı ve ödeme.
 *
 * Önce seçilen teklif özeti ve sigorta şirketi ödeme ekranına yönlendirme
 * bilgisi gösterilir. IO yanıtında harici ödeme bağlantısı varsa yeni sekmede
 * açılır; aksi hâlde kart bilgileri yalnızca bu adımda toplanıp doğrudan
 * sigorta şirketinin sanal POS altyapısına iletilir (sistemde saklanmaz).
 */

import { useState } from "react";
import { useT } from "../../lib/i18n/context";
import { interpolate, localizeInstallment } from "../../lib/i18n/format";
import IlerlemePaneli from "./IlerlemePaneli";
import { odemeUrlEtiketi, odemeUrlOku } from "./odemeUrl";
import { formatPrim } from "./paraBirimi";
import { IoError, satinAl } from "../../lib/io/client";
import type { SatinAlmaSonuc, SirketTeklifi } from "../../lib/io/types";

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

type Asama = "onay" | "pos";

interface Props {
  oturumId: string;
  bransNo: number;
  teklifId: number;
  teklif: SirketTeklifi;
  kimlikNo: string;
  onKapat: () => void;
  onBasarili: (sonuc: SatinAlmaSonuc) => void;
}

export default function OdemeModali({
  oturumId,
  bransNo,
  teklifId,
  teklif,
  kimlikNo,
  onKapat,
  onBasarili,
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

  const odemeUrl = odemeUrlOku(teklif);

  const ozet = (
    <div className="flow__modal-head">
      <span className="flow__modal-sirket">{teklif.SirketAdi}</span>

      <span className="flow__modal-odenecek">
        <strong className="flow__modal-prim">
          {formatPrim(teklif.Prim, bransNo)}
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
      });
      onBasarili(sonuc);
    } catch (error) {
      setHata(
        error instanceof IoError
          ? error.message
          : t.flow.pay.errFail,
      );
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
          {t.flow.pay.complete}
        </button>
      </div>
    </div>
  );
}
