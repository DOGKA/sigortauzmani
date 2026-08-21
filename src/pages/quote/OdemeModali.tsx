/**
 * Adım 4 — Ödeme.
 *
 * Partner CRM'indeki ödeme ekranının sadeleştirilmiş hâli. Kaldırılanlar ve
 * nedenleri:
 * - Daini Mürtehin: self serviste her zaman "Yok"; alan gösterilmiyor.
 * - Ödeme Şekli: her zaman Sanal POS; sunucuda sabit gönderiliyor.
 * - 3D Secure anahtarı: Sigorta Gross tarafında çalışmıyor, partner de
 *   kapalı geçiyor. Sunucudaki IO_3DS_ENABLED ile yönetiliyor.
 * - "Onay Al" butonu: müşteri akışında karşılığı yok.
 *
 * Kart bilgileri yalnızca bu bileşenin state'inde tutuluyor; hiçbir yere
 * yazılmıyor, kaydedilmiyor.
 */

import { useState } from "react";
import BilgiNotu from "./BilgiNotu";
import IlerlemePaneli from "./IlerlemePaneli";
import { ODEME_MESAJLARI } from "./beklemeMetinleri";
import { fiyatGosterimi } from "./fiyatlandirma";
import { IoError, satinAl } from "../../lib/io/client";
import type { SatinAlmaSonuc, SirketTeklifi } from "../../lib/io/types";

const paraBirimi = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

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
  const [kartSahibi, setKartSahibi] = useState("");
  const [kimlik, setKimlik] = useState(kimlikNo);
  const [kartNo, setKartNo] = useState("");
  const [ay, setAy] = useState("");
  const [yil, setYil] = useState("");
  const [cvv, setCvv] = useState("");
  const [hata, setHata] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

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

  const gosterim = fiyatGosterimi(teklif.Prim);

  const ozet = (
    <div className="flow__modal-head">
      <span className="flow__modal-sirket">{teklif.SirketAdi}</span>

      {gosterim ? (
        <span className="flow__teklif-fiyat">
          <span className="flow__teklif-liste">
            {paraBirimi.format(gosterim.listeFiyati)}
          </span>
          <span className="flow__teklif-kazanc">
            {paraBirimi.format(gosterim.kazanc)} kazanç
          </span>
        </span>
      ) : null}

      {/* Ödenecek tutar her zaman en altta ve en büyük punto. */}
      <span className="flow__modal-odenecek">
        <strong className="flow__modal-prim">
          {typeof teklif.Prim === "number" ? paraBirimi.format(teklif.Prim) : "—"}
        </strong>
        {teklif.Taksit ? (
          <span className="flow__modal-taksit">{teklif.Taksit}</span>
        ) : null}
      </span>
    </div>
  );

  // Ödeme sürerken kapatma ve form alanları gösterilmiyor: mükerrer çekim
  // riskini doğuracak her etkileşim kapalı kalıyor.
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
          onClick={odemeYap}
        >
          Ödeme yap
        </button>

        <BilgiNotu>
          Kart bilgileriniz yalnızca poliçe primini tahsil etmek için sigorta
          şirketinin sanal POS altyapısına iletilir; sistemlerimizde
          saklanmaz. İşlem sonrasında kartınızın yalnızca son dört hanesi
          kayıtlarınızda görünür.
        </BilgiNotu>
      </div>
    </div>
  );
}
