/**
 * Satın alma onayı ve ödeme.
 *
 * Önce seçilen teklif özeti ve sigorta şirketi ödeme ekranına yönlendirme
 * bilgisi gösterilir. IO yanıtında harici ödeme bağlantısı varsa yeni sekmede
 * açılır; aksi hâlde kart bilgileri yalnızca bu adımda toplanıp doğrudan
 * sigorta şirketinin sanal POS altyapısına iletilir (sistemde saklanmaz).
 */

import { useState } from "react";
import BilgiNotu from "./BilgiNotu";
import IlerlemePaneli from "./IlerlemePaneli";
import { ODEME_MESAJLARI } from "./beklemeMetinleri";
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
          <span className="flow__modal-taksit">{teklif.Taksit}</span>
        ) : null}
      </span>
    </div>
  );

  const odemeEkraninaGec = () => {
    setHata("");

    if (odemeUrl) {
      const yeniSekme = window.open(odemeUrl, "_blank", "noopener,noreferrer");
      if (!yeniSekme) {
        setHata(
          "Ödeme ekranı açılamadı. Tarayıcınızın açılır pencere engelini kapatıp tekrar deneyin.",
        );
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
      setHata("Kart sahibinin adını girin.");
      return;
    }
    if (rakamlar.length < 15) {
      setHata("Kart numarasını eksiksiz girin.");
      return;
    }
    if (!ay || !yil) {
      setHata("Son kullanma tarihini seçin.");
      return;
    }
    if (cvv.length < 3) {
      setHata("Güvenlik kodunu girin.");
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
          : "Ödeme tamamlanamadı. Lütfen tekrar deneyin.",
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
        aria-label="Ödeme"
      >
        <div className="flow__modal">
          {ozet}
          <IlerlemePaneli
            baslik="Ödemeniz işleniyor"
            mesajlar={ODEME_MESAJLARI}
            tahminiSaniye={25}
            not="Lütfen bu ekranı kapatmayın. İşlem tamamlandığında poliçeniz ve makbuzunuz görüntülenecek."
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
            aria-label="Kapat"
          >
            ×
          </button>

          {ozet}

          <h2 className="flow__modal-title" id="odeme-onay-baslik">
            Teklifinizi seçtiniz
          </h2>
          <p className="flow__modal-text">
            Ödeme işleminizi tamamlamak için sigorta şirketinin güvenli ödeme
            ekranına yönlendirileceksiniz. Kart bilgilerinizi yalnızca bu ekranda
            girersiniz; kart numaranız, son kullanma tarihiniz ve CVV bilginiz
            Sigorta Uzmanı tarafından görülmez veya saklanmaz.
          </p>

          {odemeUrl ? (
            <p className="flow__modal-note">
              Ödeme bağlantısı: <strong>{odemeUrlEtiketi(odemeUrl)}</strong>{" "}
              (yeni sekmede açılacaktır)
            </p>
          ) : null}

          {hata ? <p className="flow__warning">{hata}</p> : null}

          <button
            type="button"
            className="flow__primary flow__primary--block"
            onClick={odemeEkraninaGec}
          >
            Sigorta Şirketinin Ödeme Ekranına Geç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flow__overlay" role="dialog" aria-modal="true" aria-label="Ödeme">
      <div className="flow__modal">
        <button
          type="button"
          className="flow__modal-close"
          onClick={onKapat}
          aria-label="Kapat"
        >
          ×
        </button>

        {ozet}

        <p className="flow__modal-text">
          Kart bilgileriniz yalnızca sigorta şirketinin sanal POS altyapısına
          iletilir; Sigorta Uzmanı tarafından görülmez veya saklanmaz.
        </p>

        <div className="flow__grid">
          <label className="flow__field flow__field--full">
            <span className="flow__label">Kart sahibi adı soyadı</span>
            <input
              className="flow__input"
              autoComplete="cc-name"
              value={kartSahibi}
              onChange={(event) => setKartSahibi(event.target.value.toUpperCase())}
            />
          </label>

          <label className="flow__field flow__field--full">
            <span className="flow__label">Kimlik numarası</span>
            <input
              className="flow__input"
              inputMode="numeric"
              maxLength={11}
              value={kimlik}
              onChange={(event) => setKimlik(event.target.value.replace(/\D/g, ""))}
            />
          </label>

          <label className="flow__field flow__field--full">
            <span className="flow__label">Kredi kartı numarası</span>
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
            <span className="flow__label">Ay</span>
            <select
              className="flow__input"
              autoComplete="cc-exp-month"
              value={ay}
              onChange={(event) => setAy(event.target.value)}
            >
              <option value="">Ay</option>
              {AYLAR.map((deger) => (
                <option key={deger} value={deger}>
                  {deger}
                </option>
              ))}
            </select>
          </label>

          <label className="flow__field">
            <span className="flow__label">Yıl</span>
            <select
              className="flow__input"
              autoComplete="cc-exp-year"
              value={yil}
              onChange={(event) => setYil(event.target.value)}
            >
              <option value="">Yıl</option>
              {yilSecenekleri().map((deger) => (
                <option key={deger} value={deger}>
                  {deger}
                </option>
              ))}
            </select>
          </label>

          <label className="flow__field">
            <span className="flow__label">CVV</span>
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
          Ödemeyi tamamla
        </button>

        <BilgiNotu>
          İşlem sonrasında kartınızın yalnızca son dört hanesi kayıtlarınızda
          görünür.
        </BilgiNotu>
      </div>
    </div>
  );
}
